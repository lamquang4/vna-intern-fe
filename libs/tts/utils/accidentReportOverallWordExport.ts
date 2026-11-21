import {
  AlignmentType,
  Document,
  Packer,
  PageOrientation,
  Paragraph,
} from "docx";
import type { OverallAccidentReportResponse } from "@/libs/shared/tts/models/accident-report.model";
import {
  buildOverallBusinessRows,
  buildOverallClassificationRows,
} from "./accidentReportOverall";
import {
  overallBusinessColumns,
  overallClassificationColumns,
} from "./accidentReportOverallColumns";
import {
  TITLE_SIZE,
  createGroupTable,
  createTwoColumnBlock,
  downloadBlob,
  getReportDateText,
  paragraph,
  textRun,
} from "./wordExport";

// A4 nằm ngang
const PAGE_WIDTH = 11906;
const PAGE_HEIGHT = 16838;
const PAGE_MARGIN = { top: 700, bottom: 700, left: 567, right: 567 };
const CONTENT_WIDTH = PAGE_HEIGHT - PAGE_MARGIN.left - PAGE_MARGIN.right;

// 13 cột: name, code, 2 cơ sở, 3 lao động, 3 nạn nhân, 2 tần suất, ghi chú
const BUSINESS_COL_WIDTHS = [
  2404, 800, 1100, 1100, 1100, 1100, 1100, 1100, 1100, 1100, 1100, 1100, 1500,
];
// 16 cột: group, name, code, 3 vụ, 4 nạn nhân, ngày nghỉ, tổng tiền, 3 chi phí, tài sản
const CLASSIFICATION_COL_WIDTHS = [
  1500, 2200, 700, 870, 870, 870, 870, 870, 870, 870, 870, 870, 870, 870, 870,
  864,
];

function buildDocument(summary: OverallAccidentReportResponse, year: number) {
  return new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: PAGE_WIDTH,
              height: PAGE_HEIGHT,
              orientation: PageOrientation.LANDSCAPE,
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
          paragraph([textRun(`NĂM ${year}`, { bold: true })], { after: 20 }),
          paragraph(
            [
              textRun(`Ngày báo cáo: ${getReportDateText()}`, {
                italics: true,
              }),
            ],
            { after: 200 },
          ),
          paragraph([textRun("I. Thông tin tổng quan", { bold: true })], {
            alignment: AlignmentType.LEFT,
            keepNext: true,
            after: 100,
          }),
          createGroupTable(
            overallBusinessColumns,
            buildOverallBusinessRows(summary.businessTypes, summary.total1),
            BUSINESS_COL_WIDTHS,
          ),
          // Mục II nằm ngoài bảng để Word không gộp 2 bảng liền nhau
          paragraph(
            [textRun("II. Phân loại tai nạn lao động", { bold: true })],
            {
              alignment: AlignmentType.LEFT,
              keepNext: true,
              before: 240,
              after: 100,
            },
          ),
          createGroupTable(
            overallClassificationColumns,
            buildOverallClassificationRows(summary),
            CLASSIFICATION_COL_WIDTHS,
          ),
          new Paragraph({ spacing: { after: 240 }, children: [] }),
          createTwoColumnBlock(
            CONTENT_WIDTH,
            [new Paragraph({ children: [] })],
            [
              paragraph([textRun("NGƯỜI LẬP BÁO CÁO", { bold: true })], {
                after: 40,
              }),
              paragraph([
                textRun("(Ký, ghi rõ họ tên)", { italics: true, size: 18 }),
              ]),
            ],
          ),
        ],
      },
    ],
  });
}

export async function downloadOverallAccidentReportWord(
  summary: OverallAccidentReportResponse,
  year: number,
) {
  const blob = await Packer.toBlob(buildDocument(summary, year));
  downloadBlob(blob, `Bao-cao-tong-hop-TNLD-${year}.docx`);
}
