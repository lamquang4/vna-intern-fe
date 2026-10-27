import { z } from "zod";
import type {
  ChangeEmailRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  InitializePasswordRequest,
  LoginRequest,
  ResetPasswordRequest,
  VerifyChangeEmailOtpRequest,
} from "../models/auth.model";
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  OTP_LENGTH,
} from "@/libs/core/constants/limits";
import { validateOtp } from "@/libs/core/utils/validators";
import { emailField } from "./common.schema";

const otpField = z
  .string()
  .trim()
  .length(OTP_LENGTH, `Mã OTP gồm ${OTP_LENGTH} chữ số`)
  .refine(validateOtp, "Mã OTP không hợp lệ");

const passwordField = z.string().min(1, "Mật khẩu không để trống");

const newPasswordField = z
  .string()
  .min(1, "Mật khẩu mới không để trống")
  .min(
    MIN_PASSWORD_LENGTH,
    `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự`,
  )
  .max(MAX_PASSWORD_LENGTH, `Mật khẩu tối đa ${MAX_PASSWORD_LENGTH} ký tự`);

const confirmPasswordField = z
  .string()
  .min(1, "Vui lòng nhập lại mật khẩu mới");

// ---------- Đăng nhập ----------

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Tên đăng nhập không để trống"),
  password: passwordField,
  rememberMe: z.boolean().optional(),
}) satisfies z.ZodType<LoginRequest>;

export type LoginData = z.infer<typeof loginSchema>;

// ---------- Quên mật khẩu ----------

export const forgotPasswordSchema = z.object({
  email: emailField,
}) satisfies z.ZodType<ForgotPasswordRequest>;

export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    email: emailField,
    otpCode: otpField,
    newPassword: newPasswordField,
    confirmNewPassword: confirmPasswordField,
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirmNewPassword"],
  }) satisfies z.ZodType<ResetPasswordRequest>;

export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

// ---------- Đổi mật khẩu ----------

export const changePasswordSchema = z
  .object({
    currentPassword: passwordField,
    newPassword: newPasswordField,
    confirmNewPassword: confirmPasswordField,
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "Mật khẩu mới phải khác mật khẩu cũ",
    path: ["newPassword"],
  }) satisfies z.ZodType<ChangePasswordRequest>;

export type ChangePasswordData = z.infer<typeof changePasswordSchema>;

// ---------- Đổi email ----------

export const verifyChangeEmailOtpSchema = z.object({
  otpCode: otpField,
}) satisfies z.ZodType<VerifyChangeEmailOtpRequest>;

export type VerifyChangeEmailOtpData = z.infer<
  typeof verifyChangeEmailOtpSchema
>;

export const changeEmailSchema = z.object({
  newEmail: emailField,
}) satisfies z.ZodType<ChangeEmailRequest>;

export type ChangeEmailData = z.infer<typeof changeEmailSchema>;

// ---------- Khởi tạo mật khẩu ----------

export const initializePasswordSchema = z.object({
  password: passwordField,
}) satisfies z.ZodType<InitializePasswordRequest>;

export type InitializePasswordData = z.infer<typeof initializePasswordSchema>;