"use client";
import { useQuery } from "@tanstack/react-query";
import type {
  ApiResponse,
  ErrorResponse,
} from "@/libs/shared/core/models/common.model";
import type { RoleResponse } from "@/libs/shared/tts/models/role.model";
import { roleApis } from "../services/apis/roleApis";
import { AxiosError } from "axios";

export const roleKeys = {
  all: ["roles"] as const,
};

export const useGetAllRoles = () => {
  return useQuery<ApiResponse<RoleResponse[]>, AxiosError<ErrorResponse>>({
    queryKey: roleKeys.all,
    queryFn: roleApis.getAllRoles,
  });
};
