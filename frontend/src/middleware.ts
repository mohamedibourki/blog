import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("accessToken")?.value;
  const protectedPaths = [
    "/dashboard",
    "/new-post",
    "/edit-post",
    "/my-posts",
    "/profile",
  ];
  const authPaths = ["/login", "/register", "/verify-email"];

  if (protectedPaths.some((p) => req.nextUrl.pathname.startsWith(p)) && !token)
    return NextResponse.redirect(new URL("/login", req.url));

  if (authPaths.some((p) => req.nextUrl.pathname.startsWith(p)) && token)
    return NextResponse.redirect(new URL("/", req.url));

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
