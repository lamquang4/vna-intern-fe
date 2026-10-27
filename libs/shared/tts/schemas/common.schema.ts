import { z } from "zod";
import {
  MAX_EMAIL_LENGTH,
  MAX_PHONE_LENGTH,
} from "@/libs/core/constants/limits";
import {
  validateDate,
  validateDateNotFuture,
  validatePhone,
} from "@/libs/core/utils/validators";

export const emailField = z
  .string()
  .trim()
  .min(1, "Email không để trống")
  .email("Email không hợp lệ")
  .max(MAX_EMAIL_LENGTH, `Email tối đa ${MAX_EMAIL_LENGTH} ký tự`);

export const optionalPhone = z
  .string()
  .trim()
  .max(MAX_PHONE_LENGTH, `Số điện thoại tối đa ${MAX_PHONE_LENGTH} số`)
  .nullish()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || validatePhone(v), "Số điện thoại không hợp lệ");

export const optionalPastDate = (
  invalidMessage: string,
  futureMessage: string,
) =>
  z
    .string()
    .trim()
    .nullish()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || validateDate(v), invalidMessage)
    .refine(
      (v) => v === null || !validateDate(v) || validateDateNotFuture(v),
      futureMessage,
    );

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
