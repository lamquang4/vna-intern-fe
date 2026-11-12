"use client";
import { Eye, Filter, Pencil } from "lucide-react";
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
  AccidentReportStatus,
  RoleCode,
} from "@/libs/shared/tts/models/enums";
import { AccidentReportResponse } from "@/libs/shared/tts/models/accident-report.model";
import {
  useGetAccidentReports,
  useGetAccidentReportsMe,
} from "../../hooks/useAccidentReports";
import {
  ACCIDENT_REPORT_PERIOD_OPTIONS,
  ACCIDENT_REPORT_STATUS_OPTIONS,
  YEAR_OPTIONS,
} from "@/libs/core/constants/options";
import { useGetMe } from "../../hooks/useAuth";
import { formatDate } from "@/libs/core/utils/formatters";
import { Select } from "@/libs/core/components/ui/Select";

function AccidentReportList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [filterOpen, setFilterOpen] = useState<boolean>(false);

  const getStatusLabel = (status: AccidentReportStatus) =>
    ACCIDENT_REPORT_STATUS_OPTIONS.find((o) => o.value === status)?.label ??
    status;

  const getPeriodLabel = (period: AccidentReportPeriod) =>
    ACCIDENT_REPORT_PERIOD_OPTIONS.find((o) => o.value === period)?.label ??
    status;

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

  const { data: dataMe } = useGetMe();
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

  const isFetchingAccidentReports = isRoleSo
    ? isLoadingSo
    : isRoleDN
      ? isLoadingDN
      : false;

  const accidentReports = data?.data ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 1;

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

        return (
          <div className="flex items-center gap-2">
            <div
              className={`size-3 rounded-full ${
                isAccepted ? "bg-primary" : "bg-muted-foreground"
              }`}
            />
            <span className={`font-normal ${isAccepted ? "text-primary" : ""}`}>
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
              className="flex items-center gap-2 rounded-md border border-primary px-2 py-2.5 font-medium text-primary"
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
                className="whitespace-nowrap rounded-md bg-primary px-2 py-2.5 font-medium text-white w-full"
              >
                Báo cáo tổng hợp
              </Link>
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
        />
      </ListLayout>

      {filterOpen && account?.roleCode && (
        <AccidentReportFilterModal
          onClose={() => setFilterOpen(false)}
          roleCode={account?.roleCode}
        />
      )}
    </>
  );
}

export default AccidentReportList;
