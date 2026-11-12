"use client";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type {
  ApiResponse,
  ErrorResponse,
} from "@/libs/shared/core/models/common.model";
import type { CategoryResponse } from "@/libs/shared/tts/models/category.model";
import { categoryApi } from "../services/apis/categoryApis";
import { CategoryType } from "@/libs/shared/tts/models/enums";

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  byType: (type?: CategoryType) => [...categoryKeys.lists(), type] as const,
};

export const useGetCategories = (type: CategoryType) => {
  return useQuery<ApiResponse<CategoryResponse[]>, AxiosError<ErrorResponse>>({
    queryKey: categoryKeys.byType(type),
    queryFn: () => categoryApi.getAllCategories(type),
  });
};

export const useGetInjuryFactors = () =>
  useGetCategories(CategoryType.INJURY_FACTOR);
export const useGetInjuryTypes = () =>
  useGetCategories(CategoryType.INJURY_TYPE);
export const useGetOccupations = () =>
  useGetCategories(CategoryType.OCCUPATION);
