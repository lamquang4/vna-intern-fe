"use client";
import { useMemo } from "react";
import {
  useWatch,
  useFormState,
  useFormContext,
  type FieldPath,
} from "react-hook-form";
import { FloatingInput } from "@/libs/core/components/ui/fields/FloatingInput";
import { parseThousands } from "@/libs/core/utils/formatters";
import type { UpdateAccidentReportFormValues } from "@/libs/shared/tts/schemas/accident-report.schema";

interface Props {
  prefix: "accidentTotals" | "subsidizedAccident";
}

function AccidentStatsStep({ prefix }: Props) {
  const { control, register, getFieldState, trigger } =
    useFormContext<UpdateAccidentReportFormValues>();
  const formState = useFormState({ control });
  const getError = (name: FieldPath<UpdateAccidentReportFormValues>) =>
    getFieldState(name, formState).error?.message;
  const caseFieldDeps = useMemo<FieldPath<UpdateAccidentReportFormValues>[]>(
    () => [
      `${prefix}.totalCases`,
      `${prefix}.fatalCases`,
      `${prefix}.totalCasesWithTwoOrMoreVictims`,
    ],
    [prefix],
  );
  const victimFieldDeps = useMemo<FieldPath<UpdateAccidentReportFormValues>[]>(
    () => [
      `${prefix}.totalVictims`,
      `${prefix}.totalFemaleVictims`,
      `${prefix}.totalFatalVictims`,
      `${prefix}.totalSeverelyInjuredVictims`,
    ],
    [prefix],
  );
  const nonManagedVictimFieldDeps = useMemo<
    FieldPath<UpdateAccidentReportFormValues>[]
  >(
    () => [
      `${prefix}.nonManagedVictims`,
      `${prefix}.nonManagedFemaleVictims`,
      `${prefix}.nonManagedFatalVictims`,
      `${prefix}.nonManagedSeverelyInjuredVictims`,
    ],
    [prefix],
  );
  const medicalExpense = useWatch({
    control,
    name: `${prefix}.medicalExpense`,
  });
  const salaryExpense = useWatch({
    control,
    name: `${prefix}.salaryExpenseDuringTreatment`,
  });
  const compensationExpense = useWatch({
    control,
    name: `${prefix}.compensationExpense`,
  });
  const totalExpense =
    (Number(medicalExpense) || 0) +
    (Number(salaryExpense) || 0) +
    (Number(compensationExpense) || 0);

  const registerNumberField = (
    name: FieldPath<UpdateAccidentReportFormValues>,
    fieldsToValidate: FieldPath<UpdateAccidentReportFormValues>[],
  ) => {
    const field = register(name, {
      setValueAs: (value: string) => (value === "" ? null : Number(value)),
    });

    return {
      ...field,
      onBlur: async (event: Parameters<typeof field.onBlur>[0]) => {
        await field.onBlur(event);
        await trigger(fieldsToValidate);
      },
    };
  };

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="flex flex-col gap-[20px]">
        <h5>1. Tổng số vụ tai nạn lao động và số nạn nhân tai nạn lao động</h5>

        <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2 lg:grid-cols-4">
          <FloatingInput
            {...registerNumberField(`${prefix}.totalCases`, caseFieldDeps)}
            type="number"
            min={0}
            required
            label="Tổng số vụ"
            placeholder="Nhập tổng số vụ"
            error={getError(`${prefix}.totalCases`)}
          />
          <FloatingInput
            {...registerNumberField(`${prefix}.fatalCases`, caseFieldDeps)}
            type="number"
            min={0}
            required
            label="Tổng số vụ có người chết"
            placeholder="Nhập tổng số vụ có người chết"
            error={getError(`${prefix}.fatalCases`)}
          />
          <FloatingInput
            {...registerNumberField(
              `${prefix}.totalCasesWithTwoOrMoreVictims`,
              caseFieldDeps,
            )}
            type="number"
            min={0}
            required
            label="Tổng số vụ có 2 người bị nạn trở lên"
            placeholder="Nhập tổng số vụ có 2 người bị nạn trở lên"
            error={
              getError(`${prefix}.totalCasesWithTwoOrMoreVictims`)
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2 lg:grid-cols-4">
          <FloatingInput
            {...registerNumberField(`${prefix}.totalVictims`, victimFieldDeps)}
            type="number"
            min={0}
            required
            label="Tổng số người bị nạn"
            placeholder="Nhập tổng số người bị nạn"
            error={getError(`${prefix}.totalVictims`)}
          />

          <FloatingInput
            {...registerNumberField(
              `${prefix}.totalFemaleVictims`,
              victimFieldDeps,
            )}
            type="number"
            min={0}
            required
            label="Tổng số lao động nữ bị nạn"
            placeholder="Nhập tổng số lao động nữ bị nạn"
            error={getError(`${prefix}.totalFemaleVictims`)}
          />

          <FloatingInput
            {...registerNumberField(
              `${prefix}.totalFatalVictims`,
              victimFieldDeps,
            )}
            type="number"
            min={0}
            required
            label="Tổng số người bị chết"
            placeholder="Nhập tổng số người bị chết"
            error={getError(`${prefix}.totalFatalVictims`)}
          />

          <FloatingInput
            {...registerNumberField(
              `${prefix}.totalSeverelyInjuredVictims`,
              victimFieldDeps,
            )}
            type="number"
            min={0}
            required
            label="Tổng số người bị thương nặng"
            placeholder="Nhập tổng số người bị thương nặng"
            error={
              getError(`${prefix}.totalSeverelyInjuredVictims`)
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2 lg:grid-cols-4">
          <FloatingInput
            {...registerNumberField(
              `${prefix}.nonManagedVictims`,
              nonManagedVictimFieldDeps,
            )}
            type="number"
            min={0}
            required
            label="Số người bị nạn không QL"
            placeholder="Nhập số người bị nạn không QL"
            error={getError(`${prefix}.nonManagedVictims`)}
          />

          <FloatingInput
            {...registerNumberField(
              `${prefix}.nonManagedFemaleVictims`,
              nonManagedVictimFieldDeps,
            )}
            type="number"
            min={0}
            required
            label="Lao động nữ bị nạn không QL"
            placeholder="Nhập lao động nữ bị nạn không QL"
            error={
              getError(`${prefix}.nonManagedFemaleVictims`)
            }
          />

          <FloatingInput
            {...registerNumberField(
              `${prefix}.nonManagedFatalVictims`,
              nonManagedVictimFieldDeps,
            )}
            type="number"
            min={0}
            required
            label="Số người chết không QL"
            placeholder="Nhập số người chết không QL"
            error={
              getError(`${prefix}.nonManagedFatalVictims`)
            }
          />

          <FloatingInput
            {...registerNumberField(
              `${prefix}.nonManagedSeverelyInjuredVictims`,
              nonManagedVictimFieldDeps,
            )}
            type="number"
            min={0}
            required
            label="Người bị thương nặng không QL"
            placeholder="Nhập người bị thương nặng không QL"
            error={
              getError(`${prefix}.nonManagedSeverelyInjuredVictims`)
            }
          />
        </div>
      </div>

      <div className="flex flex-col gap-[20px]">
        <h5>2. Thiệt hại do tai nạn lao động</h5>

        <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2 lg:grid-cols-4">
          <FloatingInput
            {...register(`${prefix}.medicalExpense`, {
              setValueAs: parseThousands,
            })}
            formatThousands
            label="Chi phí y tế"
            required
            placeholder="Nhập chi phí y tế"
            error={getError(`${prefix}.medicalExpense`)}
          />
          <FloatingInput
            {...register(`${prefix}.salaryExpenseDuringTreatment`, {
              setValueAs: parseThousands,
            })}
            formatThousands
            label="Chi phí trả lương trong thời gian điều trị"
            required
            placeholder="Nhập chi phí trả lương trong thời gian điều trị"
            error={
              getError(`${prefix}.salaryExpenseDuringTreatment`)
            }
          />
          <FloatingInput
            {...register(`${prefix}.compensationExpense`, {
              setValueAs: parseThousands,
            })}
            formatThousands
            label="Chi phí bồi thường trợ cấp"
            placeholder="Nhập chi phí bồi thường trợ cấp"
            required
            error={
              getError(`${prefix}.compensationExpense`)
            }
          />
          <FloatingInput
            label="Tổng số tiền chi phí"
            placeholder="Nhập tổng số tiền chi phí"
            required
            type="text"
            value={new Intl.NumberFormat("vi-VN").format(totalExpense)}
            disabled
          />
        </div>

        <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2 lg:grid-cols-4">
          <FloatingInput
            {...register(`${prefix}.totalDaysOff`, {
              setValueAs: (value: string) =>
                value === "" ? null : Number(value),
            })}
            type="number"
            min={0}
            required
            label="Tổng số ngày nghỉ vì TNLĐ"
            placeholder="Nhập tổng số ngày nghỉ vì TNLĐ"
            error={getError(`${prefix}.totalDaysOff`)}
          />
          <FloatingInput
            {...register(`${prefix}.propertyDamageExpense`, {
              setValueAs: parseThousands,
            })}
            formatThousands
            label="Thiệt hại tài sản"
            placeholder="Nhập thiệt hại tài sản"
            error={
              getError(`${prefix}.propertyDamageExpense`)
            }
          />
        </div>
      </div>
    </div>
  );
}

export default AccidentStatsStep;
