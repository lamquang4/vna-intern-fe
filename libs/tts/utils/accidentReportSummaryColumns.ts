import type { GroupTableColumn } from "@/libs/core/models/component.model";
import type { ReportSummaryDamage } from "@/libs/shared/tts/models/accident-report.model";
import type { SummaryRow } from "@/libs/tts/utils/accidentReportSummary";

const col = (
  field: keyof SummaryRow & string,
  header: string,
): GroupTableColumn<SummaryRow> => ({
  key: field,
  header,
  field,
});

const victimGroup = (
  header: string,
  total: keyof SummaryRow & string,
  nonManaged: keyof SummaryRow & string,
): GroupTableColumn<SummaryRow> => ({
  key: `${total}-group`,
  header,
  children: [
    col(total, "Tổng số"),
    col(nonManaged, "NN không thuộc quyền quản lý"),
  ],
});

export const accidentSummaryColumns: GroupTableColumn<SummaryRow>[] = [
  { ...col("name", "Tên chỉ tiêu thống kê"), align: "left" },
  col("code", "Mã số"),
  {
    key: "classification",
    header: "Phân loại TNLĐ theo mức độ thương tật",
    children: [
      {
        key: "cases",
        header: "Số vụ (Vụ)",
        children: [
          col("totalCases", "Tổng số"),
          col("fatalCases", "Số vụ có người chết"),
          col(
            "totalCasesWithTwoOrMoreVictims",
            "Số vụ có từ 2 người bị nạn trở lên",
          ),
        ],
      },
      {
        key: "victims",
        header: "Số người bị nạn (Người)",
        children: [
          victimGroup("Tổng số", "totalVictims", "nonManagedVictims"),
          victimGroup(
            "Số LĐ nữ",
            "totalFemaleVictims",
            "nonManagedFemaleVictims",
          ),
          victimGroup(
            "Số người bị chết",
            "totalFatalVictims",
            "nonManagedFatalVictims",
          ),
          victimGroup(
            "Số người bị thương nặng",
            "totalSeverelyInjuredVictims",
            "nonManagedSeverelyInjuredVictims",
          ),
        ],
      },
    ],
  },
];

const damageCol = (
  field: keyof ReportSummaryDamage,
  header: string,
): GroupTableColumn<ReportSummaryDamage> => ({ key: field, header, field });

export const accidentDamageColumns: GroupTableColumn<ReportSummaryDamage>[] = [
  damageCol(
    "totalDaysOff",
    "Tổng số ngày nghỉ vì tai nạn lao động (kể cả ngày nghỉ chế độ)",
  ),
  {
    key: "expense",
    header: "Tổng số chi phí do tai nạn lao động (1.000đ)",
    children: [
      damageCol("totalExpense", "Tổng số"),
      {
        key: "specificExpense",
        header: "Khoản chi cụ thể của cơ sở",
        children: [
          damageCol("medicalExpense", "Y tế"),
          damageCol(
            "salaryExpenseDuringTreatment",
            "Trả lương trong thời gian điều trị",
          ),
          damageCol("compensationExpense", "Bồi thường trợ cấp"),
        ],
      },
    ],
  },
  damageCol("propertyDamageExpense", "Thiệt hại tài sản (1.000đ)"),
];
