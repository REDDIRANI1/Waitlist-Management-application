import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const session = req.cookies.get('session');
  const { pathname } = req.nextUrl;

  // Protect User application form
  if (pathname.startsWith('/apply')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
  }

  // Protect Admin dashboard page
  if (pathname.startsWith('/admin/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  // Prevent logged-in users from seeing Auth pages
  if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup')) {
    if (session) {
      return NextResponse.redirect(new URL('/apply', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/apply/:path*', '/admin/dashboard/:path*', '/auth/login', '/auth/signup'],
};
