"use client";
import { CircleCheck, CircleX, Eye, FunnelX, Pencil } from "lucide-react";
import { Button } from "@/libs/core/components/ui/Button";
import DataTable from "@/libs/core/components/ui/DataTable";
import ListLayout from "../layout/ListLayout";
import { TableColumn } from "@/libs/core/models/component.model";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { GetAccidentReportsParams } from "@/libs/shared/tts/models/params.model";
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
} from "@/libs/core/constants/options";
import { useGetMe } from "../../hooks/useAuth";
import { Select } from "@/libs/core/components/ui/Select";
import toast from "react-hot-toast";
import NoteModal from "./NoteModal";
import { ConfirmDialog } from "@/libs/core/components/ui/ConfirmDialog";
import { useGetReportConfigYears } from "../../hooks/useReportConfigs";
import { useGetHCMProvince, useGetHCMWards } from "../../hooks/useLocation";
import { FloatingSelect } from "@/libs/core/components/ui/fields/FloatingSelect";
import { formatDate } from "@/libs/core/utils/formatters";

const FILTER_KEYS = [
  "name",
  "taxCode",
  "reportPeriod",
  "status",
  "province",
  "ward",
];

export const getStatusLabel = (status: AccidentReportStatus) =>
  ACCIDENT_REPORT_STATUS_OPTIONS.find((o) => o.value === status)?.label ??
  status;

export const getStatusClass = (status: AccidentReportStatus) => {
  switch (status) {
    case AccidentReportStatus.ACCEPTED:
      return "bg-primary/10 text-primary";
    case AccidentReportStatus.APPROVED:
      return "bg-success/10 text-success";
    case AccidentReportStatus.DECLINED:
      return "bg-warning/10 text-warning";
    case AccidentReportStatus.EXPIRED:
      return "bg-error/10 text-error";
    default:
      return "bg-muted text-muted-foreground";
  }
};

