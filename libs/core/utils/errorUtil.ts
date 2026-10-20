import { ErrorResponse } from "@/libs/shared/core/models/common.model";
import { AxiosError } from "axios";

export const getErrorMessage = (
  error: AxiosError<ErrorResponse>,
  fallback: string,
): string => {
  const message = error.response?.data?.message;

  if (Array.isArray(message)) {
    return message[0] ?? fallback;
  }

  return message ?? fallback;
};