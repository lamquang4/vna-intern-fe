"use client";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type {
  ApiResponse,
  ErrorResponse,
} from "@/libs/shared/core/models/common.model";
import { businessTypeApis } from "../services/apis/businessTypeApis";
import { BusinessTypeResponse } from "@/libs/shared/tts/models/business-type.model";

export const businessTypeKeys = {
  all: ["business-types"] as const,
};

export const useGetBusinessTypes = () => {
  return useQuery<
    ApiResponse<BusinessTypeResponse[]>,
    AxiosError<ErrorResponse>
  >({
    queryKey: businessTypeKeys.all,
    queryFn: () => businessTypeApis.getBusinessTypes(),
    staleTime: Infinity,
  });
};
