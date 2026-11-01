import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { jwtUtil } from "../utils/jwtUtil";
import { ApiResponse } from "@/libs/shared/core/models/common.model";
import { RefreshTokenResponse } from "@/libs/shared/tts/models/auth.model";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Dùng cho route không cần token
export const axiosPublic = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 10000,
});

// Dùng cho route cần token
export const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 10000,
});

// Nhiều request cùng lúc gặp token hết hạn thì chỉ gọi 1 API refresh,
// các request còn lại chờ kết quả của lần refresh đó
let refreshPromise: Promise<string> | null = null;

let isForceLoggingOut = false;

// Xóa token và về trang đăng nhập
const forceLogout = (): void => {
  if (isForceLoggingOut) return;
  isForceLoggingOut = true;

  jwtUtil.clearTokens();

  if (typeof window !== "undefined" && window.location.pathname !== "/") {
    window.location.href = "/";
  } else {
    isForceLoggingOut = false;
  }
};

// Refresh thất bại do refresh token không còn dùng được
// (session bị xóa, token bị thu hồi, hết hạn...) thì đăng xuất.
// Lỗi mạng/timeout (không có response) thì không đăng xuất.
const handleInvalidRefreshToken = (error: unknown): void => {
  if (axios.isAxiosError(error)) {
    if (error.response) forceLogout();
    return;
  }

  forceLogout();
};

// Gọi API refresh để lấy access token + refresh token mới
const doRefresh = async (): Promise<string> => {
  const refreshToken = jwtUtil.getRefreshTokenRaw();
  if (!refreshToken) throw new Error("Không có refresh token");

  const { data } = await axiosPublic.post<ApiResponse<RefreshTokenResponse>>(
    "/auth/refresh",
    { refreshToken },
  );

  // BE dùng refresh token rotation: mỗi lần refresh trả refresh token mới
  // và vô hiệu hóa token cũ
  jwtUtil.setAccessToken(data.data.accessToken);
  jwtUtil.setRefreshToken(data.data.refreshToken);

  return data.data.accessToken;
};

// staleToken: access token vừa bị từ chối (nếu có).
// Dùng Web Locks để đồng bộ giữa nhiều tab: nếu tab khác đã refresh xong
// (token hiện tại khác staleToken và còn hạn) thì dùng luôn, không refresh lại.
export const refreshAccessToken = (staleToken?: string): Promise<string> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    if (typeof navigator !== "undefined" && "locks" in navigator) {
      return navigator.locks.request("auth-refresh-token", async () => {
        const current = jwtUtil.getAccessTokenRaw();
        if (
          current &&
          current !== staleToken &&
          !jwtUtil.isAccessTokenExpiringSoon()
        ) {
          return current;
        }
        return doRefresh();
      });
    }

    return doRefresh();
  })();

  refreshPromise.finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
};

// Request: token sắp hết hạn thì refresh trước khi gửi
axiosInstance.interceptors.request.use(async (config) => {
  let accessToken = jwtUtil.getAccessTokenRaw();

  if (
    jwtUtil.hasValidLocalRefreshToken() &&
    jwtUtil.isAccessTokenExpiringSoon()
  ) {
    try {
      accessToken = await refreshAccessToken();
    } catch (error) {
      handleInvalidRefreshToken(error);
      return Promise.reject(error);
    }
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// Response: chỉ xét status 401, không phụ thuộc error code
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // Đã refresh + retry mà vẫn 401, hoặc không còn refresh token hợp lệ
    // -> session không còn hiệu lực
    if (originalRequest._retry || !jwtUtil.hasValidLocalRefreshToken()) {
      forceLogout();
      return Promise.reject(error);
    }

    originalRequest._retry = true; // Đánh dấu đã retry, tránh lặp vô hạn

    try {
      const staleToken = String(
        originalRequest.headers?.Authorization ?? "",
      ).replace("Bearer ", "");

      const newToken = await refreshAccessToken(staleToken || undefined);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      // Session bị xóa dưới BE -> refresh cũng bị từ chối -> đăng xuất
      handleInvalidRefreshToken(refreshError);
      return Promise.reject(error);
    }
  },
);
