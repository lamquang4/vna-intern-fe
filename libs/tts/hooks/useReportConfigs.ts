"use client";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type {
  ApiResponse,
  ErrorResponse,
} from "@/libs/shared/core/models/common.model";
import type { ReportConfigYearsResponse } from "@/libs/shared/tts/models/report-config.model";
import { reportConfigApis } from "../services/apis/reportConfigApis";

export const reportConfigKeys = {
  all: ["report-configs"] as const,
  years: () => [...reportConfigKeys.all, "years"] as const,
};

export const useGetReportConfigYears = () => {
  return useQuery<
    ApiResponse<ReportConfigYearsResponse>,
    AxiosError<ErrorResponse>
  >({
    queryKey: reportConfigKeys.years(),
    queryFn: () => reportConfigApis.getReportConfigYears(),
  });
};
