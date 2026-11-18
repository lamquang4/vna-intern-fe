import { axiosInstance } from "@/libs/core/services/axiosInstance.ts";
import type { ApiResponse } from "@/libs/shared/core/models/common.model";
import type { ReportConfigYearsResponse } from "@/libs/shared/tts/models/report-config.model";

const BASE = "/report-configs";

export const reportConfigApis = {
  getReportConfigYears: () =>
    axiosInstance
      .get<ApiResponse<ReportConfigYearsResponse>>(`${BASE}/years`)
      .then((r) => r.data),
};
