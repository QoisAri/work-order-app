// utils/supabase/middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // Setup Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Halaman publik yang tidak memerlukan login
  const publicPages = ['/login',];

  // 1. Logika untuk Pengguna yang Belum Login
  if (!user) {
    // Jika mencoba akses halaman yang dilindungi, arahkan ke login
    if (!publicPages.includes(pathname) && !pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Jika tidak, biarkan akses (misalnya ke halaman login itu sendiri)
    return response;
  }

  // 2. Logika untuk Pengguna yang Sudah Login
  // Ambil data profil (termasuk role dan status kelengkapan)
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_profile_complete, role')
    .eq('id', user.id)
    .single();

  // Jika masih di halaman login, arahkan ke halaman utama
  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Jika profil belum lengkap, paksa isi profil terlebih dahulu
  if (profile && !profile.is_profile_complete && pathname !== '/submit-work-order') {
    return NextResponse.redirect(new URL('/submit-work-order', request.url));
  }

  // Jika profil sudah lengkap
  if (profile && profile.is_profile_complete) {
    // Jangan biarkan user kembali ke form submit

    // Logika pengalihan berdasarkan peran (Role-based redirect)
    const userRole = profile.role;
    if ((userRole === 'admin' || userRole === 'engineer') && !pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // Jika tidak ada aturan redirect yang cocok, lanjutkan request
  return response;
}