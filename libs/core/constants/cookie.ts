export const COOKIE_OPTIONS: Omit<Cookies.CookieAttributes, "expires"> = {
  path: "/",
  secure: import.meta.env.PROD,
  sameSite: "lax",
};

export const COOKIE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
} as const;
