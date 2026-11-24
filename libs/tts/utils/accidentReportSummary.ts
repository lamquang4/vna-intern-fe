import type { GroupTableRow } from "@/libs/core/models/component.model";
import type {
  AccidentReportSummaryResponse,
  AccidentVictimStats,
  ReportSummaryCategory,
} from "@/libs/shared/tts/models/accident-report.model";

export type SummaryRow = AccidentVictimStats & { name: string; code: string };

type Row = GroupTableRow<SummaryRow>;

const section = (id: string, section: string): Row => ({ id, section });

const categoryRows = (
  prefix: string,
  categories: ReportSummaryCategory[],
): Row[] =>
  categories.map((category) => ({
    id: `${prefix}-${category.categoryId}`,
    data: {
      ...category,
      totalCases: 0,
      fatalCases: 0,
      totalCasesWithTwoOrMoreVictims: 0,
    },
  }));

export const buildSummaryRows = (
  summary: AccidentReportSummaryResponse,
): Row[] => [
  section("s1", "1. Tai nạn lao động"),
  {
    id: "accident",
    data: { ...summary.accident, name: "Tai nạn lao động", code: "" },
  },
  section("s1-1", "1.1. Phân theo nguyên nhân xảy ra TNLĐ"),
  ...categoryRows("injury-type", summary.injuryTypes),
  section("s1-2", "1.2. Phân theo yếu tố gây chấn thương"),
  ...categoryRows("injury-factor", summary.injuryFactors),
  section("s1-3", "1.3. Phân theo nghề nghiệp"),
  ...categoryRows("occupation", summary.occupations),
  section(
    "s2",
    "2. Tai nạn được hưởng trợ cấp theo quy định tại Khoản 2 Điều 39 Luật ATVSLĐ",
  ),
  {
    id: "subsidized",
    data: { ...summary.subsidizedAccident, name: "", code: "10" },
  },
  section("s3", "3. Tổng số"),
  {
    id: "grand-total",
    bold: true,
    data: { ...summary.grandTotal, name: "Tổng số (3=1+2)", code: "" },
  },
];
