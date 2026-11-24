import { z } from "zod";
import { isValid, parseISO } from "date-fns";
import { AccidentReportPeriod } from "../models/enums";
import type {
  ConfigureReportDeadlineRequest,
  ExtendReportDeadlineRequest,
} from "../models/report-config.model";

const periodField = z.enum(AccidentReportPeriod, {
  error: "Vui lòng chọn loại báo cáo",
});

const deadlineDateField = z
  .string()
  .min(1, "Vui lòng nhập hạn nộp")
  .refine((value) => isValid(parseISO(value)), "Ngày hạn nộp không hợp lệ");

/* ---------- Cấu hình thời hạn ---------- */

export const createConfigureReportDeadlineSchema = (year: number) =>
  z
    .object({
      period: periodField,
      deadlineAt: deadlineDateField,
    })
    .superRefine(({ period, deadlineAt }, ctx) => {
      const selectedYear = parseISO(deadlineAt).getFullYear();

      if (period === AccidentReportPeriod.SIX_MONTHS) {
        if (selectedYear !== year) {
          ctx.addIssue({
            code: "custom",
            path: ["deadlineAt"],
            message: `Ngày hạn nộp 6 tháng phải nằm trong năm ${year}`,
          });
        }
        return;
      }

      if (selectedYear !== year && selectedYear !== year + 1) {
        ctx.addIssue({
          code: "custom",
          path: ["deadlineAt"],
          message: `Ngày hạn nộp cả năm phải nằm trong năm ${year} hoặc ${year + 1}`,
        });
      }
    }) satisfies z.ZodType<Omit<ConfigureReportDeadlineRequest, "year">>;

export type ConfigureReportDeadlineData = z.infer<
  ReturnType<typeof createConfigureReportDeadlineSchema>
>;

/* ---------- Gia hạn ---------- */

export const createExtendReportDeadlineSchema = (
  currentDeadline: Date | null,
) =>
  z.object({
    deadlineAt: deadlineDateField
      .refine((value) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return parseISO(value) >= today;
      }, "Hạn nộp mới phải là ngày trong tương lai")
      .refine(
        (value) => !currentDeadline || parseISO(value) > currentDeadline,
        "Hạn nộp mới phải sau hạn nộp đang áp dụng",
      ),
  }) satisfies z.ZodType<Pick<ExtendReportDeadlineRequest, "deadlineAt">>;

export type ExtendReportDeadlineData = z.infer<
  ReturnType<typeof createExtendReportDeadlineSchema>
>;
