import { axiosInstance } from "@/libs/core/services/axiosInstance.ts";
import { ApiResponse } from "@/libs/shared/core/models/common.model";
import {
  UpdateUserRequest,
  UserDetailResponse,
} from "@/libs/shared/tts/models/user.model";

const BASE = "/users";

export const userApis = {
  getUserDetail: (userId: string) =>
    axiosInstance
      .get<ApiResponse<UserDetailResponse>>(`${BASE}/${userId}`)
      .then((r) => r.data),

  updateUser: (userId: string, data: UpdateUserRequest) =>
    axiosInstance
      .put<ApiResponse<null>>(`${BASE}/${userId}`, data)
      .then((r) => r.data),

  updateMe: (data: UpdateUserRequest) =>
    axiosInstance
      .put<ApiResponse<null>>(`${BASE}/me`, data)
      .then((r) => r.data),
};
