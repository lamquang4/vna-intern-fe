"use client";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type {
  ApiResponse,
  ErrorResponse,
} from "@/libs/shared/core/models/common.model";
import type { BusinessIndustryResponse } from "@/libs/shared/tts/models/business-industry.model";
import { businessIndustryApis } from "../services/apis/businessIndustryApis";

export const businessIndustryKeys = {
  all: ["business-industries"] as const,
};

export const useGetAllBusinessIndustries = () => {
  return useQuery<
    ApiResponse<BusinessIndustryResponse[]>,
    AxiosError<ErrorResponse>
  >({
    queryKey: businessIndustryKeys.all,
    queryFn: () => businessIndustryApis.getAllBusinessIndustries(),
    staleTime: Infinity,
  });
};
