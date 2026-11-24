import { axiosInstance } from "@/libs/core/services/axiosInstance.ts";
import type { ApiResponse } from "@/libs/shared/core/models/common.model";

const BASE = "/report-configs";

export interface ReportPeriodConfig {
  period: "SIX_MONTHS" | "FULL_YEAR";
  deadlineMonth: number;
  deadlineDay: number;
  requiredFields: string[];
  description?: string | null;
}

export interface ReportDeadlineExtension {
  year: number;
  period: "SIX_MONTHS" | "FULL_YEAR";
  deadlineAt: string;
}

export const reportConfigApis = {
  getReportConfigYears: () =>
    axiosInstance
      .get<ApiResponse<number[]>>(`${BASE}/years`)
      .then((r) => r.data),
  getReportConfigurations: () =>
    axiosInstance
      .get<ApiResponse<ReportPeriodConfig[]>>("/report-configurations")
      .then((r) => r.data),
  getDeadlineExtensions: (year: number) =>
    axiosInstance
      .get<ApiResponse<ReportDeadlineExtension[]>>(`${BASE}/extensions`, {
        params: { year },
      })
      .then((r) => r.data),
  extendReportDeadline: (data: {
    accidentReportId: string;
    period: "SIX_MONTHS" | "FULL_YEAR";
    year: number;
    deadlineAt: string;
  }) =>
    axiosInstance
      .post<ApiResponse<ReportDeadlineExtension>>(`${BASE}/extend`, data)
      .then((r) => r.data),
  configureReportDeadline: (data: {
    period: "SIX_MONTHS" | "FULL_YEAR";
    year: number;
    deadlineAt: string;
  }) =>
    axiosInstance
      .post<ApiResponse<{ message: string }>>(`${BASE}/configure`, data)
      .then((r) => r.data),
};
