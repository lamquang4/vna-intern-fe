"use client";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import type { AxiosError } from "axios";
import type {
  ApiResponse,
  ErrorResponse,
  PageResponse,
} from "@/libs/shared/core/models/common.model";
import type {
  AccidentReportDetailResponse,
  AccidentReportResponse,
  AccidentReportSummaryResponse,
  OverallAccidentReportResponse,
  ReviewAccidentReportsRequest,
  UpdateAccidentReportRequest,
} from "@/libs/shared/tts/models/accident-report.model";
import type {
  GetAccidentReportsMeParams,
  GetAccidentReportsParams,
} from "@/libs/shared/tts/models/params.model";
import { getErrorMessage } from "@/libs/core/utils/errorUtil";
import { accidentReportApis } from "../services/apis/accidentReportApis";

export const accidentReportKeys = {
  all: ["accident-reports"] as const,
  lists: () => [...accidentReportKeys.all, "list"] as const,
  listParams: (params?: GetAccidentReportsParams) =>
    [...accidentReportKeys.lists(), params] as const,
  myLists: () => [...accidentReportKeys.all, "my-list"] as const,
  myListParams: (params?: GetAccidentReportsMeParams) =>
    [...accidentReportKeys.myLists(), params] as const,
  detail: (id: string) => [...accidentReportKeys.all, "detail", id] as const,
  summary: (id: string) => [...accidentReportKeys.all, "summary", id] as const,
  overall: (year?: number) =>
    [...accidentReportKeys.all, "overall", year] as const,
};

// Danh sách phân trang cho role Sở
export const useGetAccidentReports = (
  params?: GetAccidentReportsParams,
  enabled = true,
) => {
  return useQuery<
    PageResponse<AccidentReportResponse>,
    AxiosError<ErrorResponse>
  >({
    queryKey: accidentReportKeys.listParams(params),
    queryFn: () => accidentReportApis.getAccidentReports(params),
    placeholderData: keepPreviousData,
    enabled,
    refetchInterval: 60_000, // 1 phút, chỉ chạy khi tab đang hiển thị
  });
};

// Danh sách phân trang của tài khoản DN đang đăng nhập
export const useGetAccidentReportsMe = (
  params?: GetAccidentReportsMeParams,
  enabled = true,
) => {
  return useQuery<
    PageResponse<AccidentReportResponse>,
    AxiosError<ErrorResponse>
  >({
    queryKey: accidentReportKeys.myListParams(params),
    queryFn: () => accidentReportApis.getAccidentReportsMe(params),
    placeholderData: keepPreviousData,
    enabled,
    refetchInterval: 60_000, // 1 phút, chỉ chạy khi tab đang hiển thị
  });
};

// Lấy chi tiết báo cáo theo id
export const useGetAccidentReportDetail = (id: string) => {
  return useQuery<
    ApiResponse<AccidentReportDetailResponse>,
    AxiosError<ErrorResponse>
  >({
    queryKey: accidentReportKeys.detail(id),
    queryFn: () => accidentReportApis.getAccidentReportDetail(id),
    enabled: !!id,
  });
};

// Lấy tóm tắt 1 báo cáo
export const useGetAccidentReportSummary = (id: string, enabled = true) => {
  return useQuery<
    ApiResponse<AccidentReportSummaryResponse>,
    AxiosError<ErrorResponse>
  >({
    queryKey: accidentReportKeys.summary(id),
    queryFn: () => accidentReportApis.getAccidentReportSummary(id),
    enabled: !!id && enabled,
  });
};

// Lấy báo cáo tổng hợp toàn Sở theo năm
export const useGetOverallAccidentReport = (year?: number) => {
  return useQuery<
    ApiResponse<OverallAccidentReportResponse>,
    AxiosError<ErrorResponse>
  >({
    queryKey: accidentReportKeys.overall(year),
    queryFn: () => accidentReportApis.getOverallAccidentReport(year),
  });
};

// Cập nhật báo cáo TNLĐ
export const useUpdateAccidentReport = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ErrorResponse>,
    UpdateAccidentReportRequest
  >({
    mutationFn: (data) => accidentReportApis.updateAccidentReport(id, data),

    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: accidentReportKeys.lists() });
      queryClient.invalidateQueries({ queryKey: accidentReportKeys.myLists() });
      queryClient.invalidateQueries({
        queryKey: accidentReportKeys.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: accidentReportKeys.summary(id),
      });
      queryClient.invalidateQueries({ queryKey: accidentReportKeys.all });

      toast.success(res.message || "Khai báo báo cáo thành công");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Khai báo báo cáo thất bại"));
    },
  });
};

export const useReviewAccidentReport = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ErrorResponse>,
    ReviewAccidentReportsRequest
  >({
    mutationFn: (data) => accidentReportApis.reviewAccidentReport(data),

    onSuccess: (res) => {
      toast.success(res.message || "Cập nhật trạng thái thành công");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Cập nhật trạng thái thất bại"));
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: accidentReportKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: [...accidentReportKeys.all, "overall"],
      });

      variables.accidentReportIds.forEach((id) => {
        queryClient.invalidateQueries({
          queryKey: accidentReportKeys.detail(id),
        });
        queryClient.invalidateQueries({
          queryKey: accidentReportKeys.summary(id),
        });
      });
    },
  });
};
