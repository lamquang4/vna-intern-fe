"use client";

import { useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { Button } from "@/libs/core/components/ui/Button";
import { Modal } from "@/libs/core/components/ui/Modal";
import { FloatingInput } from "@/libs/core/components/ui/fields/FloatingInput";
import { FloatingSelect } from "@/libs/core/components/ui/fields/FloatingSelect";
import { ACCIDENT_REPORT_PERIOD_OPTIONS } from "@/libs/core/constants/options";
import { AccidentReportPeriod } from "@/libs/shared/tts/models/enums";
import {
  createConfigureReportDeadlineSchema,
  type ConfigureReportDeadlineData,
} from "@/libs/shared/tts/schemas/report-config.schema";
import { useConfigureReportDeadline } from "../../hooks/useReportConfigs";

interface Props {
  onClose: () => void;
  year: number;
}

const getDefaultDeadline = (period: AccidentReportPeriod, year: number) =>
  period === AccidentReportPeriod.SIX_MONTHS
    ? `${year}-07-05`
    : `${year + 1}-01-10`;

export function DeadlineConfigurationModal({ onClose, year }: Props) {
  const configureMutation = useConfigureReportDeadline();

  const schema = useMemo(
    () => createConfigureReportDeadlineSchema(year),
    [year],
  );

  const { control, handleSubmit, setValue, getValues, trigger } =
    useForm<ConfigureReportDeadlineData>({
      resolver: zodResolver(schema),
      mode: "onBlur",
      defaultValues: {
        period: AccidentReportPeriod.SIX_MONTHS,
        deadlineAt: "",
      },
    });

  const period = useWatch({ control, name: "period" });

  const onSubmit = (values: ConfigureReportDeadlineData) =>
    configureMutation.mutate({ ...values, year }, { onSuccess: onClose });

  return (
    <Modal
      title="Cấu hình thời hạn báo cáo"
      onClose={onClose}
      className="max-w-[450px]"
      headerClassName="bg-primary text-white uppercase"
    >
      <form
        className="flex flex-col flex-1 min-h-0"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-6">
          <Controller
            name="period"
            control={control}
            render={({ field, fieldState }) => (
              <FloatingSelect
                required
                label="Kỳ báo cáo"
                options={ACCIDENT_REPORT_PERIOD_OPTIONS}
                placeholder="Chọn kỳ báo cáo"
                name={field.name}
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);

                  if (getValues("deadlineAt")) trigger("deadlineAt");
                }}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="deadlineAt"
            control={control}
            render={({ field, fieldState }) => (
              <FloatingInput
                label="Hạn nộp"
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

          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              onClick={() =>
                setValue("deadlineAt", getDefaultDeadline(period, year), {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              className="rounded-lg border border-border px-3 py-2 font-medium"
            >
              Mặc định
            </Button>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={onClose}
                disabled={configureMutation.isPending}
                className="rounded-lg border border-border px-3 py-2 font-medium"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={configureMutation.isPending}
                className="rounded-lg bg-primary px-3 py-2 font-medium text-white"
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
