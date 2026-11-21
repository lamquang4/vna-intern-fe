"use client";
import { Printer } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/libs/core/components/ui/Select";
import { useGetOverallAccidentReport } from "../../../hooks/useAccidentReports";
import OverallBusinessTable from "./OverallBusinessTable";
import OverallClassificationTable from "./OverallClassificationTable";
import { useGetReportConfigYears } from "@/libs/tts/hooks/useReportConfigs";
import { Button } from "@/libs/core/components/ui/Button";
import FormLayout from "../../layout/FormLayout";
import { useState } from "react";
import toast from "react-hot-toast";
import { downloadOverallAccidentReportWord } from "@/libs/tts/utils/accidentReportOverallWordExport";

function OverallAccidentReport() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isExportingReport, setIsExportingReport] = useState<boolean>(false);

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
  const accidentReportsPath = `/accident-reports?year=${year}`;
  const summaryQuery = useGetOverallAccidentReport(year);
  const summary = summaryQuery.data?.data;

  const handleYearChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePrintReport = async () => {
    if (!summary) {
      toast.error("Chưa có dữ liệu báo cáo để tải Word");
      return;
    }

    setIsExportingReport(true);

    try {
      await downloadOverallAccidentReportWord(summary, year);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể xuất báo cáo Word",
      );
    } finally {
      setIsExportingReport(false);
    }
  };

  return (
    <FormLayout
      title="Báo cáo tổng hợp tai nạn lao động"
      backHref={accidentReportsPath}
      action={
        <div className="w-28">
          <Select
            searchable={false}
            options={yearOptions}
            value={String(year)}
            onChange={handleYearChange}
          />
        </div>
      }
      actions={
        <Button
          type="button"
          onClick={handlePrintReport}
          disabled={isExportingReport || summaryQuery.isLoading || !summary}
          className="flex items-center gap-2 rounded-md border border-primary px-3 py-2 text-primary"
        >
          <Printer size={18} />
          <span>In báo cáo</span>
        </Button>
      }
    >
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
    </FormLayout>
  );
}

export default OverallAccidentReport;
