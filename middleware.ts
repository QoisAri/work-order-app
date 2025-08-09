import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  const { pathname } = request.nextUrl;

  // Jika user belum login, arahkan ke halaman login
  if (!user && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Jika user sudah login
  if (user) {
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Ambil role dari tabel 'profiles'
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const userRole = profile?.role;

    // Arahkan berdasarkan role
    if ((userRole === 'admin' || userRole === 'engineer') && !pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (userRole === 'pemohon' && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', request.url)); // Cegah pemohon akses admin
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth).*)', // Abaikan path internal next & auth
  ],
}