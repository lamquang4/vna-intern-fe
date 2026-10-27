import { axiosInstance } from "@/libs/core/services/axiosInstance.ts";
import {
  ApiResponse,
  PageResponse,
} from "@/libs/shared/core/models/common.model";
import { GetUsersParams } from "@/libs/shared/tts/models/params.model";
import {
  CreateUserRequest,
  DeleteUserRequest,
  UpdateMeRequest,
  UpdateUserRequest,
  UserDetailResponse,
  UserResponse,
} from "@/libs/shared/tts/models/user.model";

const BASE = "/users";

const toUserFormData = (
  data: CreateUserRequest | UpdateUserRequest | UpdateMeRequest,
): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    if (value instanceof File) {
      formData.append(key, value);
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
};

export const userApis = {
  getUsers: (params?: GetUsersParams) =>
    axiosInstance
      .get<PageResponse<UserResponse>>(BASE, { params })
      .then((r) => r.data),

  getUserDetail: (userId: string) =>
    axiosInstance
      .get<ApiResponse<UserDetailResponse>>(`${BASE}/${userId}`)
      .then((r) => r.data),

  createUser: (data: CreateUserRequest) =>
    axiosInstance
      .post<ApiResponse<null>>(`${BASE}`, toUserFormData(data))
      .then((r) => r.data),

  updateUser: (userId: string, data: UpdateUserRequest) =>
    axiosInstance
      .put<ApiResponse<null>>(`${BASE}/${userId}`, toUserFormData(data))
      .then((r) => r.data),

  updateMe: (data: UpdateMeRequest) =>
    axiosInstance
      .put<ApiResponse<null>>(`${BASE}/me`, toUserFormData(data))
      .then((r) => r.data),

  deleteUsers: (data: DeleteUserRequest) =>
    axiosInstance
      .delete<ApiResponse<null>>(`${BASE}`, { data })
      .then((r) => r.data),

  toggleUserStatus: (userId: string) =>
    axiosInstance
      .put<ApiResponse<null>>(`${BASE}/${userId}/status`)
      .then((r) => r.data),
};
