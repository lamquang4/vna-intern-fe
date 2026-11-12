import type {
  GroupTableColumn,
  GroupTableRow,
} from "@/libs/core/models/component.model";
import { formatCellValue } from "@/libs/core/utils/formatters";
import { buildHeaderRows, getLeaves } from "../../utils/groupTableUtil";


interface Props<T> {
  columns: GroupTableColumn<T>[];
  rows: GroupTableRow<T>[];
  minWidth?: number;
}

const alignClass = (align?: "left" | "center") =>
  align === "left" ? "text-left" : "text-center";

function GroupTable<T>({ columns, rows, minWidth = 1000 }: Props<T>) {
  const headerRows = buildHeaderRows(columns);
  const leaves = getLeaves(columns);

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse" style={{ minWidth }}>
        <thead>
          {headerRows.map((cells, level) => (
            <tr key={level} className="bg-muted text-center font-medium">
              {cells.map(({ column, rowSpan, colSpan }) => (
                <th
                  key={column.key}
                  rowSpan={rowSpan}
                  colSpan={colSpan}
                  className={`border border-border p-2 leading-5 ${alignClass(column.align)}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {rows.map((row) =>
            "section" in row ? (
              <tr key={row.id} className="bg-muted font-semibold">
                <td
                  colSpan={leaves.length}
                  className="border border-border px-3 py-2"
                >
                  {row.section}
                </td>
              </tr>
            ) : (
              <tr
                key={row.id}
                className={row.bold ? "bg-muted font-semibold" : undefined}
              >
                {leaves.map((column) => {
                  const rowSpan = column.rowSpan?.(row.data);
                  if (rowSpan === 0) return null;

                  return (
                    <td
                      key={column.key}
                      rowSpan={rowSpan}
                      className={`border border-border px-2 py-3 ${alignClass(column.align)}`}
                    >
                      {column.cell
                        ? column.cell(row.data)
                        : column.field
                          ? formatCellValue(row.data[column.field])
                          : null}
                    </td>
                  );
                })}
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}

export default GroupTable;
