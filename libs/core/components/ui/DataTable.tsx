"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Image } from "@/libs/core/components/ui/Image";
import Loading from "@/libs/core/components/ui/Loading";
import { Input } from "@/libs/core/components/ui/Input";
import { Select } from "@/libs/core/components/ui/Select";
import useDebounce from "@/libs/core/hooks/useDebounce";
import { TableColumn } from "../../models/component.model";
import notFoundImage from "@/libs/tts/assets/notfound.webp";

interface Props<T> {
  columns: TableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  isLoading?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  isRowSelectable?: (row: T) => boolean;
  onSelectionRejected?: (row: T) => void;
}

function DataTable<T>({
  columns,
  data,
  getRowId,
  isLoading = false,
  selectedIds,
  onSelectionChange,
  isRowSelectable,
  onSelectionRejected,
}: Props<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectable = !!selectedIds && !!onSelectionChange;
  const colSpan = columns.length + (selectable ? 1 : 0);

  const selectablePageRows = isRowSelectable
    ? data.filter(isRowSelectable)
    : data;
  const pageIds = selectablePageRows.map(getRowId);
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

  const filterKeys = columns.flatMap((c) =>
    c.filter ? [c.filter.paramKey] : [],
  );
  const hasFilter = filterKeys.length > 0;

  const filterSignature = Array.from(searchParams.entries())
    .filter(([key]) => key !== "page" && key !== "size")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  const prevSignatureRef = useRef(filterSignature);
  const pendingSyncRef = useRef(false);

  useEffect(() => {
    if (prevSignatureRef.current === filterSignature) return;
    prevSignatureRef.current = filterSignature;
    pendingSyncRef.current = true;
  }, [filterSignature]);

  const pageIdsKey = pageIds.join(",");

  useEffect(() => {
    if (!pendingSyncRef.current || isLoading) return;
    pendingSyncRef.current = false;

    if (!selectedIds || selectedIds.length === 0) return;

    const kept = selectedIds.filter((id) => pageIds.includes(id));
    if (kept.length !== selectedIds.length) onSelectionChange?.(kept);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIdsKey, isLoading]);

  const [texts, setTexts] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      columns.flatMap((c) =>
        c.filter?.type === "text"
          ? [[c.filter.paramKey, searchParams.get(c.filter.paramKey) ?? ""]]
          : [],
      ),
    ),
  );
  const debouncedTexts = useDebounce(texts, 500);

  const updateParams = (changes: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    let changed = false;

    Object.entries(changes).forEach(([key, value]) => {
      if ((params.get(key) ?? "") === value) return;
      changed = true;
      if (value) params.set(key, value);
      else params.delete(key);
    });

    if (!changed) return;

    params.delete("page");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  useEffect(() => {
    updateParams(
      Object.fromEntries(
        Object.entries(debouncedTexts).map(([k, v]) => [k, v.trim()]),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTexts]);

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
                  disabled={pageIds.length === 0}
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

          {hasFilter && (
            <tr className="bg-muted text-left">
              {selectable && <th className="w-px px-4 pb-3" />}
              {columns.map((col) => (
                <th key={col.key} className="px-4 pb-3 align-top font-normal">
                  {col.filter?.type === "text" && (
                    <Input
                      type="text"
                      value={texts[col.filter.paramKey] ?? ""}
                      placeholder={col.filter.placeholder ?? "Tìm kiếm..."}
                      onChange={(e) => {
                        const key = col.filter!.paramKey;
                        setTexts((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }));
                      }}
                      className="w-full min-w-[120px] px-3 py-1.5 bg-white rounded-md"
                    />
                  )}

                  {col.filter?.type === "select" && (
                    <Select
                      searchable={false}
                      placeholder={col.filter.placeholder ?? "Tất cả"}
                      options={[
                        { label: "Tất cả", value: "" },
                        ...col.filter.options,
                      ]}
                      value={searchParams.get(col.filter.paramKey) ?? ""}
                      onChange={(value) =>
                        updateParams({ [col.filter!.paramKey]: value })
                      }
                      className="w-full min-w-[120px] px-3 py-1.5 bg-white"
                    />
                  )}
                </th>
              ))}
            </tr>
          )}
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
              const rowSelectable = isRowSelectable
                ? isRowSelectable(row)
                : true;
              return (
                <tr key={id} className="border-b border-border">
                  {selectable && (
                    <td
                      className="p-4"
                      onClick={() => {
                        if (!rowSelectable) onSelectionRejected?.(row);
                      }}
                    >
                      <Input
                        type="checkbox"
                        aria-label="Chọn dòng"
                        checked={selectedIds.includes(id)}
                        onChange={() => toggleOne(id)}
                        disabled={!rowSelectable}
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
