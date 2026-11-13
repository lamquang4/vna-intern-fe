import { z } from "zod";
import type { UpdateAccidentReportRequest } from "../models/accident-report.model";
import {
  MAX_ACCIDENT_REPORT_PDF_SIZE,
  MAX_REVIEW_NOTE_LENGTH,
  MIME_PDF,
} from "@/libs/core/constants/limits";

const countField = z
  .number({ message: "Vui lòng nhập số" })
  .int("Phải là số nguyên")
  .min(0, "Không được nhỏ hơn 0")
  .nullable()
  .optional()
  .transform((value) => value ?? 0);

const moneyField = z
  .number({ message: "Vui lòng nhập số" })
  .min(0, "Không được nhỏ hơn 0")
  .nullable()
  .optional()
  .transform((value) => value ?? 0);

const isFile = (value: unknown): value is File =>
  typeof File !== "undefined" && value instanceof File;

const pdfFileSchema = z
  .custom<File>(isFile, "Vui lòng chọn tệp PDF hợp lệ")
  .refine((file) => file.type === MIME_PDF, "Chỉ chấp nhận tệp PDF")
  .refine(
    (file) => file.size <= MAX_ACCIDENT_REPORT_PDF_SIZE,
    `Tệp tối đa ${MAX_ACCIDENT_REPORT_PDF_SIZE / (1024 * 1024)} MB`,
  );

const pdfField = pdfFileSchema.nullable().optional();

const victimShape = {
  totalVictims: countField,
  totalFemaleVictims: countField,
  totalFatalVictims: countField,
  totalSeverelyInjuredVictims: countField,
  nonManagedVictims: countField,
  nonManagedFemaleVictims: countField,
  nonManagedFatalVictims: countField,
  nonManagedSeverelyInjuredVictims: countField,
};

const expenseShape = {
  medicalExpense: moneyField,
  salaryExpenseDuringTreatment: moneyField,
  compensationExpense: moneyField,
  totalExpense: moneyField.optional(),
  totalDaysOff: countField,
};

const addIssue = (ctx: z.RefinementCtx, path: string, message: string) =>
  ctx.addIssue({ code: "custom", path: [path], message });

const validateVictims = (
  data: {
    totalVictims: number;
    totalFemaleVictims: number;
    totalFatalVictims: number;
    totalSeverelyInjuredVictims: number;
    nonManagedVictims: number;
    nonManagedFemaleVictims: number;
    nonManagedFatalVictims: number;
    nonManagedSeverelyInjuredVictims: number;
  },
  ctx: z.RefinementCtx,
) => {
  // Tổng
  if (data.totalFemaleVictims > data.totalVictims) {
    addIssue(
      ctx,
      "totalFemaleVictims",
      "Số LĐ nữ bị nạn không được lớn hơn tổng số người bị nạn",
    );
  }
  if (data.totalFatalVictims > data.totalVictims) {
    addIssue(
      ctx,
      "totalFatalVictims",
      "Số người chết không được lớn hơn tổng số người bị nạn",
    );
  }
  if (data.totalSeverelyInjuredVictims > data.totalVictims) {
    addIssue(
      ctx,
      "totalSeverelyInjuredVictims",
      "Số người bị thương nặng không được lớn hơn tổng số người bị nạn",
    );
  }
  if (
    data.totalFemaleVictims +
      data.totalFatalVictims +
      data.totalSeverelyInjuredVictims >
    data.totalVictims
  ) {
    addIssue(
      ctx,
      "totalVictims",
      "LĐ nữ bị nạn + người chết + người bị thương nặng không được lớn hơn tổng số người bị nạn",
    );
  }

  if (data.nonManagedVictims > data.totalVictims) {
    addIssue(
      ctx,
      "nonManagedVictims",
      "Số người bị nạn không QL không được lớn hơn tổng số người bị nạn",
    );
  }
  if (data.nonManagedFemaleVictims > data.totalFemaleVictims) {
    addIssue(
      ctx,
      "nonManagedFemaleVictims",
      "Số lao động nữ không QL không được lớn hơn tổng số lao động nữ bị nạn",
    );
  }
  if (data.nonManagedFatalVictims > data.totalFatalVictims) {
    addIssue(
      ctx,
      "nonManagedFatalVictims",
      "Số người chết không QL không được lớn hơn tổng số người chết",
    );
  }
  if (
    data.nonManagedSeverelyInjuredVictims > data.totalSeverelyInjuredVictims
  ) {
    addIssue(
      ctx,
      "nonManagedSeverelyInjuredVictims",
      "Số người bị thương nặng không QL không được lớn hơn tổng số người bị thương nặng",
    );
  }

  if (data.nonManagedFemaleVictims > data.nonManagedVictims) {
    addIssue(
      ctx,
      "nonManagedFemaleVictims",
      "LĐ nữ bị nạn không QL không được lớn hơn số người bị nạn không QL",
    );
  }
  if (data.nonManagedFatalVictims > data.nonManagedVictims) {
    addIssue(
      ctx,
      "nonManagedFatalVictims",
      "Số người chết không QL không được lớn hơn số người bị nạn không QL",
    );
  }
  if (data.nonManagedSeverelyInjuredVictims > data.nonManagedVictims) {
    addIssue(
      ctx,
      "nonManagedSeverelyInjuredVictims",
      "Người bị thương nặng không QL không được lớn hơn số người bị nạn không QL",
    );
  }
  if (
    data.nonManagedFemaleVictims +
      data.nonManagedFatalVictims +
      data.nonManagedSeverelyInjuredVictims >
    data.nonManagedVictims
  ) {
    addIssue(
      ctx,
      "nonManagedVictims",
      "LĐ nữ + người chết + người bị thương nặng không QL không được lớn hơn số người bị nạn không QL",
    );
  }
};

