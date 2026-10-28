"use client";
import { Image } from "@/libs/core/components/ui/Image";
import Loading from "@/libs/core/components/ui/Loading";
import { Input } from "@/libs/core/components/ui/Input";
import { TableColumn } from "../../models/component.model";
import notFoundImage from "@/libs/tts/assets/notfound.webp";

interface Props<T> {
  columns: TableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  isLoading?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

function DataTable<T>({
  columns,
  data,
  getRowId,
  isLoading = false,
  selectedIds,
  onSelectionChange,
}: Props<T>) {
  const selectable = !!selectedIds && !!onSelectionChange;
  const colSpan = columns.length + (selectable ? 1 : 0);

  const pageIds = data.map(getRowId);
  const allSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds?.includes(id));

  const toggleAll = () => {
    if (!selectable) return;
    onSelectionChange(
      allSelected
        ? selectedIds.filter((id) => !pageIds.includes(id))
        : Array.from(new Set([...selectedIds, ...pageIds])),
    );
  };

  const toggleOne = (id: string) => {
    if (!selectable) return;
    onSelectionChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id],
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="lg:w-full table-auto border-collapse w-[250%]">
        <thead className="font-semibold">
          <tr className="bg-muted text-left">
            {selectable && (
              <th className="w-px p-4">
                <Input
                  type="checkbox"
                  aria-label="Chọn tất cả"
                  checked={allSelected}
                  onChange={toggleAll}
                  disabled={data.length === 0}
                  className="size-4.5"
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className={`p-4 font-medium whitespace-nowrap ${col.className ?? ""} ${col.headerClassName ?? ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={colSpan}>
                <Loading height={60} size={50} color="black" thickness={2} />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={colSpan} className="h-[60vh]">
                <div className="flex flex-col items-center justify-center gap-3">
                  <Image
                    src={notFoundImage}
                    alt="Not found"
                    className="w-[135px]"
                    loading="eager"
                  />
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, index) => {
              const id = getRowId(row);
              return (
                <tr key={id} className="border-b border-border hover:bg-muted">
                  {selectable && (
                    <td className="p-4">
                      <Input
                        type="checkbox"
                        aria-label="Chọn dòng"
                        checked={selectedIds.includes(id)}
                        onChange={() => toggleOne(id)}
                        className="size-4.5"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`p-4 break-words ${col.className ?? ""}`}
                    >
                      {col.cell(row, index)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
