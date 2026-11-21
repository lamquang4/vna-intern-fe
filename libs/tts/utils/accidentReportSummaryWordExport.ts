import {
  AlignmentType,
  Document,
  Packer,
  PageOrientation,
  Paragraph,
} from "docx";
import type {
  AccidentReportDetailResponse,
  AccidentReportSummaryResponse,
} from "@/libs/shared/tts/models/accident-report.model";
import { AccidentReportPeriod } from "@/libs/shared/tts/models/enums";
import { buildSummaryRows } from "./accidentReportSummary";
import {
  accidentDamageColumns,
  accidentSummaryColumns,
} from "./accidentReportSummaryColumns";
import {
  TITLE_SIZE,
  createGroupTable,
  createTwoColumnBlock,
  downloadBlob,
  getReportDateText,
  paragraph,
  textRun,
} from "./wordExport";

// A4 đứng
const PAGE_WIDTH = 11906;
const PAGE_HEIGHT = 16838;
const PAGE_MARGIN = { top: 700, bottom: 700, left: 567, right: 567 };
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN.left - PAGE_MARGIN.right; // 10772

const STATS_COL_WIDTHS = [
  1700, 1250, 600, 560, 560, 600, 780, 794, 780, 794, 780, 794, 780,
];
const DAMAGE_COL_WIDTHS = [3000, 1100, 1100, 2272, 1700, 1600];

const getPeriodText = (period: AccidentReportPeriod, year: number) =>
  period === AccidentReportPeriod.FULL_YEAR
    ? `CẢ NĂM ${year}`
    : `6 THÁNG NĂM ${year}`;

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
          paragraph(
            [
              textRun("BÁO CÁO TỔNG HỢP TÌNH HÌNH TAI NẠN LAO ĐỘNG", {
                bold: true,
                size: TITLE_SIZE,
              }),
            ],
            { after: 20 },
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
            { after: 200 },
          ),
          paragraph(
            [textRun("I. Thông tin chung về tai nạn lao động", { bold: true })],
            { alignment: AlignmentType.LEFT, after: 100 },
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
            CONTENT_WIDTH,
            [new Paragraph({ children: [] })],
            signature("NGƯỜI LẬP BÁO CÁO", "(Ký, ghi rõ họ tên)"),
          ),
        ],
      },
    ],
  });
}

export async function downloadAccidentReportSummaryWord(
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
    `Bao-cao-TNLD-${companyName || "doanh-nghiep"}-${report.year}.docx`,
  );
}
