"use client";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import type { AxiosError } from "axios";
import type {
  ApiResponse,
  ErrorResponse,
  PageResponse,
} from "@/libs/shared/core/models/common.model";
import type {
  CreateUserRequest,
  DeleteUserRequest,
  UpdateMeRequest,
  UpdateUserRequest,
  UserDetailResponse,
  UserResponse,
} from "@/libs/shared/tts/models/user.model";
import { userApis } from "../services/apis/userApis";
import { getErrorMessage } from "@/libs/core/utils/errorUtil";
import { authKeys } from "./useAuth";
import { GetUsersParams } from "@/libs/shared/tts/models/params.model";

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  listParams: (params?: GetUsersParams) =>
    [...userKeys.lists(), params] as const,
  detail: (userId: string) => [...userKeys.all, "detail", userId] as const,
};

export const useGetUsers = (params?: GetUsersParams) => {
  return useQuery<PageResponse<UserResponse>, AxiosError<ErrorResponse>>({
    queryKey: userKeys.listParams(params),
    queryFn: () => userApis.getUsers(params),
    placeholderData: keepPreviousData,
  });
};

export const useGetUserDetail = (userId: string) => {
  return useQuery<ApiResponse<UserDetailResponse>, AxiosError<ErrorResponse>>({
    queryKey: userKeys.detail(userId),
    queryFn: () => userApis.getUserDetail(userId),
    enabled: !!userId,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ErrorResponse>,
    CreateUserRequest
  >({
    mutationFn: (data) => userApis.createUser(data),

    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.all,
      });

      toast.success(res.message || "Thêm người dùng thành công");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Thêm người dùng thất bại"));
    },
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

      toast.success(res.message || "Cập nhật người dùng thành công");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Cập nhật người dùng thất bại"));
    },
  });
};

export const useUpdateMe = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ErrorResponse>,
    UpdateMeRequest
  >({
    mutationFn: (data) => userApis.updateMe(data),

    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: authKeys.me(),
      });

      toast.success(res.message || "Cập nhật tài khoản thành công");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Cập nhật tài khoản thất bại"));
    },
  });
};

export const useDeleteUsers = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ErrorResponse>,
    DeleteUserRequest
  >({
    mutationFn: (data) => userApis.deleteUsers(data),

    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.all,
      });

      toast.success(res.message || "Xóa người dùng thành công");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Xóa người dùng thất bại"));
    },
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<null>, AxiosError<ErrorResponse>, string>({
    mutationFn: (userId) => userApis.toggleUserStatus(userId),

    onSuccess: (res, userId) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });

      toast.success(res.message || "Cập nhật trạng thái thành công");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Cập nhật trạng thái thất bại"));
    },
  });
};
