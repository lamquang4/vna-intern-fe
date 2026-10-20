import { z } from "zod";
import type { UpdateUserRequest } from "../models/user.model";
import {
  validateBirthDate,
  validateBirthDateNotFuture,
  validateImageSize,
  validateImageType,
} from "@/libs/core/utils/validators";
import {
  MAX_ADDRESS_LENGTH,
  MAX_FULLNAME_LENGTH,
  MAX_POSITION_LENGTH,
} from "@/libs/core/constants/limits";

const birthDateField = z
  .string()
  .trim()
  .nullish()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || validateBirthDate(v), "Ngày sinh không hợp lệ")
  .refine(
    (v) => v === null || !validateBirthDate(v) || validateBirthDateNotFuture(v),
    "Ngày sinh không được ở tương lai",
  );

const avatarField = z
  .instanceof(File)
  .refine(validateImageType, "Chỉ chấp nhận ảnh .jpeg, .jpg, .png")
  .refine(validateImageSize, "Ảnh tối đa 5 MB")
  .nullish();

export const updateUserSchema = z.object({
  fullname: z
    .string()
    .trim()
    .min(1, "Họ tên không để trống")
    .max(MAX_FULLNAME_LENGTH, `Họ tên tối đa ${MAX_FULLNAME_LENGTH} ký tự`),
  birthDate: birthDateField.optional(),
  gender: z
    .enum(["MALE", "FEMALE"])
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  position: z
    .string()
    .trim()
    .max(MAX_POSITION_LENGTH, `Chức danh tối đa ${MAX_POSITION_LENGTH} ký tự`)
    .nullable()
    .optional(),
  roleId: z.string().min(1, "Vui lòng chọn vai trò"),
  province: z.string().nullable().optional(),
  ward: z.string().nullable().optional(),
  address: z
    .string()
    .trim()
    .max(MAX_ADDRESS_LENGTH, `Địa chỉ tối đa ${MAX_ADDRESS_LENGTH} ký tự`)
    .nullable()
    .optional(),
  isActive: z.boolean(),
  avatar: avatarField,
}) satisfies z.ZodType<UpdateUserRequest>;

export type UpdateUserData = z.infer<typeof updateUserSchema>;
