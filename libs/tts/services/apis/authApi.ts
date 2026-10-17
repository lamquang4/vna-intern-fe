import {
  axiosInstance,
  axiosPublic,
} from "@/libs/core/services/axiosInstance.ts";
import { ApiResponse } from "@/libs/shared/core/models/common.model";
import {
  LoginRequest,
  LoginResponse,
} from "@/libs/shared/tts/models/auth.model";

const BASE = "/auth";

export const authApi = {
  login: (data: LoginRequest) =>
    axiosPublic
      .post<ApiResponse<LoginResponse>>(`${BASE}/login`, data)
      .then((r) => r.data),

  logout: () =>
    axiosInstance.post<ApiResponse<null>>(`${BASE}/logout`).then((r) => r.data),
};
