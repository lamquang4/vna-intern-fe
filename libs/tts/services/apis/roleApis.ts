import { axiosInstance } from "@/libs/core/services/axiosInstance.ts";
import { ApiResponse } from "@/libs/shared/core/models/common.model";
import { RoleResponse } from "@/libs/shared/tts/models/role.model";

const BASE = "/roles";

export const roleApis = {
  getAllRoles: () =>
    axiosInstance
      .get<ApiResponse<RoleResponse[]>>(`${BASE}`)
      .then((r) => r.data),
};
