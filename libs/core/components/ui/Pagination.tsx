"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { memo } from "react";
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

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    params.set("size", size.toString());

    router.push(`${pathname}?${params.toString()}`);
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
    <div className="flex items-center justify-center flex-wrap py-4 sm:px-[20px] px-[15px] w-full gap-4">
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
            return (
              <Button
                type="button"
                disabled
                key={`ellipsis-${index}`}
                className="group h-8.5 w-8.5 flex justify-center items-center border border-border"
              >
                ...
              </Button>
            );
          }

          return (
            <Button
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
          value={size}
          onChange={(e) => {
            const newSize = e.target.value;
            const params = new URLSearchParams(searchParams.toString());
            params.set("size", newSize);
            params.set("page", "1");

            router.push(`${pathname}?${params.toString()}`);
          }}
          className="p-1.5 border border-border"
        >
          <option value="12">12</option>
          <option value="24">24</option>
          <option value="36">36</option>
          <option value="48">48</option>
        </Select>
      </div>

      <p>
        {start}-{end} của {totalElements}
      </p>
    </div>
  );
}

export default memo(Pagination);
