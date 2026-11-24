"use client";

import { useEffect, useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { Button } from "@/libs/core/components/ui/Button";
import { Modal } from "@/libs/core/components/ui/Modal";
import { FloatingInput } from "@/libs/core/components/ui/fields/FloatingInput";
import { FloatingSelect } from "@/libs/core/components/ui/fields/FloatingSelect";
import { ACCIDENT_REPORT_PERIOD_OPTIONS } from "@/libs/core/constants/options";
import { AccidentReportPeriod } from "@/libs/shared/tts/models/enums";
import { useConfigureReportDeadline } from "../../hooks/useReportConfigs";

interface Props {
  onClose: () => void;
  year: number;
}

export function DeadlineConfigurationModal({ onClose, year }: Props) {
  const [period, setPeriod] = useState<AccidentReportPeriod>(
    AccidentReportPeriod.SIX_MONTHS,
  );
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const configureMutation = useConfigureReportDeadline();

  useEffect(() => {
    setError("");
  }, [deadline, period]);

  const getDefaultDeadline = () =>
    period === AccidentReportPeriod.SIX_MONTHS
      ? `${year}-07-05`
      : `${year + 1}-01-10`;

  const handleSubmit = () => {
    if (!deadline) {
      setError("Vui lòng nhập hạn nộp.");
      return;
    }

    const selected = parseISO(deadline);
    const validYear =
      period === AccidentReportPeriod.SIX_MONTHS
        ? selected.getFullYear() === year
        : selected.getFullYear() === year ||
          selected.getFullYear() === year + 1;
    if (!isValid(selected) || !validYear) {
      setError(
        period === AccidentReportPeriod.SIX_MONTHS
          ? `Ngày hạn nộp 6 tháng phải nằm trong năm ${year}.`
          : `Ngày hạn nộp cả năm phải nằm trong năm ${year} hoặc ${year + 1}.`,
      );
      return;
    }

    configureMutation.mutate(
      { period, year, deadlineAt: deadline },
      {
        onSuccess: (res) => setSuccessMessage(res.data?.message || ""),
      },
    );
  };

  if (successMessage) {
    return (
      <Modal
        title="Cấu hình thời hạn thành công"
        onClose={onClose}
        className="max-w-[500px]"
        headerClassName="bg-warning text-white uppercase"
      >
        <div className="flex flex-col gap-6">
          <p className="text-center">{successMessage}</p>
          <Button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-primary px-3 py-2 font-medium text-white"
          >
            Xác nhận
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title="Cấu hình thời hạn báo cáo"
      onClose={onClose}
      className="max-w-[520px] !overflow-visible [&>div]:!overflow-visible"
      headerClassName="bg-warning text-white uppercase rounded-t-lg"
    >
      <div className="flex flex-col gap-5">
        <FloatingSelect
          label="Loại báo cáo"
          options={ACCIDENT_REPORT_PERIOD_OPTIONS}
          value={period}
          onChange={(value) => setPeriod(value as AccidentReportPeriod)}
        />

        <div className="relative z-50 [&_.react-datepicker-popper]:!z-[999]">
          <FloatingInput
            label="Hạn nộp"
            type="date"
            required
            dateValue={deadline ? parseISO(deadline) : null}
            onDateChange={(date) =>
              setDeadline(date ? format(date, "yyyy-MM-dd") : "")
            }
            error={error}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            onClick={() => setDeadline(getDefaultDeadline())}
            className="rounded-lg border border-border px-3 py-2 font-medium"
          >
            Mặc định
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-3 py-2 font-medium"
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              disabled={configureMutation.isPending}
              onClick={handleSubmit}
              className="rounded-lg bg-primary px-3 py-2 font-medium text-white"
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
