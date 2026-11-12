import {
  AlignmentType,
  Document,
  Packer,
  PageOrientation,
  Paragraph,
  Table,
  TableBorders,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type {
  GroupTableColumn,
  GroupTableRow,
} from "@/libs/core/models/component.model";
import { formatCellValue } from "@/libs/core/utils/formatters";
import type {
  AccidentReportDetailResponse,
  AccidentReportSummaryResponse,
} from "@/libs/shared/tts/models/accident-report.model";
import { AccidentReportPeriod } from "@/libs/shared/tts/models/enums";
import { buildSummaryRows } from "./accidentReportSummary";
import { buildHeaderRows, getLeaves } from "@/libs/core/utils/groupTableUtil";
import {
  accidentDamageColumns,
  accidentSummaryColumns,
} from "./accidentReportColumns";

const RECIPIENT = "Sở Lao động - Thương binh và Xã hội Thành phố Hồ Chí Minh";
const FONT = "Roboto";
const CELL_SIZE = 16; // 8pt
const HEADER_SIZE = 14;
const BODY_SIZE = 20; // 10pt
const TITLE_SIZE = 24; // 12pt

// A4 đứng
const PAGE_WIDTH = 11906;
const PAGE_HEIGHT = 16838;
const PAGE_MARGIN = { top: 700, bottom: 700, left: 567, right: 567 };
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN.left - PAGE_MARGIN.right; // 10772

// Phải khớp số cột lá và thứ tự trong accidentReportColumns.ts (mỗi mảng tổng 10772)
const STATS_COL_WIDTHS = [
  1700, 1250, 600, 560, 560, 600, 780, 794, 780, 794, 780, 794, 780,
];
const DAMAGE_COL_WIDTHS = [3000, 1100, 1100, 2272, 1700, 1600];

type Align = (typeof AlignmentType)[keyof typeof AlignmentType];

const toAlignment = (align?: "left" | "center"): Align =>
  align === "left" ? AlignmentType.LEFT : AlignmentType.CENTER;

const textRun = (
  text: string,
  options: { bold?: boolean; italics?: boolean; size?: number } = {},
) => new TextRun({ text, font: FONT, size: BODY_SIZE, ...options });

const paragraph = (
  runs: TextRun[],
  options: {
    alignment?: Align;
    before?: number;
    after?: number;
    keepNext?: boolean;
  } = {},
) =>
  new Paragraph({
    alignment: options.alignment ?? AlignmentType.CENTER,
    keepNext: options.keepNext,
    spacing: { before: options.before ?? 0, after: options.after ?? 60 },
    children: runs,
  });

interface CellOptions {
  align?: "left" | "center";
  bold?: boolean;
  size?: number;
  columnSpan?: number;
  rowSpan?: number;
  keepNext?: boolean;
}

const wordCell = (text: string, options: CellOptions = {}) =>
  new TableCell({
    children: [
      paragraph(
        [
          textRun(text, {
            bold: options.bold,
            size: options.size ?? CELL_SIZE,
          }),
        ],
        {
          alignment: toAlignment(options.align),
          after: 0,
          keepNext: options.keepNext,
        },
      ),
    ],
    margins: {
      top: 40,
      bottom: 40,
      left: options.align === "left" ? 60 : 30,
      right: 30,
    },
    verticalAlign: "center",
    columnSpan: options.columnSpan,
    rowSpan: options.rowSpan,
  });

function createGroupTable<T>(
  columns: GroupTableColumn<T>[],
  rows: GroupTableRow<T>[],
  columnWidths: number[],
) {
  const leaves = getLeaves(columns);

  const headerRows = buildHeaderRows(columns).map(
    (cells) =>
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: cells.map(({ column, rowSpan, colSpan }) =>
          wordCell(column.header, {
            bold: true,
            size: HEADER_SIZE,
            align: column.align,
            rowSpan,
            columnSpan: colSpan,
          }),
        ),
      }),
  );

  const bodyRows = rows.map(
    (row) =>
      new TableRow({
        cantSplit: true,
        children:
          "section" in row
            ? [
                wordCell(row.section, {
                  align: "left",
                  bold: true,
                  columnSpan: leaves.length,
                  keepNext: true,
                }),
              ]
            : leaves.map((column) =>
                wordCell(
                  column.field ? formatCellValue(row.data[column.field]) : "",
                  {
                    align: column.align,
                    bold: row.bold,
                  },
                ),
              ),
      }),
  );

  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths,
    rows: [...headerRows, ...bodyRows],
  });
}

/** Bảng không viền 2 ô: dòng "Đơn vị báo cáo / Ngành nghề" và phần chữ ký. */
const createTwoColumnBlock = (left: Paragraph[], right: Paragraph[]) => {
  const half = Math.floor(CONTENT_WIDTH / 2);
  const cell = (children: Paragraph[]) =>
    new TableCell({ width: { size: half, type: WidthType.DXA }, children });

  return new Table({
    width: { size: half * 2, type: WidthType.DXA },
    columnWidths: [half, half],
    borders: TableBorders.NONE,
    rows: [
      new TableRow({ cantSplit: true, children: [cell(left), cell(right)] }),
    ],
  });
};

