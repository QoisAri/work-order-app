// middleware.ts
import { updateSession } from '@/utils/supabase/middleware'
import { type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    // Gunakan matcher dari kode lama Anda
    '/((?!_next/static|_next/image|favicon.ico|auth).*)',
  ],
}