import GroupTable from "@/libs/core/components/ui/GroupTable";
import type {
  GroupTableColumn,
  GroupTableRow,
} from "@/libs/core/models/component.model";
import type {
  AccidentVictimStats,
  OverallAccidentReportResponse,
  ReportSummaryDamage,
} from "@/libs/shared/tts/models/accident-report.model";

type ClassificationRow = AccidentVictimStats &
  Partial<ReportSummaryDamage> & {
    group: string;
    name: string;
    code: string;
    isFirstInGroup: boolean;
    groupSize: number;
  };

const col = (
  field: keyof ClassificationRow & string,
  header: string,
): GroupTableColumn<ClassificationRow> => ({ key: field, header, field });

const columns: GroupTableColumn<ClassificationRow>[] = [
  {
    key: "group",
    header: "Phân loại",
    align: "left",
    cell: (row) => row.group,
    rowSpan: (row) => (row.isFirstInGroup ? row.groupSize : 0),
  },
  { ...col("name", "Tên chỉ tiêu thống kê"), align: "left" },
  col("code", "Mã số"),
  {
    key: "classification",
    header: "Phân loại TNLĐ theo mức độ thương tật",
    children: [
      {
        key: "cases",
        header: "Số vụ TNLĐ",
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
          col("totalVictims", "Tổng số"),
          col("totalFemaleVictims", "Số LĐ nữ"),
          col("totalFatalVictims", "Số người bị chết"),
          col("totalSeverelyInjuredVictims", "Số người bị thương nặng"),
        ],
      },
    ],
  },
  {
    key: "damage",
    header: "Theo mức độ thương tật",
    children: [
      col("totalDaysOff", "Tổng số ngày nghỉ vì TNLĐ"),
      col("totalExpense", "Tổng số tiền"),
      {
        key: "expenseDetail",
        header: "Trong đó",
        children: [
          col("medicalExpense", "Y tế"),
          col(
            "salaryExpenseDuringTreatment",
            "Trả lương theo thời gian điều trị",
          ),
          col("compensationExpense", "Bồi thường/Trợ cấp"),
        ],
      },
      col("propertyDamageExpense", "Thiệt hại tài sản (1.000 đ)"),
    ],
  },
];

interface Props {
  summary?: OverallAccidentReportResponse;
}

function OverallClassificationTable({ summary }: Props) {
  const sections = summary
    ? [
        { label: "Phân theo nghề nghiệp", categories: summary.occupations },
        {
          label: "Phân theo nguyên nhân xảy ra tai nạn",
          categories: summary.injuryTypes,
        },
        {
          label: "Phân theo yếu tố gây chấn thương",
          categories: summary.injuryFactors,
        },
      ]
    : [];

  const rows: GroupTableRow<ClassificationRow>[] = [
    ...(summary
      ? [
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
        ]
      : []),
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

  return <GroupTable columns={columns} rows={rows} minWidth={1600} />;
}

export default OverallClassificationTable;
