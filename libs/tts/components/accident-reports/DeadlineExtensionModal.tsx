"use client";

import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { Button } from "@/libs/core/components/ui/Button";
import { Modal } from "@/libs/core/components/ui/Modal";
import { FloatingInput } from "@/libs/core/components/ui/fields/FloatingInput";
import type { AccidentReportResponse } from "@/libs/shared/tts/models/accident-report.model";
import {
  createExtendReportDeadlineSchema,
  type ExtendReportDeadlineData,
} from "@/libs/shared/tts/schemas/report-config.schema";
import {
  useExtendReportDeadline,
  useGetDeadlineExtensions,
  useGetReportConfigurations,
} from "../../hooks/useReportConfigs";
import { formatDate, parseDate } from "@/libs/core/utils/formatters";

interface Props {
  report: AccidentReportResponse;
  onClose: () => void;
}

export function DeadlineExtensionModal({ report, onClose }: Props) {
  const configurationsQuery = useGetReportConfigurations();
  const extensionsQuery = useGetDeadlineExtensions(report.year);
  const extendMutation = useExtendReportDeadline();

  const configurations = configurationsQuery.data?.data;
  const extensions = extensionsQuery.data?.data;

  const currentDeadline = useMemo(() => {
    if (report.deadlineAt) return parseDate(report.deadlineAt);

    const extension = extensions?.find(
      (item) => item.period === report.reportPeriod,
    );
    if (extension) return parseDate(extension.deadlineAt);

    const configuration = configurations?.find(
      (item) => item.period === report.reportPeriod,
    );
    if (!configuration) return null;

    const deadlineYear =
      report.reportPeriod === "FULL_YEAR" && configuration.deadlineMonth <= 3
        ? report.year + 1
        : report.year;

    return new Date(
      deadlineYear,
      configuration.deadlineMonth - 1,
      configuration.deadlineDay,
      23,
      59,
      59,
      999,
    );
  }, [report, configurations, extensions]);

  const schema = useMemo(
    () => createExtendReportDeadlineSchema(currentDeadline),
    [currentDeadline],
  );

  const { control, handleSubmit } = useForm<ExtendReportDeadlineData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: { deadlineAt: "" },
  });

  const isLoading =
    extendMutation.isPending ||
    configurationsQuery.isLoading ||
    extensionsQuery.isLoading;

  const onSubmit = (values: ExtendReportDeadlineData) =>
    extendMutation.mutate(
      {
        accidentReportId: report.accidentReportId,
        period: report.reportPeriod,
        year: report.year,
        ...values,
      },
      {
        onSuccess: () => onClose(),
      },
    );
  return (
    <Modal
      title="Gia hạn thời hạn nộp báo cáo"
      onClose={onClose}
      className="max-w-[450px]"
      headerClassName="bg-primary text-white uppercase"
    >
      <form
        className="flex flex-col flex-1 min-h-0"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p>
              Doanh nghiệp: <strong>{report.name}</strong>
            </p>
            <p>
              Hạn nộp đang áp dụng:{" "}
              <strong>{formatDate(currentDeadline)}</strong>
            </p>
          </div>

          <Controller
            name="deadlineAt"
            control={control}
            render={({ field, fieldState }) => (
              <FloatingInput
                label="Hạn nộp mới"
                type="date"
                required
                dateValue={field.value ? parseISO(field.value) : null}
                onDateChange={(date) => {
                  field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                  field.onBlur();
                }}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
              />
            )}
          />

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              onClick={onClose}
              disabled={extendMutation.isPending}
              className="rounded-lg border border-border px-3 py-2 font-medium"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-primary px-3 py-2 font-medium text-white"
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
