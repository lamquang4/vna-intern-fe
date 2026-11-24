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

const addIssue = (
  ctx: z.RefinementCtx,
  path: string | (string | number)[],
  message: string,
) =>
  ctx.addIssue({
    code: "custom",
    path: Array.isArray(path) ? path : [path],
    message,
  });

type VictimValues = {
  totalVictims: number;
  totalFemaleVictims: number;
  totalFatalVictims: number;
  totalSeverelyInjuredVictims: number;
  nonManagedVictims: number;
  nonManagedFemaleVictims: number;
  nonManagedFatalVictims: number;
  nonManagedSeverelyInjuredVictims: number;
};

const hasAnyVictim = (data: VictimValues) =>
  [
    data.totalVictims,
    data.totalFemaleVictims,
    data.totalFatalVictims,
    data.totalSeverelyInjuredVictims,
    data.nonManagedVictims,
    data.nonManagedFemaleVictims,
    data.nonManagedFatalVictims,
    data.nonManagedSeverelyInjuredVictims,
  ].some((value) => value > 0);

const validateVictims = (data: VictimValues, ctx: z.RefinementCtx) => {
  // 1. Nhóm (1) - Tổng số người bị nạn
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
      "Số người bị chết không được lớn hơn tổng số người bị nạn",
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
    data.totalFatalVictims + data.totalSeverelyInjuredVictims >
    data.totalVictims
  ) {
    addIssue(
      ctx,
      "totalVictims",
      "Số người bị chết + số người bị thương nặng không được lớn hơn tổng số người bị nạn",
    );
  }

  // 2. Nhóm (2) - Người bị nạn không QL
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
    data.nonManagedFatalVictims + data.nonManagedSeverelyInjuredVictims >
    data.nonManagedVictims
  ) {
    addIssue(
      ctx,
      "nonManagedVictims",
      "Số người chết không QL + người bị thương nặng không QL không được lớn hơn số người bị nạn không QL",
    );
  }
};

// Có chi phí / ngày nghỉ thì phải có người bị nạn (> 0)
const expenseRequireVictimFields = [
  { key: "medicalExpense", label: "Chi phí y tế" },
  {
    key: "salaryExpenseDuringTreatment",
    label: "Chi phí trả lương trong thời gian điều trị",
  },
  { key: "compensationExpense", label: "Chi phí bồi thường trợ cấp" },
  { key: "totalDaysOff", label: "Tổng số ngày nghỉ vì TNLĐ" },
] as const;

const validateExpenseRequireVictims = (
  data: VictimValues & {
    medicalExpense: number;
    salaryExpenseDuringTreatment: number;
    compensationExpense: number;
    totalDaysOff: number;
  },
  ctx: z.RefinementCtx,
) => {
  if (hasAnyVictim(data)) return;

  for (const { key, label } of expenseRequireVictimFields) {
    if (data[key] > 0) {
      addIssue(
        ctx,
        key,
        `Chưa có người bị nạn nào nên ${label.toLowerCase()} phải bằng 0`,
      );
    }
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
        "Tổng số vụ có người chết không được lớn hơn tổng số vụ",
      );
    }
    if (data.totalCasesWithTwoOrMoreVictims > data.totalCases) {
      addIssue(
        ctx,
        "totalCasesWithTwoOrMoreVictims",
        "Tổng số vụ có từ 2 người bị nạn trở lên không được lớn hơn tổng số vụ",
      );
    }

    validateVictims(data, ctx);
    validateExpenseRequireVictims(data, ctx);
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
  .superRefine((data, ctx) => {
    // Nhóm (1) và nhóm (2) độc lập nhau trong từng chi tiết: có thể (1) = 0
    // hoặc (2) = 0, nhưng không được cả hai nhóm cùng = 0.
    if (!hasAnyVictim(data)) {
      const message =
        "Mỗi chi tiết TNLĐ phải có số liệu ở nhóm (1) hoặc nhóm (2), không được để cả hai nhóm đều bằng 0";
      addIssue(ctx, "totalVictims", message);
      addIssue(ctx, "nonManagedVictims", message);
    }

    validateVictims(data, ctx);
    validateExpenseRequireVictims(data, ctx);
  })
  .transform(withTotalExpense);

// ---------- Ràng buộc chéo: chi tiết TNLĐ <-> tổng số vụ TNLĐ ----------

