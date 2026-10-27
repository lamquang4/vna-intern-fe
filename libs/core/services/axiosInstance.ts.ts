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

// Nếu có nhiều request cùng lúc phát hiện accessToken hết hạn
// Chỉ gọi 1 API refresh token duy nhất
// Các request còn lại sẽ chờ kết quả refresh của 1 refresh thôi
let refreshPromise: Promise<string> | null = null;

// Khi refresh token hết hạn hoặc không hợp lệ thì xóa access token + refresh token
const handleInvalidRefreshToken = (error: unknown): void => {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    jwtUtil.clearTokens();
    window.location.href = "/";
  }
};

// Gọi API refresh để lấy access token + refresh token mới
const doRefresh = async (): Promise<string> => {
  const refreshToken = jwtUtil.getRefreshTokenRaw();
  if (!refreshToken) throw new Error("Không có refresh token");

  const { data } = await axiosPublic.post<ApiResponse<RefreshTokenResponse>>(
    "/auth/refresh",
    { refreshToken: refreshToken },
  );

  // BE áp dụng refresh token rotation, mỗi lần refresh
  // sẽ trả về refresh_token mới và vô hiệu hóa token cũ.
  jwtUtil.setAccessToken(data.data.accessToken);
  jwtUtil.setRefreshToken(data.data.refreshToken);

  return data.data.accessToken;
};

// Hàm gọi API để lấy access token mới bằng refresh token
// Dùng Web Locks API để đồng bộ giữa nhiều tab cùng domain
export const refreshAccessToken = (): Promise<string> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    if (typeof navigator !== "undefined" && "locks" in navigator) {
      return navigator.locks.request("auth-refresh-token", async () => {
        if (!jwtUtil.isAccessTokenExpiringSoon()) {
          const current = jwtUtil.getAccessTokenRaw();
          if (current) return current;
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

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ code?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const status = error.response?.status;
    const errorCode = error.response?.data?.code;

    const isAccessTokenExpired =
      status === 401 && errorCode === "ACCESS_TOKEN_EXPIRED";

    if (
      isAccessTokenExpired &&
      originalRequest &&
      !originalRequest._retry &&
      jwtUtil.hasValidLocalRefreshToken()
    ) {
      originalRequest._retry = true; // Đánh dấu đã retry, tránh lặp vô hạn nếu vẫn lỗi

      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        handleInvalidRefreshToken(refreshError);
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);
