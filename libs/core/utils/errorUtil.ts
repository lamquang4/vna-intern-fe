import { ErrorResponse } from "@/libs/shared/core/models/common.model";
import { AxiosError } from "axios";

export const getErrorMessage = (
  error: AxiosError<ErrorResponse>,
  fallback: string,
): string => {
  const message = error.response?.data?.message;

  if (Array.isArray(message)) {
    const messages = [...new Set(message.filter(Boolean))];
    return messages.length > 0 ? messages.join("\n") : fallback;
  }

  return message ?? fallback;
};