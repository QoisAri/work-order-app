import { createServerClient, type CookieOptions } from '@supabase/ssr'
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
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Halaman yang bisa diakses publik tanpa login
  // Halaman submit-work-order adalah tempat user melengkapi profil
  const publicPages = ['/login', '/submit-work-order'];

  // Jika user belum login dan mencoba akses halaman yang dilindungi
  if (!user && !publicPages.includes(pathname) && !pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Jika user sudah login
  if (user) {
    // Jika sudah login tapi masih di halaman login, arahkan ke halaman utama
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Ambil status kelengkapan profil dan role dari tabel 'profiles'
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_profile_complete, role')
      .eq('id', user.id)
      .single();

    // LOGIKA PROFIL:
    // Jika profil belum lengkap DAN user tidak sedang di halaman untuk melengkapi profil,
    // paksa user ke halaman tersebut.
    if (profile && !profile.is_profile_complete && pathname !== '/submit-work-order') {
      return NextResponse.redirect(new URL('/submit-work-order', request.url));
    }
    
    // Jika profil SUDAH lengkap DAN user mencoba kembali ke halaman profil,
    // arahkan ke dasbor utama.
    if (profile && profile.is_profile_complete && pathname === '/submit-work-order') {
       return NextResponse.redirect(new URL('/', request.url));
    }

    // LOGIKA ROLE:
    const userRole = profile?.role;
    // Jika admin/engineer tapi tidak di halaman admin, arahkan ke /admin
    if ((userRole === 'admin' || userRole === 'engineer') && !pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    // Jika pemohon mencoba akses halaman admin, tendang ke halaman utama
    if (userRole === 'pemohon' && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Lanjutkan request jika tidak ada kondisi redirect yang terpenuhi
  return response
}