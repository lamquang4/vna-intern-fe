"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type {
  ApiResponse,
  ErrorResponse,
} from "@/libs/shared/core/models/common.model";
import { reportConfigApis } from "../services/apis/reportConfigApis";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "@/libs/core/utils/errorUtil";
import {
  ConfigureReportDeadlineRequest,
  ExtendReportDeadlineRequest,
  ReportDeadlineExtensionResponse,
} from "@/libs/shared/tts/models/report-config.model";

export const reportConfigKeys = {
  all: ["report-configs"] as const,
  years: () => [...reportConfigKeys.all, "years"] as const,
  configurations: () => [...reportConfigKeys.all, "configurations"] as const,
  extensions: (year: number) =>
    [...reportConfigKeys.all, "extensions", year] as const,
};

export const useGetReportConfigYears = () => {
  return useQuery<ApiResponse<number[]>, AxiosError<ErrorResponse>>({
    queryKey: reportConfigKeys.years(),
    queryFn: () => reportConfigApis.getReportConfigYears(),
  });
};

export const useGetReportConfigurations = () =>
  useQuery({
    queryKey: reportConfigKeys.configurations(),
    queryFn: () => reportConfigApis.getReportConfigurations(),
  });

export const useGetDeadlineExtensions = (year: number) =>
  useQuery({
    queryKey: reportConfigKeys.extensions(year),
    queryFn: () => reportConfigApis.getDeadlineExtensions(year),
  });

export const useExtendReportDeadline = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<ReportDeadlineExtensionResponse>,
    AxiosError<ErrorResponse>,
    ExtendReportDeadlineRequest
  >({
    mutationFn: reportConfigApis.extendReportDeadline,
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({
        queryKey: reportConfigKeys.extensions(variables.year),
      });
      queryClient.invalidateQueries({
        queryKey: ["accident-reports"],
      });
      toast.success(res.message || "Gia hạn thời hạn nộp báo cáo thành công");
    },
    onError: (error) => {
      toast.error(
        getErrorMessage(error, "Gia hạn thời hạn nộp báo cáo thất bại"),
      );
    },
  });
};

export const useConfigureReportDeadline = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ErrorResponse>,
    ConfigureReportDeadlineRequest
  >({
    mutationFn: reportConfigApis.configureReportDeadline,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["accident-reports"] });
      toast.success(res.message || "Cấu hình thời hạn báo cáo thành công");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Cấu hình thời hạn báo cáo thất bại"));
    },
  });
};
