"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { memo, useEffect, useRef, useState } from "react";
import { Select } from "./Select";
import { Button } from "./Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

function Pagination({ totalPages, page, size, totalElements }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const start = (page - 1) * size + 1;
  const end = Math.min(start + size - 1, totalElements);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingIndex !== null) {
      inputRef.current?.focus();
    }
  }, [editingIndex]);

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    params.set("size", size.toString());

    router.push(`${pathname}?${params.toString()}`);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setInputValue("");
  };

  const submitEdit = () => {
    const target = parseInt(inputValue, 10);

    if (!Number.isNaN(target)) {
      const safePage = Math.min(Math.max(target, 1), totalPages);
      if (safePage !== page) goToPage(safePage);
    }

    cancelEdit();
  };

  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }

    return pages;
  };

  if (totalElements <= 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-end flex-wrap py-4 sm:px-[20px] px-[15px] w-full gap-4">
      <nav className="isolate inline-flex gap-0.5" aria-label="Pagination">
        <Button
          type="button"
          className="h-8.5 w-8.5 inline-flex justify-center items-center gap-x-2 border border-border hover:bg-muted"
          aria-label="Previous"
          title="Previous"
          disabled={page <= 1}
          onClick={() => page > 1 && goToPage(page - 1)}
        >
          <ChevronLeft strokeWidth={1.5} size={22} />
        </Button>

        {getPageNumbers().map((pageNumber, index) => {
          if (pageNumber === "...") {
            if (editingIndex === index) {
              return (
                <input
                  key={`ellipsis-input-${index}`}
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  value={inputValue}
                  placeholder="..."
                  maxLength={String(totalPages).length}
                  onChange={(e) =>
                    setInputValue(e.target.value.replace(/\D/g, ""))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      submitEdit();
                    } else if (e.key === "Escape") {
                      cancelEdit();
                    }
                  }}
                  onBlur={cancelEdit}
                  className="h-8.5 w-12 text-center border border-primary outline-none bg-background"
                />
              );
            }

            return (
              <Button
                type="button"
                key={`ellipsis-${index}`}
                title="Nhập số trang"
                onClick={() => {
                  setInputValue("");
                  setEditingIndex(index);
                }}
                className="group h-8.5 w-8.5 flex justify-center items-center border border-border hover:bg-muted"
              >
                ...
              </Button>
            );
          }

          return (
            <Button
              type="button"
              key={pageNumber}
              onClick={() => goToPage(pageNumber as number)}
              className={`h-8.5 w-8.5 flex justify-center items-center border border-border ${
                pageNumber === page ? "bg-primary text-white" : "hover:bg-muted"
              }`}
            >
              {pageNumber}
            </Button>
          );
        })}

        <Button
          type="button"
          disabled={page >= totalPages}
          onClick={() => page < totalPages && goToPage(page + 1)}
          className="h-8.5 w-8.5 inline-flex justify-center items-center gap-x-2 border border-border hover:bg-muted"
        >
          <ChevronRight strokeWidth={1.5} size={22} />
        </Button>
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        <span className="whitespace-nowrap">Số dòng mỗi trang</span>
        <Select
          searchable={false}
          className="w-18"
          value={size}
          onChange={(value) => {
            const params = new URLSearchParams(searchParams.toString());

            params.set("size", value);
            params.set("page", "1");

            router.push(`${pathname}?${params.toString()}`);
          }}
          options={[
            { value: 12, label: "12" },
            { value: 24, label: "24" },
            { value: 36, label: "36" },
            { value: 48, label: "48" },
          ]}
        />
      </div>

      <p>
        {start}-{end} của {totalElements}
      </p>
    </div>
  );
}

export default memo(Pagination);
