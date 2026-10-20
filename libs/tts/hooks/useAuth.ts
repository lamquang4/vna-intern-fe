"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import type { AxiosError } from "axios";
import type {
  ApiResponse,
  ErrorResponse,
} from "@/libs/shared/core/models/common.model";
import type {
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ResendForgotPasswordOtpRequest,
  ChangePasswordRequest,
  VerifyChangeEmailOtpRequest,
  ChangeEmailRequest,
} from "@/libs/shared/tts/models/auth.model";
import type { UserDetailResponse } from "@/libs/shared/tts/models/user.model";
import { authApi } from "../services/apis/authApis";
import { jwtUtil } from "@/libs/core/utils/jwtUtil";
import { getErrorMessage } from "@/libs/core/utils/errorUtil";

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

export const useLogin = () => {
  const router = useRouter();

  return useMutation<
    ApiResponse<LoginResponse>,
    AxiosError<ErrorResponse>,
    LoginRequest
  >({
    mutationFn: authApi.login,

    onSuccess: (res) => {
      const { accessToken, refreshToken } = res.data;

      jwtUtil.setAccessToken(accessToken);
      jwtUtil.setRefreshToken(refreshToken);

      toast.success(res.message || "Đăng nhập thành công");
      router.replace("/account");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Đăng nhập thất bại"));
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<ApiResponse<null>, AxiosError<ErrorResponse>, void>({
    mutationFn: authApi.logout,

    onSuccess: (res) => {
      jwtUtil.clearTokens();
      queryClient.clear();

      toast.success(res.message || "Đăng xuất thành công");
      router.replace("/");
    },

    onError: (error) => {
      jwtUtil.clearTokens();
      queryClient.clear();

      router.replace("/");
      toast.error(getErrorMessage(error, "Đăng xuất thất bại"));
    },
  });
};

export const useForgotPassword = () => {
  return useMutation<
    ApiResponse<null>,
    AxiosError<ErrorResponse>,
    ForgotPasswordRequest
  >({
    mutationFn: authApi.forgotPassword,

    onSuccess: (res) => {
      toast.success(
        res.message ||
          "Nếu email tồn tại, hướng dẫn đặt lại mật khẩu sẽ được gửi.",
      );
    },

    onError: (error) => {
      toast.error(
        getErrorMessage(error, "Không thể gửi yêu cầu đặt lại mật khẩu"),
      );
    },
  });
};

export const useResendForgotPasswordOtp = () => {
  return useMutation<
    ApiResponse<null>,
    AxiosError<ErrorResponse>,
    ResendForgotPasswordOtpRequest
  >({
    mutationFn: authApi.resendForgotPasswordOtp,

    onSuccess: (res) => {
      toast.success(res.message || "Gửi lại OTP thành công");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Không thể gửi lại OTP"));
    },
  });
};

export const useResetPassword = () => {
  const router = useRouter();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ErrorResponse>,
    ResetPasswordRequest
  >({
    mutationFn: (body) => authApi.resetPassword(body),

    onSuccess: (res) => {
      toast.success(res.message || "Đặt lại mật khẩu thành công");
      router.replace("/");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Không thể đặt lại mật khẩu"));
    },
  });
};

// Change password
export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ErrorResponse>,
    ChangePasswordRequest
  >({
    mutationFn: (body) => authApi.changePassword(body),

    onSuccess: (res) => {
      jwtUtil.clearTokens();
      queryClient.clear();

      toast.success(res.message || "Đổi mật khẩu thành công");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Không thể đổi mật khẩu"));
    },
  });
};

export const useRequestChangeEmailOtp = () => {
  return useMutation<ApiResponse<null>, AxiosError<ErrorResponse>, void>({
    mutationFn: authApi.requestChangeEmailOtp,

    onSuccess: (res) => {
      toast.success(res.message || "Gửi OTP xác thực email thành công");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Không thể gửi OTP xác thực email"));
    },
  });
};

export const useVerifyChangeEmailOtp = () => {
  return useMutation<
    ApiResponse<null>,
    AxiosError<ErrorResponse>,
    VerifyChangeEmailOtpRequest
  >({
    mutationFn: authApi.verifyChangeEmailOtp,

    onSuccess: (res) => {
      toast.success(res.message || "Xác thực OTP thành công");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Xác thực OTP thất bại"));
    },
  });
};

// Change email
export const useChangeEmail = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ErrorResponse>,
    ChangeEmailRequest
  >({
    mutationFn: authApi.changeEmail,

    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: authKeys.me(),
      });

      toast.success(res.message || "Đổi email thành công");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Không thể đổi email"));
    },
  });
};

export const useMe = (options?: { enabled?: boolean }) => {
  return useQuery<ApiResponse<UserDetailResponse>, AxiosError<ErrorResponse>>({
    queryKey: authKeys.me(),
    queryFn: authApi.getMe,
    retry: false,
    enabled: options?.enabled ?? true,
  });
};
