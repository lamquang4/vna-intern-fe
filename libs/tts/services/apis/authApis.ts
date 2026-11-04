import {
  axiosInstance,
  axiosPublic,
} from "@/libs/core/services/axiosInstance.ts";
import type { ApiResponse } from "@/libs/shared/core/models/common.model";
import type {
  ChangeEmailRequest,
  ChangePasswordRequest,
  EmailOtpRequest,
  InitializePasswordRequest,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
  VerifyChangeEmailOtpRequest,
  VerifyRegisterEnterpriseEmailOtpRequest,
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

  initializePassword: (userId: string, data: InitializePasswordRequest) =>
    axiosInstance
      .post<ApiResponse<null>>(`${BASE}/${userId}/initialize-password`, data)
      .then((r) => r.data),

  // Gửi / gửi lại OTP đến email
  sendOtp: (data: EmailOtpRequest) => {
    const client =
      data.purpose === "CHANGE_EMAIL" ? axiosInstance : axiosPublic;

    return client
      .post<ApiResponse<null>>(`${BASE}/email-otp`, data)
      .then((r) => r.data);
  },

  // Quên mật khẩu
  resetPassword: (data: ResetPasswordRequest) =>
    axiosPublic
      .post<ApiResponse<null>>(`${BASE}/reset-password`, data)
      .then((r) => r.data),

  changePassword: (data: ChangePasswordRequest) =>
    axiosInstance
      .patch<ApiResponse<null>>(`${BASE}/change-password`, data)
      .then((r) => r.data),

  // Thay đổi email
  verifyChangeEmailOtp: (data: VerifyChangeEmailOtpRequest) =>
    axiosInstance
      .post<ApiResponse<null>>(`${BASE}/change-email/verify-otp`, data)
      .then((r) => r.data),

  changeEmail: (userId: string, data: ChangeEmailRequest) =>
    axiosInstance
      .patch<ApiResponse<null>>(`${BASE}/change-email/${userId}`, data)
      .then((r) => r.data),

  changeEmailMe: (data: ChangeEmailRequest) =>
    axiosInstance
      .patch<ApiResponse<null>>(`${BASE}/change-email`, data)
      .then((r) => r.data),

  // Đăng ký tài khoản doanh nghiệp
  verifyRegisterEnterpriseEmailOtp: (
    data: VerifyRegisterEnterpriseEmailOtpRequest,
  ) =>
    axiosPublic
      .post<
        ApiResponse<null>
      >(`${BASE}/register-enterprise/verify-email-otp`, data)
      .then((r) => r.data),
};
