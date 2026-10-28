import { z } from "zod";
import type {
  CreateUserRequest,
  UpdateMeRequest,
  UpdateUserRequest,
} from "../models/user.model";
import {
  validateImageSize,
  validateImageType,
  validateUsername,
} from "@/libs/core/utils/validators";
import {
  MAX_ADDRESS_LENGTH,
  MAX_FULLNAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  MAX_POSITION_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "@/libs/core/constants/limits";
import {
  emailField,
  pastDateField,
  optionalSelect,
  optionalText,
} from "./common.schema";

const avatarField = z
  .instanceof(File)
  .refine(validateImageType, "Chỉ chấp nhận ảnh .jpeg, .jpg, .png")
  .refine(validateImageSize, "Dung lượng ảnh tối đa 5 MB")
  .nullable()
  .optional();

const optionalBirthDate = pastDateField(
  "Ngày sinh không hợp lệ",
  "Ngày sinh không được ở tương lai",
)
  .nullable()
  .optional();

const genderField = z
  .enum(["MALE", "FEMALE"])
  .nullable()
  .optional()
  .or(z.literal("").transform(() => null));

const baseShape = {
  fullname: z
    .string()
    .trim()
    .min(1, "Họ tên không để trống")
    .max(MAX_FULLNAME_LENGTH, `Họ tên tối đa ${MAX_FULLNAME_LENGTH} ký tự`),

  birthDate: optionalBirthDate,

  gender: genderField,

  position: optionalText(
    MAX_POSITION_LENGTH,
    `Chức danh tối đa ${MAX_POSITION_LENGTH} ký tự`,
  ),

  roleId: z.string().min(1, "Vui lòng chọn vai trò"),

  province: optionalSelect,

  ward: optionalSelect,

  address: optionalText(
    MAX_ADDRESS_LENGTH,
    `Địa chỉ tối đa ${MAX_ADDRESS_LENGTH} ký tự`,
  ),

  avatar: avatarField,
};

export const updateUserSchema = z.object({
  ...baseShape,
  isActive: z.boolean(),
}) satisfies z.ZodType<UpdateUserRequest>;

export type UpdateUserData = z.infer<typeof updateUserSchema>;

export const updateMeSchema = z.object({
  ...baseShape,
}) satisfies z.ZodType<UpdateMeRequest>;

export type UpdateMeData = z.infer<typeof updateMeSchema>;

export const createUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Tên tài khoản không để trống")
    .refine(validateUsername, "Tên tài khoản gồm VNA và 8 chữ số"),

  password: z
    .string()
    .min(
      MIN_PASSWORD_LENGTH,
      `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự`,
    )
    .max(MAX_PASSWORD_LENGTH, `Mật khẩu tối đa ${MAX_PASSWORD_LENGTH} ký tự`),

  email: emailField,

  ...baseShape,
  isActive: z.boolean(),
}) satisfies z.ZodType<CreateUserRequest>;

export type CreateUserData = z.infer<typeof createUserSchema>;
