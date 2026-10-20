"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import type { AxiosError } from "axios";
import type {
  ApiResponse,
  ErrorResponse,
} from "@/libs/shared/core/models/common.model";
import type {
  UpdateUserRequest,
  UserDetailResponse,
} from "@/libs/shared/tts/models/user.model";
import { userApis } from "../services/apis/userApis";
import { getErrorMessage } from "@/libs/core/utils/errorUtil";
import { authKeys } from "./useAuth";

export const userKeys = {
  all: ["users"] as const,
  detail: (userId: string) => [...userKeys.all, "detail", userId] as const,
};

export const useUserDetail = (userId: string) => {
  return useQuery<ApiResponse<UserDetailResponse>, AxiosError<ErrorResponse>>({
    queryKey: userKeys.detail(userId),
    queryFn: () => userApis.getUserDetail(userId),
    enabled: !!userId,
  });
};

export const useUpdateUser = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ErrorResponse>,
    UpdateUserRequest
  >({
    mutationFn: (data) => userApis.updateUser(userId, data),

    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(userId),
      });

      toast.success(res.message || "Cập nhật thông tin thành công");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Cập nhật thông tin thất bại"));
    },
  });
};

export const useUpdateMe = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ErrorResponse>,
    UpdateUserRequest
  >({
    mutationFn: (data) => userApis.updateMe(data),

    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: authKeys.me(),
      });

      toast.success(res.message || "Cập nhật thông tin thành công");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Cập nhật thông tin thất bại"));
    },
  });
};