const getPeriodText = (period: AccidentReportPeriod, year: number) =>
  period === AccidentReportPeriod.FULL_YEAR
    ? `CẢ NĂM ${year}`
    : `6 THÁNG NĂM ${year}`;

const getReportDateText = (date = new Date()) =>
  `Ngày ${date.getDate()} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement("a");

  link.href = url;
  link.download = fileName;
  window.document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function buildDocument(
  report: AccidentReportDetailResponse,
  summary: AccidentReportSummaryResponse,
) {
  const signature = (title: string, hint: string) => [
    paragraph([textRun(title, { bold: true })], { after: 40 }),
    paragraph([textRun(hint, { italics: true, size: 18 })]),
  ];

  return new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: PAGE_WIDTH,
              height: PAGE_HEIGHT,
              orientation: PageOrientation.PORTRAIT,
            },
            margin: PAGE_MARGIN,
          },
        },
        children: [
          paragraph([textRun("PHỤ LỤC XII", { bold: true })], { after: 20 }),
          paragraph(
            [
              textRun(
                "MẪU BÁO CÁO TỔNG HỢP TÌNH HÌNH TAI NẠN LAO ĐỘNG CỦA NGƯỜI SỬ DỤNG LAO ĐỘNG",
                { bold: true },
              ),
            ],
            { after: 20 },
          ),
          paragraph(
            [
              textRun(
                "(Kèm theo Nghị định số 39/2016/NĐ-CP ngày 15 tháng 5 năm 2016 của Chính phủ)",
                { italics: true, size: 18 },
              ),
            ],
            { after: 200 },
          ),
          createTwoColumnBlock(
            [
              paragraph(
                [
                  textRun("Đơn vị báo cáo: ", { bold: true }),
                  textRun(report.companyName),
                ],
                { alignment: AlignmentType.LEFT, after: 80 },
              ),
            ],
            [
              paragraph(
                [
                  textRun("Ngành nghề sản xuất kinh doanh: ", { bold: true }),
                  textRun(report.businessIndustryName ?? ""),
                ],
                { alignment: AlignmentType.RIGHT, after: 80 },
              ),
            ],
          ),
          paragraph(
            [
              textRun("BÁO CÁO TỔNG HỢP TÌNH HÌNH TAI NẠN LAO ĐỘNG", {
                bold: true,
                size: TITLE_SIZE,
              }),
            ],
            { before: 160, after: 20 },
          ),
          paragraph(
            [
              textRun(
                `KỲ BÁO CÁO: ${getPeriodText(report.reportPeriod, report.year)}`,
                { bold: true },
              ),
            ],
            { after: 20 },
          ),
          paragraph(
            [
              textRun(`Ngày báo cáo: ${getReportDateText()}`, {
                italics: true,
              }),
            ],
            {
              after: 200,
            },
          ),
          paragraph(
            [textRun("Kính gửi: ", { bold: true }), textRun(RECIPIENT)],
            {
              alignment: AlignmentType.LEFT,
              after: 80,
            },
          ),
          paragraph(
            [textRun("I. Thông tin chung về tai nạn lao động", { bold: true })],
            {
              alignment: AlignmentType.LEFT,
              after: 100,
            },
          ),
          createGroupTable(
            accidentSummaryColumns,
            buildSummaryRows(summary),
            STATS_COL_WIDTHS,
          ),
          // Mục II nằm ngoài bảng để Word không gộp 2 bảng liền nhau
          paragraph(
            [textRun("II. Thiệt hại do tai nạn lao động", { bold: true })],
            {
              alignment: AlignmentType.LEFT,
              keepNext: true,
              before: 160,
              after: 80,
            },
          ),
          createGroupTable(
            accidentDamageColumns,
            [{ id: "damage", data: summary.accidentDamage }],
            DAMAGE_COL_WIDTHS,
          ),
          new Paragraph({ spacing: { after: 240 }, children: [] }),
          createTwoColumnBlock(
            signature("NGƯỜI LẬP BÁO CÁO", "(Ký, ghi rõ họ tên)"),
            signature(
              "NGƯỜI SỬ DỤNG LAO ĐỘNG",
              "(Ký, ghi rõ họ tên, chức vụ và đóng dấu)",
            ),
          ),
        ],
      },
    ],
  });
}

export async function downloadAccidentReportWord(
  report: AccidentReportDetailResponse,
  summary: AccidentReportSummaryResponse,
) {
  const blob = await Packer.toBlob(buildDocument(report, summary));
  const companyName = report.companyName
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/[. -]+$/g, "");

  downloadBlob(
    blob,
    `Bao-cao-TNLĐ-${companyName || "doanh-nghiep"}-${report.year}.docx`,
  );
}