const withTotalExpense = <
  T extends {
    medicalExpense: number;
    salaryExpenseDuringTreatment: number;
    compensationExpense: number;
  },
>(
  data: T,
): Omit<T, "totalExpense"> & { totalExpense: number } => ({
  ...data,
  totalExpense:
    data.medicalExpense +
    data.salaryExpenseDuringTreatment +
    data.compensationExpense,
});

const accidentStatsSchema = z
  .object({
    totalCases: countField,
    fatalCases: countField,
    totalCasesWithTwoOrMoreVictims: countField,
    ...victimShape,
    ...expenseShape,
    propertyDamageExpense: moneyField,
  })
  .superRefine((data, ctx) => {
    if (data.fatalCases > data.totalCases) {
      addIssue(
        ctx,
        "fatalCases",
        "Số vụ có người chết không được lớn hơn tổng số vụ",
      );
    }
    if (data.totalCasesWithTwoOrMoreVictims > data.totalCases) {
      addIssue(
        ctx,
        "totalCasesWithTwoOrMoreVictims",
        "Số vụ có từ 2 người bị nạn trở lên không được lớn hơn tổng số vụ",
      );
    }
    validateVictims(data, ctx);
  })
  .transform(withTotalExpense);

// ---------- Chi tiết tai nạn ----------

const accidentDetailSchema = z
  .object({
    accidentDetailId: z.string().nullable().optional(),
    injuryTypeId: z.string().min(1, "Vui lòng chọn nguyên nhân xảy ra TNLĐ"),
    injuryFactorId: z.string().min(1, "Vui lòng chọn yếu tố gây chấn thương"),
    occupationId: z.string().min(1, "Vui lòng chọn nghề nghiệp"),
    ...victimShape,
    ...expenseShape,
    propertyDamageExpense: moneyField,
  })
  .superRefine(validateVictims)
  .transform(withTotalExpense);

// ---------- Cập nhật báo cáo tai nạn lao động ----------

export const updateAccidentReportSchema = z
  .object({
    totalEmployees: countField,
    femaleEmployees: countField,
    totalSalaryFund: moneyField,
    accidentTotals: accidentStatsSchema.nullable().optional(),
    accidentDetails: z.array(accidentDetailSchema).nullable().optional(),
    subsidizedAccident: accidentStatsSchema.nullable().optional(),
    stampedReport: pdfField,
  })
  .superRefine((data, ctx) => {
    if (
      data.totalEmployees != null &&
      data.femaleEmployees != null &&
      data.femaleEmployees > data.totalEmployees
    ) {
      addIssue(
        ctx,
        "femaleEmployees",
        "Tổng số lao động nữ không được lớn hơn tổng số lao động của cơ sở",
      );
    }
  }) satisfies z.ZodType<UpdateAccidentReportRequest>;

export type UpdateAccidentReportData = z.infer<
  typeof updateAccidentReportSchema
>;

export type UpdateAccidentReportFormValues = z.input<
  typeof updateAccidentReportSchema
>;

export const reviewNoteSchema = z.object({
  note: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập ghi chú lý do")
    .max(MAX_REVIEW_NOTE_LENGTH, `Tối đa ${MAX_REVIEW_NOTE_LENGTH} ký tự`),
});

export type ReviewNoteData = z.infer<typeof reviewNoteSchema>;
