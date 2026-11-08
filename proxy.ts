import { NextResponse, type NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";
import { COOKIE_KEYS } from "@/libs/core/constants/cookie";
import type {
  AccessTokenPayload,
  RefreshTokenPayload,
} from "@/libs/shared/tts/models/auth.model";
import { RoleCode } from "./libs/shared/tts/models/enums";

const LOGIN_PATH = "/";
const DEFAULT_AUTH_PATH = "/account";

// Route cần đăng nhập
const PRIVATE_ROUTES: {
  path: string;
  roles?: string[];
}[] = [
  { path: "/account" },
  { path: "/users", roles: [RoleCode.SO] },
  { path: "/enterprises", roles: [RoleCode.SO] },
  { path: "/enterprise", roles: [RoleCode.DOANH_NGHIEP] },
];

// Đã đăng nhập thì không cần truy cập
const PUBLIC_ONLY_ROUTES = ["/", "/forgot-password", "/register/enterprise"];

const matchesRoute = (pathname: string, route: string): boolean =>
  pathname === route || pathname.startsWith(`${route}/`);

const redirectTo = (request: NextRequest, path: string) =>
  NextResponse.redirect(new URL(path, request.url));

function decodeCookie<T extends { exp: number }>(
  request: NextRequest,
  key: string,
): T | null {
  const token = request.cookies.get(key)?.value;
  if (!token) return null;

  try {
    const payload = jwtDecode<T>(token);
    if (!payload.exp || payload.exp * 1000 <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const refreshToken = decodeCookie<RefreshTokenPayload>(
    request,
    COOKIE_KEYS.REFRESH_TOKEN,
  );
  const isAuthenticated = !!refreshToken;

  const accessToken = decodeCookie<AccessTokenPayload>(
    request,
    COOKIE_KEYS.ACCESS_TOKEN,
  );

  const role = accessToken?.role ?? refreshToken?.role;

  const privateRoute = PRIVATE_ROUTES.find(({ path }) =>
    matchesRoute(pathname, path),
  );
  const isPublicOnly = PUBLIC_ONLY_ROUTES.some((route) =>
    matchesRoute(pathname, route),
  );

  if (privateRoute) {
    if (!isAuthenticated) {
      return redirectTo(request, LOGIN_PATH);
    }

    const { roles } = privateRoute;
    if (roles && (!role || !roles.includes(role))) {
      return redirectTo(request, DEFAULT_AUTH_PATH);
    }
  }

  if (isPublicOnly && isAuthenticated) {
    return redirectTo(request, DEFAULT_AUTH_PATH);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/forgot-password/:path*",
    "/register/enterprise/:path*",
    "/account/:path*",
    "/users/:path*",
    "/enterprises/:path*",
    "/enterprise/:path*",
  ],
};
