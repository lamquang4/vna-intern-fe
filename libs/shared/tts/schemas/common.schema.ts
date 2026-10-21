import { z } from "zod";
import { MAX_EMAIL_LENGTH } from "@/libs/core/constants/limits";

export const emailField = z
  .string()
  .trim()
  .min(1, "Email không để trống")
  .email("Email không hợp lệ")
  .max(MAX_EMAIL_LENGTH, `Email tối đa ${MAX_EMAIL_LENGTH} ký tự`);

export const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .nullish()
    .transform((v) => (v ? v : null));

export const optionalSelect = z
  .string()
  .nullish()
  .transform((v) => (v ? v : null));
