import {
  AlignmentType,
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
import { buildHeaderRows, getLeaves } from "@/libs/core/utils/groupTableUtil";

export const FONT = "Roboto";
export const CELL_SIZE = 16;
export const HEADER_SIZE = 14;
export const BODY_SIZE = 20;
export const TITLE_SIZE = 24;

export type Align = (typeof AlignmentType)[keyof typeof AlignmentType];

const toAlignment = (align?: "left" | "center"): Align =>
  align === "left" ? AlignmentType.LEFT : AlignmentType.CENTER;

export const textRun = (
  text: string,
  options: { bold?: boolean; italics?: boolean; size?: number } = {},
) => new TextRun({ text, font: FONT, size: BODY_SIZE, ...options });

export const paragraph = (
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

export function createGroupTable<T>(
  columns: GroupTableColumn<T>[],
  rows: GroupTableRow<T>[],
  columnWidths: number[],
) {
  const leaves = getLeaves(columns);
  const tableWidth = columnWidths.reduce((sum, w) => sum + w, 0);

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
            : leaves.flatMap((column) => {
                const span =
                  typeof column.rowSpan === "function"
                    ? column.rowSpan(row.data)
                    : undefined;
                if (span === 0) return [];

                const raw = column.cell
                  ? column.cell(row.data)
                  : column.field
                    ? row.data[column.field]
                    : "";

                return [
                  wordCell(
                    column.cell &&
                      typeof raw !== "string" &&
                      typeof raw !== "number"
                      ? ""
                      : formatCellValue(raw),
                    {
                      align: column.align,
                      bold: row.bold,
                      rowSpan: span && span > 1 ? span : undefined,
                    },
                  ),
                ];
              }),
      }),
  );

  return new Table({
    width: { size: tableWidth, type: WidthType.DXA },
    columnWidths,
    rows: [...headerRows, ...bodyRows],
  });
}

export const createTwoColumnBlock = (
  contentWidth: number,
  left: Paragraph[],
  right: Paragraph[],
) => {
  const half = Math.floor(contentWidth / 2);
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

export const getReportDateText = (date = new Date()) =>
  `Ngày ${date.getDate()} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement("a");

  link.href = url;
  link.download = fileName;
  window.document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
