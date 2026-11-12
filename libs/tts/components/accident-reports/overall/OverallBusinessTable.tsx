import GroupTable from "@/libs/core/components/ui/GroupTable";
import type {
  GroupTableColumn,
  GroupTableRow,
} from "@/libs/core/models/component.model";
import type {
  OverallBusinessStats,
  ReportSummaryBusinessType,
} from "@/libs/shared/tts/models/accident-report.model";

type BusinessRow = OverallBusinessStats & { name: string; code: string };

const col = (
  field: keyof BusinessRow & string,
  header: string,
): GroupTableColumn<BusinessRow> => ({
  key: field,
  header,
  field,
});

const columns: GroupTableColumn<BusinessRow>[] = [
  { ...col("name", "Loại hình cơ sở"), align: "left" },
  col("code", "Mã số"),
  {
    key: "business",
    header: "Cơ sở",
    children: [
      col("totalBusinesses", "Tổng số"),
      col("reportedBusinesses", "Số cơ sở tham gia"),
    ],
  },
  {
    key: "labor",
    header: "Lực lượng lao động",
    children: [
      col("totalEmployees", "Tổng số lao động"),
      col("reportedEmployees", "Số LĐ của cơ sở tham gia báo cáo"),
      col("femaleEmployees", "Số lao động nữ"),
    ],
  },
  {
    key: "accidents",
    header: "Tổng số tai nạn lao động",
    children: [
      {
        key: "victims",
        header: "Số người bị TNLĐ",
        children: [
          col("totalVictims", "Tổng số"),
          col("totalFatalVictims", "Số người chết"),
          col("totalSeverelyInjuredVictims", "Số người bị thương nặng"),
        ],
      },
    ],
  },
  {
    key: "frequency",
    header: "Tần suất tai nạn lao động",
    children: [
      col("accidentFrequency", "KTNLĐ"),
      col("fatalFrequency", "KChết"),
    ],
  },
  { key: "note", header: "Ghi chú", cell: () => null },
];

interface Props {
  businessTypes?: ReportSummaryBusinessType[];
  total?: OverallBusinessStats;
}

function OverallBusinessTable({ businessTypes = [], total }: Props) {
  const rows: GroupTableRow<BusinessRow>[] = [
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

  return <GroupTable columns={columns} minWidth={1400} rows={rows} />;
}

export default OverallBusinessTable;