function AccidentReportList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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
    yearParam ? Number(yearParam) : undefined,
    isRoleDN,
  );

  const data = isRoleSo ? dataSo : isRoleDN ? dataDN : undefined;

  const isFetchingAccidentReports =
    isLoadingMe || (isRoleSo ? isLoadingSo : isRoleDN ? isLoadingDN : false);

  const accidentReports = data?.data ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const { data: dataYears } = useGetReportConfigYears();
  const years = dataYears?.data ?? [];

  const reviewAccidentReportMutation = useReviewAccidentReport();
  const isReviewing = reviewAccidentReportMutation.isPending;

  const yearOptions = years.map((y) => ({
    value: String(y),
    label: String(y),
  }));

  const { data: province, isLoading: isFetchingProvince } = useGetHCMProvince();
  const wards = useGetHCMWards();

  const selectedProvince = searchParams.get("province") ?? "";
  const selectedWard = searchParams.get("ward") ?? "";

  const provinceOptions = [
    { value: "", label: "Tất cả tỉnh/thành phố" },
    ...(province
      ? [{ value: province.province, label: province.province }]
      : []),
  ];

  const wardOptions = [
    { value: "", label: "Tất cả phường/xã" },
    ...(wards ?? []).map((ward) => ({
      value: ward.name,
      label: ward.name,
    })),
  ];

  const handleLocationChange = (changes: Record<string, string>) => {
    const next = new URLSearchParams(searchParams.toString());

    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    next.set("page", "1");

    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const selectedReports = accidentReports.filter((r) =>
    selectedIds.includes(r.accidentReportId),
  );

  const canApprove =
    selectedReports.length > 0 &&
    selectedReports.every(
      (r) =>
        r.status === AccidentReportStatus.ACCEPTED ||
        r.status === AccidentReportStatus.DECLINED,
    );

  const canDecline =
    selectedReports.length > 0 &&
    selectedReports.every((r) => r.status === AccidentReportStatus.ACCEPTED);

  const submitReview = (status: AccidentReportReviewStatus, note?: string) => {
    if (isReviewing || selectedIds.length === 0) return;

    reviewAccidentReportMutation.mutate(
      { accidentReportIds: selectedIds, status, note },
      {
        onSuccess: () => {
          setReviewStatus(null);
          setSelectedIds([]);
        },
      },
    );
  };

  const handleConfirmDialogReview = (status: AccidentReportReviewStatus) => {
    if (selectedIds.length === 0) return;

    const reportById = new Map(
      accidentReports.map((r) => [r.accidentReportId, r]),
    );

    const allowedStatuses: AccidentReportStatus[] =
      status === AccidentReportReviewStatus.APPROVED
        ? [AccidentReportStatus.ACCEPTED, AccidentReportStatus.DECLINED]
        : [AccidentReportStatus.ACCEPTED];

    const hasInvalid = selectedIds.some((id) => {
      const report = reportById.get(id);
      return !report || !allowedStatuses.includes(report.status);
    });

    if (hasInvalid) {
      toast.error(
        status === AccidentReportReviewStatus.APPROVED
          ? "Chỉ được duyệt các báo cáo có trạng thái là đã tiếp nhận hoặc đã từ chối"
          : "Chỉ được từ chối các báo cáo có trạng thái là đã tiếp nhận",
      );
      return;
    }

    setConfirmStatus(status);
  };

  const handleConfirmReview = () => {
    if (!confirmStatus) return;

    if (confirmStatus === AccidentReportReviewStatus.APPROVED) {
      submitReview(confirmStatus);
    } else {
      setReviewStatus(confirmStatus);
    }

    setConfirmStatus(null);
  };

  const handleReviewAccidentReport = (note: string) => {
    if (!reviewStatus) return;
    submitReview(reviewStatus, note);
  };

  const hasActiveFilter = FILTER_KEYS.some((k) => searchParams.get(k));

  const handleClearFilter = () => {
    const next = new URLSearchParams(searchParams.toString());

    FILTER_KEYS.forEach((k) => next.delete(k));
    next.delete("page");

    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const columns: TableColumn<AccidentReportResponse>[] = [
    {
      key: "actions",
      header: "Hành động",
      cell: (r) => {
        const isViewOnly = (
          [
            AccidentReportStatus.ACCEPTED,
            AccidentReportStatus.APPROVED,
            AccidentReportStatus.EXPIRED,
          ] as AccidentReportStatus[]
        ).includes(r.status);

        return (
          <div className="flex items-center gap-3">
            <Link href={`/accident-reports/${r.accidentReportId}?mode=view`}>
              <Eye size={22} className="text-muted-foreground" />
            </Link>

            {isRoleDN && !isViewOnly && (
              <Link href={`/accident-reports/${r.accidentReportId}?mode=edit`}>
                <Pencil size={22} className="text-edit" />
              </Link>
            )}
          </div>
        );
      },
    },
    {
      key: "name",
      header: "Tên doanh nghiệp",
      cell: (r) => r.name,
      filter: isRoleSo
        ? {
            type: "text",
            paramKey: "name",
            placeholder: "Nhập tên doanh nghiệp",
          }
        : undefined,
    },
    {
      key: "taxCode",
      header: "Mã số thuế",
      cell: (r) => r.taxCode,
      filter: isRoleSo
        ? { type: "text", paramKey: "taxCode", placeholder: "Nhập mã số thuế" }
        : undefined,
    },
    {
      key: "reportPeriod",
      header: "Kỳ báo cáo",
      cell: (r) => getPeriodLabel(r.reportPeriod),
      filter: isRoleSo
        ? {
            type: "select",
            paramKey: "reportPeriod",
            options: ACCIDENT_REPORT_PERIOD_OPTIONS,
          }
        : undefined,
    },
    {
      key: "note",
      header: "Ghi chú",
      cell: (r) => (
        <p className="line-clamp-2 max-w-xs break-words">{r.note}</p>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (r) => (
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 font-normal ${getStatusClass(r.status)}`}
        >
          {getStatusLabel(r.status)}
        </span>
      ),
      filter: isRoleSo
        ? {
            type: "select",
            paramKey: "status",
            options: ACCIDENT_REPORT_STATUS_OPTIONS,
          }
        : undefined,
    },
    {
      key: "createdAt",
      header: "Ngày tạo",
      cell: (r) => formatDate(r.createdAt),
    },
    {
      key: "updatedAt",
      header: "Ngày cập nhật",
      cell: (r) => formatDate(r.updatedAt),
    },
  ];

  return (
    <>
      <ListLayout
        title={`Báo cáo TNLĐ (${totalElements})`}
        actions={
          <div className="flex items-center justify-center gap-3">
            <Select
              searchable={false}
              options={yearOptions}
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
              <>
                {canDecline && (
                  <Button
                    type="button"
                    disabled={isReviewing}
                    onClick={() =>
                      handleConfirmDialogReview(
                        AccidentReportReviewStatus.DECLINED,
                      )
                    }
                    className="flex items-center gap-2 rounded-md bg-error px-3 py-2 font-medium text-white"
                  >
                    <CircleX size={18} />
                    <span>Từ chối ({selectedIds.length})</span>
                  </Button>
                )}

                {canApprove && (
                  <Button
                    type="button"
                    disabled={isReviewing}
                    onClick={() =>
                      handleConfirmDialogReview(
                        AccidentReportReviewStatus.APPROVED,
                      )
                    }
                    className="flex items-center gap-2 rounded-md bg-success px-3 py-2 font-medium text-white"
                  >
                    <CircleCheck size={18} />
                    <span>Duyệt ({selectedIds.length})</span>
                  </Button>
                )}
              </>
            )}

            {isRoleSo && hasActiveFilter && (
              <Button
                type="button"
                onClick={handleClearFilter}
                className="rounded-md bg-error px-3 py-2 font-medium text-white flex items-center gap-2"
              >
                <FunnelX size={18} /> <span>Xóa bộ lọc</span>
              </Button>
            )}
          </div>
        }
        others={
          isRoleSo ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <FloatingSelect
                label="Tỉnh/thành phố"
                placeholder="Tất cả tỉnh/thành phố"
                disabled={isFetchingProvince}
                options={provinceOptions}
                value={selectedProvince}
                onChange={(val) =>
                  handleLocationChange({ province: val, ward: "" })
                }
              />

              <FloatingSelect
                label="Phường/xã"
                placeholder="Tất cả phường/xã"
                disabled={!selectedProvince}
                options={wardOptions}
                value={selectedWard}
                onChange={(val) => handleLocationChange({ ward: val })}
              />
            </div>
          ) : undefined
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

      {confirmStatus && (
        <ConfirmDialog
          title={
            confirmStatus === AccidentReportReviewStatus.APPROVED
              ? "Xác nhận duyệt báo cáo"
              : "Xác nhận từ chối báo cáo"
          }
          description={`Bạn có chắc chắn muốn ${
            confirmStatus === AccidentReportReviewStatus.APPROVED
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
          isLoading={isReviewing}
          onSubmit={handleReviewAccidentReport}
          onClose={() => setReviewStatus(null)}
        />
      )}
    </>
  );
}

export default AccidentReportList;
