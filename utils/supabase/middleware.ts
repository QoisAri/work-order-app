// utils/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
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
        set(name: string, value: string, options) {
          // ... (kode ini tetap sama)
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options) {
          // ... (kode ini tetap sama)
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Ambil data user saat ini
  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // --- MULAI LOGIKA LAMA ANDA ---

  // 1. Jika user belum login, arahkan ke halaman login
  if (!user && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // 2. Jika user sudah login
  if (user) {
    // Arahkan dari halaman login ke home jika sudah login
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    // Ambil role dari tabel 'profiles'
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = profile?.role

    // Arahkan berdasarkan role
    if ((userRole === 'admin' || userRole === 'engineer') && !pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    if (userRole === 'pemohon' && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', request.url)) // Cegah pemohon akses admin
    }
  }

  // --- SELESAI LOGIKA LAMA ANDA ---

  // Jika tidak ada kondisi redirect yang terpenuhi, lanjutkan request seperti biasa
  return response
}