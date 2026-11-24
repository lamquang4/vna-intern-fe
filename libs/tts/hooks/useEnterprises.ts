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
  CreateEnterpriseRequest,
  DeleteEnterpriseRequest,
  EnterpriseDetailResponse,
  EnterpriseResponse,
  UpdateEnterpriseMeRequest,
  UpdateEnterpriseRequest,
} from "@/libs/shared/tts/models/enterprise.model";
import type { GetEnterprisesParams } from "@/libs/shared/tts/models/params.model";
import { enterpriseApis } from "../services/apis/enterpriseApis";
import { getErrorMessage } from "@/libs/core/utils/errorUtil";
import { accidentReportKeys } from "./useAccidentReports";

export const enterpriseKeys = {
  all: ["enterprises"] as const,
  lists: () => [...enterpriseKeys.all, "list"] as const,
  listParams: (params?: GetEnterprisesParams) =>
    [...enterpriseKeys.lists(), params ?? {}] as const,
  detail: (enterpriseId: string) =>
    [...enterpriseKeys.all, "detail", enterpriseId] as const,
  me: () => [...enterpriseKeys.all, "me"] as const,
};

export const useGetEnterprises = (params?: GetEnterprisesParams) => {
  return useQuery<PageResponse<EnterpriseResponse>, AxiosError<ErrorResponse>>({
    queryKey: enterpriseKeys.listParams(params),
    queryFn: () => enterpriseApis.getEnterprises(params),
    placeholderData: keepPreviousData,
  });
};

export const useGetEnterpriseDetail = (enterpriseId: string) => {
  return useQuery<
    ApiResponse<EnterpriseDetailResponse>,
    AxiosError<ErrorResponse>
  >({
    queryKey: enterpriseKeys.detail(enterpriseId),
    queryFn: () => enterpriseApis.getEnterpriseDetail(enterpriseId),
    enabled: !!enterpriseId,
  });
};

export const useGetEnterpriseMe = (enabled = true) => {
  return useQuery<
    ApiResponse<EnterpriseDetailResponse>,
    AxiosError<ErrorResponse>
  >({
    queryKey: enterpriseKeys.me(),
    queryFn: () => enterpriseApis.getEnterpriseMe(),
    enabled,
  });
};

export const useCreateEnterprise = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ErrorResponse>,
    CreateEnterpriseRequest
  >({
    mutationFn: (data) => enterpriseApis.createEnterprise(data),

    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: enterpriseKeys.lists() });

      toast.success(res.message || "Thêm doanh nghiệp thành công");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Thêm doanh nghiệp thất bại"));
    },
  });
};

export const useUpdateEnterprise = (enterpriseId: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ErrorResponse>,
    UpdateEnterpriseRequest
  >({
    mutationFn: (data) => enterpriseApis.updateEnterprise(enterpriseId, data),

    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: enterpriseKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: enterpriseKeys.detail(enterpriseId),
      });

      queryClient.invalidateQueries({ queryKey: accidentReportKeys.all });

      toast.success(res.message || "Cập nhật doanh nghiệp thành công");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Cập nhật doanh nghiệp thất bại"));
    },
  });
};

export const useUpdateEnterpriseMe = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ErrorResponse>,
    UpdateEnterpriseMeRequest
  >({
    mutationFn: (data) => enterpriseApis.updateEnterpriseMe(data),

    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: enterpriseKeys.me() });

      queryClient.invalidateQueries({ queryKey: accidentReportKeys.all });

      toast.success(res.message || "Cập nhật doanh nghiệp thành công");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Cập nhật doanh nghiệp thất bại"));
    },
  });
};

export const useDeleteEnterprises = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ErrorResponse>,
    DeleteEnterpriseRequest
  >({
    mutationFn: (data) => enterpriseApis.deleteEnterprises(data),

    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: enterpriseKeys.all });

      queryClient.invalidateQueries({ queryKey: accidentReportKeys.all });

      toast.success(res.message || "Xóa doanh nghiệp thành công");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Xóa doanh nghiệp thất bại"));
    },
  });
};
