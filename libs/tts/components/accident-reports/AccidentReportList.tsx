"use client";
import { CircleCheck, CircleX, Eye, Filter, Pencil } from "lucide-react";
import { Button } from "@/libs/core/components/ui/Button";
import DataTable from "@/libs/core/components/ui/DataTable";
import ListLayout from "../layout/ListLayout";
import { TableColumn } from "@/libs/core/models/component.model";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import AccidentReportFilterModal from "./AccidentReportFilterModal";
import {
  GetAccidentReportsMeParams,
  GetAccidentReportsParams,
} from "@/libs/shared/tts/models/params.model";
import {
  AccidentReportPeriod,
  AccidentReportReviewStatus,
  AccidentReportStatus,
  RoleCode,
} from "@/libs/shared/tts/models/enums";
import { AccidentReportResponse } from "@/libs/shared/tts/models/accident-report.model";
import {
  useGetAccidentReports,
  useGetAccidentReportsMe,
  useReviewAccidentReport,
} from "../../hooks/useAccidentReports";
import {
  ACCIDENT_REPORT_PERIOD_OPTIONS,
  ACCIDENT_REPORT_STATUS_OPTIONS,
  YEAR_OPTIONS,
} from "@/libs/core/constants/options";
import { useGetMe } from "../../hooks/useAuth";
import { formatDate } from "@/libs/core/utils/formatters";
import { Select } from "@/libs/core/components/ui/Select";
import toast from "react-hot-toast";
import NoteModal from "./NoteModal";
import { ConfirmDialog } from "@/libs/core/components/ui/ConfirmDialog";

