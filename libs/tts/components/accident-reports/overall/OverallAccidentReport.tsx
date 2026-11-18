"use client";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/libs/core/components/ui/Select";
import { useGetOverallAccidentReport } from "../../../hooks/useAccidentReports";
import OverallBusinessTable from "./OverallBusinessTable";
import OverallClassificationTable from "./OverallClassificationTable";
import { useGetReportConfigYears } from "@/libs/tts/hooks/useReportConfigs";

function OverallAccidentReport() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: dataYears } = useGetReportConfigYears();
  const years = dataYears?.data ?? [];

  const yearOptions = years.map((y) => ({
    value: String(y),
    label: String(y),
  }));

  const currentYear = new Date().getFullYear();
  const requestedYear = Number(searchParams.get("year"));
  const year =
    searchParams.has("year") &&
    Number.isInteger(requestedYear) &&
    requestedYear > 0
      ? requestedYear
      : currentYear;
  const summaryQuery = useGetOverallAccidentReport(year);

  const handleYearChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const summary = summaryQuery.data?.data;

  return (
    <div className="py-[30px] sm:px-[20px] px-[15px] flex flex-col gap-6 overflow-y-auto">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <h3>Báo cáo tổng hợp tai nạn lao động</h3>

        <div className="flex gap-3 justify-center items-center flex-wrap">
          <div className="w-28">
            <Select
              searchable={false}
              options={yearOptions}
              value={String(year)}
              onChange={handleYearChange}
            />
          </div>
          <Link
            href="/accident-reports"
            className="flex items-center gap-1 px-3 py-2 font-medium text-muted-foreground hover:text-primary"
          >
            <ChevronLeft size={20} /> <span>Trở về</span>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-3">
          <h5>I. Thông tin tổng quan</h5>
          <OverallBusinessTable
            businessTypes={summary?.businessTypes}
            total={summary?.total1}
          />
        </section>

        <section className="flex flex-col gap-3">
          <h5>II. Phân loại tai nạn lao động</h5>
          <OverallClassificationTable summary={summary} />
        </section>
      </div>
    </div>
  );
}

export default OverallAccidentReport;
