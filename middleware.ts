// middleware.ts
import { updateSession } from '@/utils/supabase/middleware'
import { type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - auth (Supabase auth helpers)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|auth|favicon.ico).*)',
  ],
}