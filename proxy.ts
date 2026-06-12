import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage =
    req.nextUrl.pathname.startsWith('/login') ||
    req.nextUrl.pathname.startsWith('/register')

  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  // Захист адмін-панелі — тільки moderator
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const role = (req.auth?.user as any)?.role
    if (role !== 'moderator') {
      return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/character/:path*',
    '/encounter/:path*',
    '/chat/:path*',
    '/wiki/:path*',
    '/admin/:path*',
    '/dice/:path*',
  ],
}
