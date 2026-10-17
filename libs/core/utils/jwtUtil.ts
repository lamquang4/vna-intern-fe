import { jwtDecode } from "jwt-decode";
import { cookieUtil } from "./cookieUtil";
import { COOKIE_KEYS, COOKIE_OPTIONS } from "../constants/cookie";
import {
  AccessTokenPayload,
  RefreshTokenPayload,
} from "@/libs/shared/tts/models/auth.model";

const EXPIRING_SOON_BUFFER_SECONDS = 60;

const decodeToken = <T>(token: string): T | null => {
  try {
    return jwtDecode<T>(token);
  } catch {
    return null;
  }
};

const setTokenCookie = (name: string, rawToken: string): void => {
  const payload = decodeToken<{ exp: number }>(rawToken);

  if (!payload) {
    return;
  }

  const expiresInDays = (payload.exp - Date.now() / 1000) / 86400;

  if (expiresInDays <= 0) {
    return;
  }

  cookieUtil.set(name, rawToken, { ...COOKIE_OPTIONS, expires: expiresInDays });
};

export const jwtUtil = {
  getAccessTokenRaw: (): string | undefined =>
    cookieUtil.get(COOKIE_KEYS.ACCESS_TOKEN),
  getRefreshTokenRaw: (): string | undefined =>
    cookieUtil.get(COOKIE_KEYS.REFRESH_TOKEN),

  getAccessTokenPayload: (): AccessTokenPayload | null => {
    const token = cookieUtil.get(COOKIE_KEYS.ACCESS_TOKEN);
    return token ? decodeToken<AccessTokenPayload>(token) : null;
  },

  getRefreshTokenPayload: (): RefreshTokenPayload | null => {
    const token = cookieUtil.get(COOKIE_KEYS.REFRESH_TOKEN);
    return token ? decodeToken<RefreshTokenPayload>(token) : null;
  },

  getUserId: (): string | null => jwtUtil.getAccessTokenPayload()?.sub ?? null,
  getSessionId: (): string | null =>
    jwtUtil.getAccessTokenPayload()?.session_id ?? null,

  isAccessTokenExpired: (): boolean => {
    const payload = jwtUtil.getAccessTokenPayload();
    if (!payload) return true;
    return payload.exp * 1000 <= Date.now();
  },

  isAccessTokenExpiringSoon: (
    bufferSeconds: number = EXPIRING_SOON_BUFFER_SECONDS,
  ): boolean => {
    const payload = jwtUtil.getAccessTokenPayload();
    if (!payload) return true;
    return payload.exp * 1000 - Date.now() <= bufferSeconds * 1000;
  },

  isRefreshTokenExpired: (): boolean => {
    const payload = jwtUtil.getRefreshTokenPayload();
    if (!payload) return true;
    return payload.exp * 1000 <= Date.now();
  },

  hasValidLocalRefreshToken: (): boolean => {
    return (
      Boolean(jwtUtil.getRefreshTokenRaw()) && !jwtUtil.isRefreshTokenExpired()
    );
  },

  setAccessToken: (rawToken: string): void =>
    setTokenCookie(COOKIE_KEYS.ACCESS_TOKEN, rawToken),
  setRefreshToken: (rawToken: string): void =>
    setTokenCookie(COOKIE_KEYS.REFRESH_TOKEN, rawToken),

  clearTokens: (): void => {
    cookieUtil.remove(COOKIE_KEYS.ACCESS_TOKEN, COOKIE_OPTIONS);
    cookieUtil.remove(COOKIE_KEYS.REFRESH_TOKEN, COOKIE_OPTIONS);
  },
};