const detailCrossCheckFields = [
  { key: "totalVictims", label: "Tổng số người bị nạn" },
  { key: "totalFemaleVictims", label: "Số LĐ nữ bị nạn" },
  { key: "totalFatalVictims", label: "Số người chết" },
  { key: "totalSeverelyInjuredVictims", label: "Số người bị thương nặng" },
  { key: "nonManagedVictims", label: "Số người bị nạn không QL" },
  { key: "nonManagedFemaleVictims", label: "LĐ nữ bị nạn không QL" },
  { key: "nonManagedFatalVictims", label: "Số người chết không QL" },
  {
    key: "nonManagedSeverelyInjuredVictims",
    label: "Người bị thương nặng không QL",
  },
  { key: "medicalExpense", label: "Chi phí y tế" },
  {
    key: "salaryExpenseDuringTreatment",
    label: "Chi phí trả lương trong thời gian điều trị",
  },
  { key: "compensationExpense", label: "Chi phí bồi thường trợ cấp" },
  { key: "totalDaysOff", label: "Tổng số ngày nghỉ vì TNLĐ" },
  { key: "propertyDamageExpense", label: "Thiệt hại tài sản" },
] as const;

const expenseRequireVictimKeySet = new Set<string>(
  expenseRequireVictimFields.map((f) => f.key),
);

const EPSILON = 0.005;
const formatNumber = (value: number) => value.toLocaleString("vi-VN");

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
    if (data.femaleEmployees > data.totalEmployees) {
      addIssue(
        ctx,
        "femaleEmployees",
        "Tổng số lao động nữ không được lớn hơn tổng số lao động của cơ sở",
      );
    }

    // Nếu không gửi accidentDetails (đang bấm Lưu ở bước 0 hoặc bước 1) => bỏ qua kiểm tra bước 2
    if (data.accidentDetails === undefined) return;

    const totals = data.accidentTotals;
    const details = data.accidentDetails ?? [];

    if (!totals) {
      if (details.length > 0) {
        addIssue(
          ctx,
          "accidentDetails",
          "Vui lòng nhập mục Tổng số vụ TNLĐ trước khi khai báo chi tiết",
        );
      }
      return;
    }

    if (totals.totalCases > 0 && details.length === 0) {
      addIssue(
        ctx,
        "accidentDetails",
        `Bạn đã khai báo ${totals.totalCases} vụ TNLĐ, vui lòng nhập thông tin chi tiết tương ứng`,
      );
      return;
    }

    if (details.length === 0) return;

    for (const { key, label } of detailCrossCheckFields) {
      const total = totals[key];
      const sum = details.reduce((acc, detail) => acc + detail[key], 0);
      const isExpenseKey = expenseRequireVictimKeySet.has(key);

      let hasExceeded = false;
      let hasInvalidZeroVictimExpense = false;

      // Ưu tiên 1 & 2: Kiểm tra từng chi tiết
      details.forEach((detail, index) => {
        const value = detail[key];

        if (isExpenseKey && !hasAnyVictim(detail) && value > 0) {
          hasInvalidZeroVictimExpense = true;
          return;
        }

        if (value - total > EPSILON) {
          hasExceeded = true;
          addIssue(
            ctx,
            ["accidentDetails", index, key],
            `${label} không được lớn hơn tổng đã nhập ở bước Tai nạn lao động (${formatNumber(total)})`,
          );
        }
      });

      // Ưu tiên 3: Kiểm tra tổng các chi tiết phải bằng tổng ở bước Tai nạn lao động
      if (
        !hasExceeded &&
        !hasInvalidZeroVictimExpense &&
        Math.abs(sum - total) > EPSILON
      ) {
        const lastIndex = details.length - 1;
        const diff = Math.abs(total - sum);
        const diffText =
          sum < total
            ? `còn thiếu ${formatNumber(diff)}`
            : `đang thừa ${formatNumber(diff)}`;

        addIssue(
          ctx,
          ["accidentDetails", lastIndex, key],
          details.length === 1
            ? `${label} (${formatNumber(sum)}) phải bằng tổng đã nhập ở bước Tai nạn lao động (${formatNumber(total)})`
            : `Tổng ${label.toLowerCase()} của các chi tiết (${formatNumber(sum)}, ${diffText}) phải bằng tổng đã nhập ở bước Tai nạn lao động (${formatNumber(total)})`,
        );
      }
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
