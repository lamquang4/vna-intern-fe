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
  EmailOtpRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  VerifyChangeEmailOtpRequest,
  VerifyRegisterEnterpriseEmailOtpRequest,
  ChangeEmailRequest,
  InitializePasswordRequest,
} from "@/libs/shared/tts/models/auth.model";
import type { UserDetailResponse } from "@/libs/shared/tts/models/user.model";
import { authApi } from "../services/apis/authApis";
import { jwtUtil } from "@/libs/core/utils/jwtUtil";
import { getErrorMessage } from "@/libs/core/utils/errorUtil";
import { userKeys } from "./useUsers";
import { enterpriseKeys } from "./useEnterprises";

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

// Khởi tạo mật khẩu
export const useInitializePassword = (userId: string) => {
  return useMutation<
    ApiResponse<null>,
    AxiosError<ErrorResponse>,
    InitializePasswordRequest
  >({
    mutationFn: (body) => authApi.initializePassword(userId, body),

    onSuccess: (res) => {
      toast.success(res.message || "Khởi tạo mật khẩu thành công");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Khởi tạo mật khẩu thất bại"));
    },
  });
};

// Gửi OTP đến email
export const useSendOtp = () => {
  return useMutation<
    ApiResponse<null>,
    AxiosError<ErrorResponse>,
    EmailOtpRequest
  >({
    mutationFn: authApi.sendOtp,

    onError: (error) => {
      toast.error(getErrorMessage(error, "Gửi OTP thất bại"));
    },
  });
};

// Gửi lại OTP
export const useResendOtp = () => {
  return useMutation<
    ApiResponse<null>,
    AxiosError<ErrorResponse>,
    EmailOtpRequest
  >({
    mutationFn: authApi.sendOtp,

    onSuccess: () => {
      toast.success("Gửi lại OTP thành công");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Gửi lại OTP thất bại"));
    },
  });
};

// Flow quên mật khẩu
export const useChangePassword = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

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
      router.replace("/");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Đổi mật khẩu thất bại"));
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
      toast.error(getErrorMessage(error, "Đặt lại mật khẩu thất bại"));
    },
  });
};

// Change email
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

export const useChangeEmail = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ErrorResponse>,
    ChangeEmailRequest
  >({
    mutationFn: (body) => authApi.changeEmail(userId, body),

    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: enterpriseKeys.all });

      toast.success(res.message || "Thay đổi email thành công");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Thay đổi email thất bại"));
    },
  });
};

export const useChangeEmailMe = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ErrorResponse>,
    ChangeEmailRequest
  >({
    mutationFn: (body) => authApi.changeEmailMe(body),

    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: enterpriseKeys.me() });

      toast.success(res.message || "Thay đổi email thành công");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Thay đổi email thất bại"));
    },
  });
};

// Đăng ký doanh nghiệp: xác thực OTP gửi đến email doanh nghiệp
export const useVerifyRegisterEnterpriseEmailOtp = () => {
  return useMutation<
    ApiResponse<null>,
    AxiosError<ErrorResponse>,
    VerifyRegisterEnterpriseEmailOtpRequest
  >({
    mutationFn: authApi.verifyRegisterEnterpriseEmailOtp,

    onSuccess: (res) => {
      toast.success(res.message || "Xác thực OTP thành công");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Xác thực OTP thất bại"));
    },
  });
};

export const useGetMe = (options?: { enabled?: boolean }) => {
  return useQuery<ApiResponse<UserDetailResponse>, AxiosError<ErrorResponse>>({
    queryKey: authKeys.me(),
    queryFn: authApi.getMe,
    enabled: options?.enabled ?? true,
    staleTime: Infinity,
  });
};
