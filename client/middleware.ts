import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // NOTE: Appwrite Client SDK stores sessions in localStorage, not HTTP cookies
  // that middleware can access. Therefore, we CANNOT reliably check authentication
  // in middleware when using the client SDK.
  // 
  // Instead, we rely on:
  // 1. Client-side protection in dashboard/layout.tsx
  // 2. API calls will fail if not authenticated
  // 
  // This middleware only handles basic flow control:
  
  // Allow all dashboard access - protection handled by client-side layout
  if (pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  // Allow signin page access
  if (pathname.startsWith('/signin')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/signin',
  ],
};
