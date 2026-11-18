import { axiosInstance } from "@/libs/core/services/axiosInstance.ts";
import type { ApiResponse } from "@/libs/shared/core/models/common.model";

const BASE = "/report-configs";

export const reportConfigApis = {
  getReportConfigYears: () =>
    axiosInstance
      .get<ApiResponse<number[]>>(`${BASE}/years`)
      .then((r) => r.data),
};
