import { NextResponse, type NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";
import { COOKIE_KEYS } from "@/libs/core/constants/cookie";

// Chưa đăng nhập thì không được vào
const PRIVATE_ROUTES = ["/account", "/users", "/roles"];

// Đã đăng nhập thì không cần vào
const PUBLIC_ONLY_ROUTES = ["/", "/forgot-password"];

const matchesRoute = (pathname: string, route: string): boolean =>
  pathname === route || pathname.startsWith(`${route}/`);

// Refresh token còn tồn tại và chưa hết hạn
const hasValidRefreshToken = (request: NextRequest): boolean => {
  const token = request.cookies.get(COOKIE_KEYS.REFRESH_TOKEN)?.value;
  if (!token) return false;

  try {
    const { exp } = jwtDecode<{ exp: number }>(token);
    return exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("[proxy]", request.nextUrl.pathname);
  const isAuthenticated = hasValidRefreshToken(request);

  const isPrivate = PRIVATE_ROUTES.some((route) =>
    matchesRoute(pathname, route),
  );
  const isPublicOnly = PUBLIC_ONLY_ROUTES.some((route) =>
    matchesRoute(pathname, route),
  );

  if (isPrivate && !isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isPublicOnly && isAuthenticated) {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/forgot-password/:path*",
    "/account/:path*",
    "/users/:path*",
    "/roles/:path*",
  ],
};
