"use client";

import { useEffect, useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/libs/core/components/ui/Button";
import { Modal } from "@/libs/core/components/ui/Modal";
import { FloatingInput } from "@/libs/core/components/ui/fields/FloatingInput";
import type { AccidentReportResponse } from "@/libs/shared/tts/models/accident-report.model";
import {
  useExtendReportDeadline,
  useGetDeadlineExtensions,
  useGetReportConfigurations,
} from "../../hooks/useReportConfigs";

interface Props {
  report: AccidentReportResponse;
  onClose: () => void;
}

const formatDisplayDate = (value: Date) =>
  format(value, "dd/MM/yyyy", { locale: vi });

const parseDeadlineDate = (value: string | Date) => {
  if (typeof value === "string") {
    const dateOnly = value.slice(0, 10);
    return parseISO(dateOnly);
  }
  return value;
};

export function DeadlineExtensionModal({ report, onClose }: Props) {
  const [newDeadline, setNewDeadline] = useState("");
  const [error, setError] = useState("");
  const [successDate, setSuccessDate] = useState("");

  const configurationsQuery = useGetReportConfigurations();
  const extensionsQuery = useGetDeadlineExtensions(report.year);
  const extendMutation = useExtendReportDeadline();

  useEffect(() => {
    setError("");
  }, [newDeadline]);

  const configurations = configurationsQuery.data?.data ?? [];
  const extensions = extensionsQuery.data?.data ?? [];
  const configuration = configurations.find(
    (item) => item.period === report.reportPeriod,
  );
  const extension = extensions.find(
    (item) => item.period === report.reportPeriod,
  );

  let currentDeadline: Date | null = null;
  if (report.deadlineAt) {
    currentDeadline = parseDeadlineDate(report.deadlineAt);
  } else if (extension) {
    currentDeadline = parseDeadlineDate(extension.deadlineAt);
  } else if (configuration) {
    const deadlineYear =
      report.reportPeriod === "FULL_YEAR" &&
      configuration.deadlineMonth <= 3
        ? report.year + 1
        : report.year;
    currentDeadline = new Date(
      deadlineYear,
      configuration.deadlineMonth - 1,
      configuration.deadlineDay,
      23,
      59,
      59,
      999,
    );
  }

  const handleSubmit = () => {
    if (!newDeadline) {
      setError("Vui lòng nhập hạn nộp mới.");
      return;
    }

    const selected = parseISO(newDeadline);
    if (!isValid(selected)) {
      setError("Ngày hạn nộp không hợp lệ.");
      return;
    }

    if (currentDeadline && selected <= currentDeadline) {
      setError("Hạn nộp mới phải sau hạn nộp đang áp dụng.");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) {
      setError("Hạn nộp mới phải là ngày trong tương lai.");
      return;
    }

    extendMutation.mutate(
      {
        accidentReportId: report.accidentReportId,
        period: report.reportPeriod,
        year: report.year,
        deadlineAt: newDeadline,
      },
      {
        onSuccess: () => setSuccessDate(format(selected, "dd/MM/yyyy")),
      },
    );
  };

  if (successDate) {
    return (
      <Modal
        title="Gia hạn báo cáo thành công"
        onClose={onClose}
        className="max-w-[450px]"
        headerClassName="bg-primary text-white uppercase"
      >
        <div className="flex flex-col gap-6">
          <p className="text-center">
            Thời hạn nộp báo cáo mới là <strong>{successDate}</strong>.
          </p>
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
      title="Gia hạn thời hạn nộp báo cáo"
      onClose={onClose}
      className="max-w-[500px] !overflow-visible [&>div]:!overflow-visible"
      headerClassName="bg-primary text-white uppercase rounded-t-lg"
    >
      <div className="flex flex-col gap-5">
        <p>
          Doanh nghiệp: <strong>{report.name}</strong>
        </p>
        <p>
          Hạn nộp đang áp dụng:{" "}
          <strong>
            {currentDeadline
              ? formatDisplayDate(currentDeadline)
              : "Đang tải..."}
          </strong>
        </p>

        <div className="relative z-50 [&_.react-datepicker-popper]:!z-[999]">
          <FloatingInput
            label="Hạn nộp mới"
            type="date"
            required
            dateValue={newDeadline ? parseISO(newDeadline) : null}
            onDateChange={(date) =>
              setNewDeadline(date ? format(date, "yyyy-MM-dd") : "")
            }
            error={error}
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-3 py-2 font-medium"
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            disabled={
              extendMutation.isPending ||
              configurationsQuery.isLoading ||
              extensionsQuery.isLoading
            }
            onClick={handleSubmit}
            className="rounded-lg bg-primary px-3 py-2 font-medium text-white"
          >
            Xác nhận
          </Button>
        </div>
      </div>
    </Modal>
  );
}
