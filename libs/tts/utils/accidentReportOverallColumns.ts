import type { GroupTableColumn } from "@/libs/core/models/component.model";
import type {
  BusinessRow,
  ClassificationRow,
} from "@/libs/tts/utils/accidentReportOverall";

// ---------- I. Thông tin tổng quan ----------
const businessCol = (
  field: keyof BusinessRow & string,
  header: string,
): GroupTableColumn<BusinessRow> => ({ key: field, header, field });

export const overallBusinessColumns: GroupTableColumn<BusinessRow>[] = [
  { ...businessCol("name", "Loại hình cơ sở"), align: "left" },
  businessCol("code", "Mã số"),
  {
    key: "business",
    header: "Cơ sở",
    children: [
      businessCol("totalBusinesses", "Tổng số"),
      businessCol("reportedBusinesses", "Số cơ sở tham gia"),
    ],
  },
  {
    key: "labor",
    header: "Lực lượng lao động",
    children: [
      businessCol("totalEmployees", "Tổng số lao động"),
      businessCol("reportedEmployees", "Số LĐ của cơ sở tham gia báo cáo"),
      businessCol("femaleEmployees", "Số lao động nữ"),
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
          businessCol("totalVictims", "Tổng số"),
          businessCol("totalFatalVictims", "Số người chết"),
          businessCol("totalSeverelyInjuredVictims", "Số người bị thương nặng"),
        ],
      },
    ],
  },
  {
    key: "frequency",
    header: "Tần suất tai nạn lao động",
    children: [
      businessCol("accidentFrequency", "KTNLĐ"),
      businessCol("fatalFrequency", "KChết"),
    ],
  },
  { key: "note", header: "Ghi chú", cell: () => null },
];

// ---------- II. Phân loại tai nạn lao động ----------
const classCol = (
  field: keyof ClassificationRow & string,
  header: string,
): GroupTableColumn<ClassificationRow> => ({ key: field, header, field });

export const overallClassificationColumns: GroupTableColumn<ClassificationRow>[] =
  [
    {
      key: "group",
      header: "Phân loại",
      align: "left",
      cell: (row) => row.group,
      rowSpan: (row) => (row.isFirstInGroup ? row.groupSize : 0),
    },
    { ...classCol("name", "Tên chỉ tiêu thống kê"), align: "left" },
    classCol("code", "Mã số"),
    {
      key: "classification",
      header: "Phân loại TNLĐ theo mức độ thương tật",
      children: [
        {
          key: "cases",
          header: "Số vụ TNLĐ",
          children: [
            classCol("totalCases", "Tổng số"),
            classCol("fatalCases", "Số vụ có người chết"),
            classCol(
              "totalCasesWithTwoOrMoreVictims",
              "Số vụ có từ 2 người bị nạn trở lên",
            ),
          ],
        },
        {
          key: "victims",
          header: "Số người bị nạn (Người)",
          children: [
            classCol("totalVictims", "Tổng số"),
            classCol("totalFemaleVictims", "Số LĐ nữ"),
            classCol("totalFatalVictims", "Số người bị chết"),
            classCol("totalSeverelyInjuredVictims", "Số người bị thương nặng"),
          ],
        },
      ],
    },
    {
      key: "damage",
      header: "Theo mức độ thương tật",
      children: [
        classCol("totalDaysOff", "Tổng số ngày nghỉ vì TNLĐ"),
        classCol("totalExpense", "Tổng số tiền"),
        {
          key: "expenseDetail",
          header: "Trong đó",
          children: [
            classCol("medicalExpense", "Y tế"),
            classCol(
              "salaryExpenseDuringTreatment",
              "Trả lương theo thời gian điều trị",
            ),
            classCol("compensationExpense", "Bồi thường/Trợ cấp"),
          ],
        },
        classCol("propertyDamageExpense", "Thiệt hại tài sản (1.000 đ)"),
      ],
    },
  ];
