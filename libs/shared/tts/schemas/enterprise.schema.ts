import { z } from "zod";
import type {
  CreateEnterpriseRequest,
  UpdateEnterpriseRequest,
} from "../models/enterprise.model";
import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  MAX_ADDRESS_LENGTH,
  MAX_BUSINESS_LOCATION_LENGTH,
  MAX_DOCUMENT_SIZE,
  MAX_ENTERPRISE_NAME_LENGTH,
  MAX_FOREIGN_NAME_LENGTH,
  MAX_REPRESENTATIVE_LENGTH,
} from "@/libs/core/constants/limits";
import {
  emailField,
  optionalPastDate,
  optionalPhone,
  optionalSelect,
  optionalText,
} from "./common.schema";
import { validateTaxCode } from "@/libs/core/utils/validators";

const taxCodeField = z
  .string()
  .trim()
  .min(1, "Mã số thuế không để trống")
  .refine((v) => validateTaxCode(v), "Mã số thuế gồm 10 số");

const documentField = z
  .instanceof(File)
  .refine(
    (file) => ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type),
    "Chỉ chấp nhận ảnh .jpeg, .jpg, .png hoặc tệp .pdf, .doc, .docx",
  )
  .refine((file) => file.size <= MAX_DOCUMENT_SIZE, "Tệp tối đa 25 MB")
  .nullish();

const baseShape = {
  name: z
    .string()
    .trim()
    .min(1, "Tên doanh nghiệp không để trống")
    .max(
      MAX_ENTERPRISE_NAME_LENGTH,
      `Tên doanh nghiệp tối đa ${MAX_ENTERPRISE_NAME_LENGTH} ký tự`,
    ),
  licenseIssueDate: optionalPastDate(
    "Ngày cấp không hợp lệ",
    "Ngày cấp không được ở tương lai",
  ),
  businessTypeId: z.string().min(1, "Vui lòng chọn loại hình kinh doanh"),
  businessIndustryId: z.string().min(1, "Vui lòng chọn ngành nghề kinh doanh"),
  province: z.string().min(1, "Vui lòng chọn tỉnh/thành phố"),
  ward: z.string().min(1, "Vui lòng chọn phường/xã"),
  address: optionalText(
    MAX_ADDRESS_LENGTH,
    `Địa chỉ tối đa ${MAX_ADDRESS_LENGTH} ký tự`,
  ),
  foreignName: optionalText(
    MAX_FOREIGN_NAME_LENGTH,
    `Tên viết bằng tiếng nước ngoài tối đa ${MAX_FOREIGN_NAME_LENGTH} ký tự`,
  ),
  email: emailField,
  officePhone: optionalPhone,
  operatingProvince: optionalSelect,
  operatingWard: optionalSelect,
  businessLocation: optionalText(
    MAX_BUSINESS_LOCATION_LENGTH,
    `Địa điểm kinh doanh tối đa ${MAX_BUSINESS_LOCATION_LENGTH} ký tự`,
  ),
  representative: optionalText(
    MAX_REPRESENTATIVE_LENGTH,
    `Tên người đứng đầu doanh nghiệp tối đa ${MAX_REPRESENTATIVE_LENGTH} ký tự`,
  ),
  representativePhone: optionalPhone,
  businessLicense: documentField,
  otherDocument: documentField,
};

// ---------- Tạo doanh nghiệp ----------

export const createEnterpriseSchema = z.object({
  taxCode: taxCodeField,
  ...baseShape,
}) satisfies z.ZodType<CreateEnterpriseRequest>;

export type CreateEnterpriseData = z.infer<typeof createEnterpriseSchema>;

// ---------- Cập nhật doanh nghiệp ----------

export const updateEnterpriseSchema = z.object({
  ...baseShape,
}) satisfies z.ZodType<UpdateEnterpriseRequest>;

export type UpdateEnterpriseData = z.infer<typeof updateEnterpriseSchema>;
