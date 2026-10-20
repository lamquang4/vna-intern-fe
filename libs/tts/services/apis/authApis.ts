import {
  axiosInstance,
  axiosPublic,
} from "@/libs/core/services/axiosInstance.ts";
import type { ApiResponse } from "@/libs/shared/core/models/common.model";
import type {
  ChangeEmailRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
  ResendForgotPasswordOtpRequest,
  VerifyChangeEmailOtpRequest,
} from "@/libs/shared/tts/models/auth.model";
import type { UserDetailResponse } from "@/libs/shared/tts/models/user.model";

const BASE = "/auth";

export const authApi = {
  login: (data: LoginRequest) =>
    axiosPublic
      .post<ApiResponse<LoginResponse>>(`${BASE}/login`, data)
      .then((r) => r.data),

  logout: () =>
    axiosInstance.post<ApiResponse<null>>(`${BASE}/logout`).then((r) => r.data),

  getMe: () =>
    axiosInstance
      .get<ApiResponse<UserDetailResponse>>(`${BASE}/me`)
      .then((r) => r.data),

  forgotPassword: (data: ForgotPasswordRequest) =>
    axiosPublic
      .post<ApiResponse<null>>(`${BASE}/forgot-password`, data)
      .then((r) => r.data),

  resendForgotPasswordOtp: (data: ResendForgotPasswordOtpRequest) =>
    axiosPublic
      .post<ApiResponse<null>>(`${BASE}/resend-forgot-password-otp`, data)
      .then((r) => r.data),

  resetPassword: (data: ResetPasswordRequest) =>
    axiosPublic
      .post<ApiResponse<null>>(`${BASE}/reset-password`, data)
      .then((r) => r.data),

  changePassword: (data: ChangePasswordRequest) =>
    axiosInstance
      .patch<ApiResponse<null>>(`${BASE}/change-password`, data)
      .then((r) => r.data),

  requestChangeEmailOtp: () =>
    axiosInstance
      .post<ApiResponse<null>>(`${BASE}/change-email/request-otp`)
      .then((r) => r.data),

  verifyChangeEmailOtp: (data: VerifyChangeEmailOtpRequest) =>
    axiosInstance
      .post<ApiResponse<null>>(`${BASE}/change-email/verify-otp`, data)
      .then((r) => r.data),

  changeEmail: (data: ChangeEmailRequest) =>
    axiosInstance
      .patch<ApiResponse<null>>(`${BASE}/change-email`, data)
      .then((r) => r.data),
};
