import Pagination from "@/libs/core/components/ui/Pagination";

interface Props {
  title: string;
  count?: number;
  actions?: React.ReactNode;
  filters?: React.ReactNode; // thêm
  children: React.ReactNode;
  pagination?: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

function ListLayout({
  title,
  count = 0,
  actions,
  filters,
  pagination,
  children,
}: Props) {
  return (
    <div className="flex h-full flex-col">
      <div className="py-[30px] sm:px-[20px] px-[15px] flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3>
            {title} {""} {`(${count})`}
          </h3>

          <div className="flex items-center gap-3">{actions}</div>
        </div>

        {filters && filters}
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 overflow-auto">{children}</div>

        {pagination && (
          <Pagination
            page={pagination.page}
            size={pagination.size}
            totalElements={pagination.totalElements}
            totalPages={pagination.totalPages}
          />
        )}
      </div>
    </div>
  );
}

export default ListLayout;
