// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, refreshToken } from "@/lib/auth";

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get('accessToken')?.value;
  const refreshTokenValue = req.cookies.get('refreshToken')?.value;
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

  // 1. Handle auth pages
  if (isAuthPage) {
    try {
      if (accessToken && await verifyToken(accessToken)) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }

      if (refreshTokenValue) {
        try {
          const { accessToken: newAccessToken } = await refreshToken(refreshTokenValue);
          const response = NextResponse.redirect(new URL('/dashboard', req.url));
          setSecureCookie(response, 'accessToken', newAccessToken);
          return response;
        } catch {
          const response = NextResponse.next();
          clearAuthCookies(response);
          return response;
        }
      }
      return NextResponse.next();
    } catch {
      const response = NextResponse.next();
      clearAuthCookies(response);
      return response;
    }
  }

  // 2. Handle protected routes
  try {
    if (accessToken && await verifyToken(accessToken)) {
      return NextResponse.next();
    }

    if (refreshTokenValue) {
      try {
        const result = await refreshToken(refreshTokenValue);
        if (!result?.accessToken) throw new Error('Invalid refresh response');
        
        const response = NextResponse.next();
        setSecureCookie(response, 'accessToken', result.accessToken);
        
        if (result.refreshToken) {
          setSecureCookie(response, 'refreshToken', result.refreshToken);
        }
        return response;
      } catch (error) {
        console.error('Refresh failed:', error);
        throw new Error('Refresh failed');
      }
    }
    throw new Error('No valid tokens');
  } catch (error) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    clearAuthCookies(response);
    return response;
  }
}

// Updated helper functions
function setSecureCookie(response: NextResponse, name: string, value: string) {
  response.cookies.set({
    name,
    value,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: name === 'accessToken' ? 60 * 15 : 60 * 60 * 24 * 7 // 15m or 7d
  });
}

function clearAuthCookies(response: NextResponse) {
  ['accessToken', 'refreshToken'].forEach(name => {
    response.cookies.set({
      name,
      value: '',
      maxAge: -1 // Expire immediately
    });
  });
}