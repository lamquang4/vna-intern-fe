import { axiosInstance } from "@/libs/core/services/axiosInstance.ts";
import type { ApiResponse } from "@/libs/shared/core/models/common.model";
import {
  ConfigureReportDeadlineRequest,
  ExtendReportDeadlineRequest,
  ReportDeadlineExtensionResponse,
  ReportPeriodConfigResponse,
} from "@/libs/shared/tts/models/report-config.model";

const BASE = "/report-configs";

export const reportConfigApis = {
  getReportConfigYears: () =>
    axiosInstance
      .get<ApiResponse<number[]>>(`${BASE}/years`)
      .then((r) => r.data),

  getReportConfigurations: () =>
    axiosInstance
      .get<ApiResponse<ReportPeriodConfigResponse[]>>("/report-configurations")
      .then((r) => r.data),

  getDeadlineExtensions: (year: number) =>
    axiosInstance
      .get<ApiResponse<ReportDeadlineExtensionResponse[]>>(
        `${BASE}/extensions`,
        {
          params: { year },
        },
      )
      .then((r) => r.data),

  extendReportDeadline: (data: ExtendReportDeadlineRequest) =>
    axiosInstance
      .post<
        ApiResponse<ReportDeadlineExtensionResponse>
      >(`${BASE}/extend`, data)
      .then((r) => r.data),

  configureReportDeadline: (data: ConfigureReportDeadlineRequest) =>
    axiosInstance
      .post<ApiResponse<null>>(`${BASE}/configure`, data)
      .then((r) => r.data),
};