function AccidentReportList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [confirmStatus, setConfirmStatus] =
    useState<AccidentReportReviewStatus | null>(null);
  const [reviewStatus, setReviewStatus] =
    useState<AccidentReportReviewStatus | null>(null);

  const getStatusLabel = (status: AccidentReportStatus) =>
    ACCIDENT_REPORT_STATUS_OPTIONS.find((o) => o.value === status)?.label ??
    status;

  const getPeriodLabel = (period: AccidentReportPeriod) =>
    ACCIDENT_REPORT_PERIOD_OPTIONS.find((o) => o.value === period)?.label ??
    period;

  const FILTER_KEYS = [
    "name",
    "taxCode",
    "reportPeriod",
    "status",
    "province",
    "ward",
    "year",
  ];
  const activeFilterCount = FILTER_KEYS.filter((key) =>
    searchParams.get(key),
  ).length;

  const page = Number(searchParams.get("page")) || 1;
  const size = Number(searchParams.get("size")) || 12;
  const yearParam = searchParams.get("year");

  const params: GetAccidentReportsParams = {
    page: page,
    size: size,
    name: searchParams.get("name") ?? undefined,
    taxCode: searchParams.get("taxCode") ?? undefined,
    reportPeriod:
      (searchParams.get("reportPeriod") as AccidentReportPeriod | null) ??
      undefined,
    status: searchParams.get("status") ?? undefined,
    province: searchParams.get("province") ?? undefined,
    ward: searchParams.get("ward") ?? undefined,
    year: yearParam ? Number(yearParam) : undefined,
  };

  const meParams: GetAccidentReportsMeParams = {
    page,
    size,
    name: searchParams.get("name") ?? undefined,
    taxCode: searchParams.get("taxCode") ?? undefined,
    reportPeriod:
      (searchParams.get("reportPeriod") as AccidentReportPeriod | null) ??
      undefined,
    status: searchParams.get("status") ?? undefined,
    year: yearParam ? Number(yearParam) : undefined,
  };

  const currentYear = String(new Date().getFullYear());
  const selectedYear = searchParams.get("year") ?? currentYear;

  const handleYearChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("year", value);
    params.set("page", "1");

    router.replace(`${pathname}?${params.toString()}`, {
      scroll: false,
    });
  };

  const { data: dataMe, isLoading: isLoadingMe } = useGetMe();
  const account = dataMe?.data;

  const isRoleSo = account?.roleCode === RoleCode.SO;
  const isRoleDN = account?.roleCode === RoleCode.DOANH_NGHIEP;

  const { data: dataSo, isLoading: isLoadingSo } = useGetAccidentReports(
    params,
    isRoleSo,
  );

  const { data: dataDN, isLoading: isLoadingDN } = useGetAccidentReportsMe(
    meParams,
    isRoleDN,
  );

  const data = isRoleSo ? dataSo : isRoleDN ? dataDN : undefined;

  const isFetchingAccidentReports =
    isLoadingMe || (isRoleSo ? isLoadingSo : isRoleDN ? isLoadingDN : false);

  const accidentReports = data?.data ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const reviewAccidentReportMutation = useReviewAccidentReport();
  const isReviewing = reviewAccidentReportMutation.isPending;

  const handleConfirmDialogReview = (status: AccidentReportReviewStatus) => {
    if (selectedIds.length === 0) return;

    const reportById = new Map(
      accidentReports.map((r) => [r.accidentReportId, r]),
    );

    const hasInvalid = selectedIds.some(
      (id) => reportById.get(id)?.status !== AccidentReportStatus.ACCEPTED,
    );

    if (hasInvalid) {
      toast.error(
        "Chỉ được duyệt hoặc từ chối các báo cáo có trạng thái là đã tiếp nhận",
      );
      return;
    }

    setConfirmStatus(status);
  };

  const handleConfirmReview = () => {
    setReviewStatus(confirmStatus);
    setConfirmStatus(null);
  };

  const handleReviewAccidentReport = (note: string) => {
    if (!reviewStatus || isReviewing || selectedIds.length === 0) return;

    reviewAccidentReportMutation.mutate(
      { accidentReportIds: selectedIds, status: reviewStatus, note },
      {
        onSuccess: () => {
          setReviewStatus(null);
          setSelectedIds([]);
        },
      },
    );
  };

  const columns: TableColumn<AccidentReportResponse>[] = [
    {
      key: "actions",
      header: "Hành động",
      cell: (r) => (
        <div className="flex items-center gap-3">
          <Link href={`/accident-reports/${r.accidentReportId}?mode=view`}>
            <Eye size={22} className="text-muted-foreground" />
          </Link>

          {r.status !== AccidentReportStatus.ACCEPTED && isRoleDN && (
            <Link href={`/accident-reports/${r.accidentReportId}?mode=edit`}>
              <Pencil size={22} className="text-edit" />
            </Link>
          )}
        </div>
      ),
    },
    {
      key: "taxCode",
      header: "Mã số thuế",
      cell: (r) => r.taxCode,
    },
    { key: "name", header: "Tên doanh nghiệp", cell: (r) => r.name },
    {
      key: "reportPeriod",
      header: "Kỳ báo cáo",
      cell: (r) => getPeriodLabel(r.reportPeriod),
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (r) => {
        const isAccepted = r.status === AccidentReportStatus.ACCEPTED;
        const isApproved = r.status === AccidentReportStatus.APPROVED;
        const isDeclined = r.status === AccidentReportStatus.DECLINED;
        const isExpired = r.status === AccidentReportStatus.EXPIRED;

        return (
          <div className="flex items-center gap-2">
            <div
              className={`size-3 rounded-full ${
                isAccepted
                  ? "bg-primary"
                  : isApproved
                    ? "bg-success"
                    : isDeclined || isExpired
                      ? "bg-error"
                      : "bg-muted-foreground"
              }`}
            />
            <span
              className={`font-normal ${
                isAccepted
                  ? "text-primary"
                  : isApproved
                    ? "text-success"
                    : isDeclined || isExpired
                      ? "text-error"
                      : ""
              }`}
            >
              {getStatusLabel(r.status)}
            </span>
          </div>
        );
      },
    },
    {
      key: "createdAt",
      header: "Ngày tạo",
      cell: (r) => formatDate(r.createdAt),
    },
  ];

  return (
    <>
      <ListLayout
        title="Báo cáo TNLĐ"
        count={totalElements}
        actions={
          <>
            <Button
              type="button"
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2 rounded-md border border-primary px-3 py-2 font-medium text-primary"
            >
              <Filter size={18} />
              <span>
                Bộ lọc {activeFilterCount > 0 && ` (${activeFilterCount})`}
              </span>
            </Button>

            <Select
              searchable={false}
              options={YEAR_OPTIONS()}
              value={selectedYear}
              onChange={handleYearChange}
              className="w-25"
            />

            {isRoleSo && (
              <Link
                href={`/accident-reports/overall?year=${selectedYear}`}
                className="whitespace-nowrap rounded-md bg-primary px-3 py-2 font-medium text-white w-full"
              >
                Báo cáo tổng hợp
              </Link>
            )}

            {selectedIds.length > 0 && isRoleSo && (
              <Button
                type="button"
                onClick={() =>
                  handleConfirmDialogReview(AccidentReportStatus.APPROVED)
                }
                className="flex items-center gap-2 rounded-md bg-success px-3 py-2 font-medium text-white"
              >
                <CircleCheck size={18} />
                <span>Duyệt ({selectedIds.length})</span>
              </Button>
            )}

            {selectedIds.length > 0 && isRoleSo && (
              <Button
                type="button"
                onClick={() =>
                  handleConfirmDialogReview(AccidentReportStatus.DECLINED)
                }
                className="flex items-center gap-2 rounded-md bg-error px-3 py-2 font-medium text-white"
              >
                <CircleX size={18} />
                <span>Từ chối ({selectedIds.length})</span>
              </Button>
            )}
          </>
        }
        pagination={{ page, size, totalElements, totalPages }}
      >
        <DataTable
          columns={columns}
          data={accidentReports}
          getRowId={(r) => r.accidentReportId}
          isLoading={isFetchingAccidentReports}
          selectedIds={isRoleSo ? selectedIds : undefined}
          onSelectionChange={isRoleSo ? setSelectedIds : undefined}
        />
      </ListLayout>

      {filterOpen && account?.roleCode && (
        <AccidentReportFilterModal
          onClose={() => setFilterOpen(false)}
          roleCode={account.roleCode}
          onClearSelection={() => setSelectedIds([])}
        />
      )}

      {confirmStatus && (
        <ConfirmDialog
          title={
            confirmStatus === AccidentReportStatus.APPROVED
              ? "Xác nhận duyệt báo cáo"
              : "Xác nhận từ chối báo cáo"
          }
          description={`Bạn có chắc chắn muốn ${
            confirmStatus === AccidentReportStatus.APPROVED
              ? "duyệt"
              : "từ chối"
          } ${selectedIds.length} báo cáo đã chọn?`}
          confirmText="Xác nhận"
          cancelText="Hủy bỏ"
          onConfirm={handleConfirmReview}
          onClose={() => setConfirmStatus(null)}
        />
      )}

      {reviewStatus && (
        <NoteModal
          count={selectedIds.length}
          status={reviewStatus}
          isLoading={isReviewing}
          onSubmit={handleReviewAccidentReport}
          onClose={() => setReviewStatus(null)}
        />
      )}
    </>
  );
}

export default AccidentReportList;
