import type { GroupTableRow } from "@/libs/core/models/component.model";
import type {
  AccidentVictimStats,
  OverallAccidentReportResponse,
  OverallBusinessStats,
  ReportSummaryBusinessType,
  ReportSummaryDamage,
} from "@/libs/shared/tts/models/accident-report.model";

export type BusinessRow = OverallBusinessStats & { name: string; code: string };

export type ClassificationRow = AccidentVictimStats &
  Partial<ReportSummaryDamage> & {
    group: string;
    name: string;
    code: string;
    isFirstInGroup: boolean;
    groupSize: number;
  };

export const buildOverallBusinessRows = (
  businessTypes: ReportSummaryBusinessType[] = [],
  total?: OverallBusinessStats,
): GroupTableRow<BusinessRow>[] => [
  ...(total
    ? [
        {
          id: "total",
          bold: true,
          data: { ...total, name: "Tổng số", code: "" },
        },
      ]
    : []),
  ...businessTypes.map((bt) => ({ id: bt.businessTypeId, data: bt })),
];

export const buildOverallClassificationRows = (
  summary?: OverallAccidentReportResponse,
): GroupTableRow<ClassificationRow>[] => {
  if (!summary) return [];

  const sections = [
    { label: "Phân theo nghề nghiệp", categories: summary.occupations },
    {
      label: "Phân theo nguyên nhân xảy ra tai nạn",
      categories: summary.injuryTypes,
    },
    {
      label: "Phân theo yếu tố gây chấn thương",
      categories: summary.injuryFactors,
    },
  ];

  return [
    {
      id: "total",
      bold: true,
      data: {
        ...summary.total2,
        group: "Tổng số",
        name: "",
        code: "",
        isFirstInGroup: true,
        groupSize: 1,
      },
    },
    ...sections.flatMap(({ label, categories }) =>
      categories.map((category, index) => ({
        id: `${label}-${category.categoryId}`,
        data: {
          ...category,
          group: label,
          isFirstInGroup: index === 0,
          groupSize: categories.length,
        },
      })),
    ),
  ];
};
