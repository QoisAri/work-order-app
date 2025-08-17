// middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // --- 1. Logika untuk Pengguna yang Belum Login ---
  if (!user) {
    if (pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return response;
  }

  // --- 2. Logika untuk Pengguna yang Sudah Login ---
  // Ambil role DAN status kelengkapan profil
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_profile_complete')
    .eq('id', user.id)
    .single();

  const userRole = profile?.role;
  const isProfileComplete = profile?.is_profile_complete;

  // --- PERBAIKAN: Logika baru berdasarkan peran ---

  // Jika pengguna adalah ADMIN
  if (userRole === 'admin') {
    // Jika mencoba login, arahkan ke admin
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    // Jika belum di halaman admin, arahkan ke sana
    if (!pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  } 
  // Jika pengguna BUKAN ADMIN
  else {
    // Jika mencoba akses halaman admin, tendang ke dashboard
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Jika profil belum lengkap, paksa ke halaman submit WO
    if (!isProfileComplete && pathname !== '/submit-work-order') {
        return NextResponse.redirect(new URL('/submit-work-order', request.url));
    }
    // Jika sudah login tapi masih di halaman login, arahkan ke dashboard
    if (pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
