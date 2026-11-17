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
  type: "accidentTotals" | "subsidizedAccident";
}

function AccidentStatsStep({ type }: Props) {
  const { control, register, getFieldState, trigger } =
    useFormContext<UpdateAccidentReportFormValues>();
  const formState = useFormState({ control });
  const getError = (name: FieldPath<UpdateAccidentReportFormValues>) =>
    getFieldState(name, formState).error?.message;
  const caseFieldDeps = useMemo<FieldPath<UpdateAccidentReportFormValues>[]>(
    () => [
      `${type}.totalCases`,
      `${type}.fatalCases`,
      `${type}.totalCasesWithTwoOrMoreVictims`,
    ],
    [type],
  );
  const victimFieldDeps = useMemo<FieldPath<UpdateAccidentReportFormValues>[]>(
    () => [
      `${type}.totalVictims`,
      `${type}.totalFemaleVictims`,
      `${type}.totalFatalVictims`,
      `${type}.totalSeverelyInjuredVictims`,
    ],
    [type],
  );
  const nonManagedVictimFieldDeps = useMemo<
    FieldPath<UpdateAccidentReportFormValues>[]
  >(
    () => [
      `${type}.nonManagedVictims`,
      `${type}.nonManagedFemaleVictims`,
      `${type}.nonManagedFatalVictims`,
      `${type}.nonManagedSeverelyInjuredVictims`,
    ],
    [type],
  );
  const medicalExpense = useWatch({
    control,
    name: `${type}.medicalExpense`,
  });
  const salaryExpense = useWatch({
    control,
    name: `${type}.salaryExpenseDuringTreatment`,
  });
  const compensationExpense = useWatch({
    control,
    name: `${type}.compensationExpense`,
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
            {...registerNumberField(`${type}.totalCases`, caseFieldDeps)}
            type="number"
            min={0}
            required
            label="Tổng số vụ"
            placeholder="Nhập tổng số vụ"
            error={getError(`${type}.totalCases`)}
          />
          <FloatingInput
            {...registerNumberField(`${type}.fatalCases`, caseFieldDeps)}
            type="number"
            min={0}
            required
            label="Tổng số vụ có người chết"
            placeholder="Nhập tổng số vụ có người chết"
            error={getError(`${type}.fatalCases`)}
          />
          <FloatingInput
            {...registerNumberField(
              `${type}.totalCasesWithTwoOrMoreVictims`,
              caseFieldDeps,
            )}
            type="number"
            min={0}
            required
            label="Tổng số vụ có 2 người bị nạn trở lên"
            placeholder="Nhập tổng số vụ có 2 người bị nạn trở lên"
            error={
              getError(`${type}.totalCasesWithTwoOrMoreVictims`)
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2 lg:grid-cols-4">
          <FloatingInput
            {...registerNumberField(`${type}.totalVictims`, victimFieldDeps)}
            type="number"
            min={0}
            required
            label="Tổng số người bị nạn"
            placeholder="Nhập tổng số người bị nạn"
            error={getError(`${type}.totalVictims`)}
          />

          <FloatingInput
            {...registerNumberField(
              `${type}.totalFemaleVictims`,
              victimFieldDeps,
            )}
            type="number"
            min={0}
            required
            label="Tổng số lao động nữ bị nạn"
            placeholder="Nhập tổng số lao động nữ bị nạn"
            error={getError(`${type}.totalFemaleVictims`)}
          />

          <FloatingInput
            {...registerNumberField(
              `${type}.totalFatalVictims`,
              victimFieldDeps,
            )}
            type="number"
            min={0}
            required
            label="Tổng số người bị chết"
            placeholder="Nhập tổng số người bị chết"
            error={getError(`${type}.totalFatalVictims`)}
          />

          <FloatingInput
            {...registerNumberField(
              `${type}.totalSeverelyInjuredVictims`,
              victimFieldDeps,
            )}
            type="number"
            min={0}
            required
            label="Tổng số người bị thương nặng"
            placeholder="Nhập tổng số người bị thương nặng"
            error={
              getError(`${type}.totalSeverelyInjuredVictims`)
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2 lg:grid-cols-4">
          <FloatingInput
            {...registerNumberField(
              `${type}.nonManagedVictims`,
              nonManagedVictimFieldDeps,
            )}
            type="number"
            min={0}
            required
            label="Số người bị nạn không QL"
            placeholder="Nhập số người bị nạn không QL"
            error={getError(`${type}.nonManagedVictims`)}
          />

          <FloatingInput
            {...registerNumberField(
              `${type}.nonManagedFemaleVictims`,
              nonManagedVictimFieldDeps,
            )}
            type="number"
            min={0}
            required
            label="Lao động nữ bị nạn không QL"
            placeholder="Nhập lao động nữ bị nạn không QL"
            error={
              getError(`${type}.nonManagedFemaleVictims`)
            }
          />

          <FloatingInput
            {...registerNumberField(
              `${type}.nonManagedFatalVictims`,
              nonManagedVictimFieldDeps,
            )}
            type="number"
            min={0}
            required
            label="Số người chết không QL"
            placeholder="Nhập số người chết không QL"
            error={
              getError(`${type}.nonManagedFatalVictims`)
            }
          />

          <FloatingInput
            {...registerNumberField(
              `${type}.nonManagedSeverelyInjuredVictims`,
              nonManagedVictimFieldDeps,
            )}
            type="number"
            min={0}
            required
            label="Người bị thương nặng không QL"
            placeholder="Nhập người bị thương nặng không QL"
            error={
              getError(`${type}.nonManagedSeverelyInjuredVictims`)
            }
          />
        </div>
      </div>

      <div className="flex flex-col gap-[20px]">
        <h5>2. Thiệt hại do tai nạn lao động</h5>

        <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2 lg:grid-cols-4">
          <FloatingInput
            {...register(`${type}.medicalExpense`, {
              setValueAs: parseThousands,
            })}
            formatThousands
            label="Chi phí y tế"
            required
            placeholder="Nhập chi phí y tế"
            error={getError(`${type}.medicalExpense`)}
          />
          <FloatingInput
            {...register(`${type}.salaryExpenseDuringTreatment`, {
              setValueAs: parseThousands,
            })}
            formatThousands
            label="Chi phí trả lương trong thời gian điều trị"
            required
            placeholder="Nhập chi phí trả lương trong thời gian điều trị"
            error={
              getError(`${type}.salaryExpenseDuringTreatment`)
            }
          />
          <FloatingInput
            {...register(`${type}.compensationExpense`, {
              setValueAs: parseThousands,
            })}
            formatThousands
            label="Chi phí bồi thường trợ cấp"
            placeholder="Nhập chi phí bồi thường trợ cấp"
            required
            error={
              getError(`${type}.compensationExpense`)
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
            {...register(`${type}.totalDaysOff`, {
              setValueAs: (value: string) =>
                value === "" ? null : Number(value),
            })}
            type="number"
            min={0}
            required
            label="Tổng số ngày nghỉ vì TNLĐ"
            placeholder="Nhập tổng số ngày nghỉ vì TNLĐ"
            error={getError(`${type}.totalDaysOff`)}
          />
          <FloatingInput
            {...register(`${type}.propertyDamageExpense`, {
              setValueAs: parseThousands,
            })}
            formatThousands
            label="Thiệt hại tài sản"
            placeholder="Nhập thiệt hại tài sản"
            error={
              getError(`${type}.propertyDamageExpense`)
            }
          />
        </div>
      </div>
    </div>
  );
}

export default AccidentStatsStep;
