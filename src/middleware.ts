import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  // Protect all /app routes: redirect unauthenticated users to /login
  if (pathname.startsWith("/app")) {
    if (!sessionCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // NOTE: Do not redirect /login in middleware based solely on cookie existence.
  // Stale or expired cookies would cause an infinite redirect loop between
  // middleware (/login -> /app/templates) and requireAuth (/app/templates -> /login).
  // /login is safely handled server-side in src/app/login/page.tsx with getCurrentUser().

  return NextResponse.next();
}


export const config = {
  matcher: [
    "/app/:path*",
  ],
};

