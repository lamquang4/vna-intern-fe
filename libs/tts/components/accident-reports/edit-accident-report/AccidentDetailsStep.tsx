"use client";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Controller,
  useFieldArray,
  useFormContext,
  useFormState,
  useWatch,
  type FieldPath,
} from "react-hook-form";
import { FloatingSelect } from "@/libs/core/components/ui/fields/FloatingSelect";
import type { UpdateAccidentReportFormValues } from "@/libs/shared/tts/schemas/accident-report.schema";
import {
  useGetInjuryFactors,
  useGetInjuryTypes,
  useGetOccupations,
} from "../../../hooks/useCategories";
import { FloatingInput } from "@/libs/core/components/ui/fields/FloatingInput";
import { parseThousands } from "@/libs/core/utils/formatters";
import { Button } from "@/libs/core/components/ui/Button";

const makeAccidentDetail = () => ({
  injuryTypeId: "",
  injuryFactorId: "",
  occupationId: "",
  totalVictims: 0,
  totalFemaleVictims: 0,
  totalFatalVictims: 0,
  totalSeverelyInjuredVictims: 0,
  nonManagedVictims: 0,
  nonManagedFemaleVictims: 0,
  nonManagedFatalVictims: 0,
  nonManagedSeverelyInjuredVictims: 0,
  medicalExpense: 0,
  salaryExpenseDuringTreatment: 0,
  compensationExpense: 0,
  totalExpense: 0,
  totalDaysOff: 0,
  propertyDamageExpense: 0,
});

const getVictimFieldDeps = (
  index: number,
): FieldPath<UpdateAccidentReportFormValues>[] => [
  `accidentDetails.${index}.totalVictims`,
  `accidentDetails.${index}.totalFemaleVictims`,
  `accidentDetails.${index}.totalFatalVictims`,
  `accidentDetails.${index}.totalSeverelyInjuredVictims`,
];

const getNonManagedVictimFieldDeps = (
  index: number,
): FieldPath<UpdateAccidentReportFormValues>[] => [
  `accidentDetails.${index}.nonManagedVictims`,
  `accidentDetails.${index}.nonManagedFemaleVictims`,
  `accidentDetails.${index}.nonManagedFatalVictims`,
  `accidentDetails.${index}.nonManagedSeverelyInjuredVictims`,
];

function AccidentDetailsStep() {
  const [collapsedDetails, setCollapsedDetails] = useState<Set<string>>(
    () => new Set(),
  );
  const { control, getFieldState, register, watch, trigger } =
    useFormContext<UpdateAccidentReportFormValues>();
  const formState = useFormState({ control });
  const getError = (name: FieldPath<UpdateAccidentReportFormValues>) =>
    getFieldState(name, formState).error?.message;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "accidentDetails",
  });
  const totalCases = useWatch({
    control,
    name: "accidentTotals.totalCases",
  });
  const desiredDetailsCount =
    typeof totalCases === "number" && Number.isInteger(totalCases)
      ? Math.max(0, totalCases)
      : 0;
  const details = watch("accidentDetails") ?? [];
  const injuryTypesQuery = useGetInjuryTypes();
  const injuryFactorsQuery = useGetInjuryFactors();
  const occupationsQuery = useGetOccupations();

  const toOptions = (
    categories: { categoryId: string; name: string }[] | undefined,
  ) =>
    (categories ?? []).map(({ categoryId, name }) => ({
      value: categoryId,
      label: name,
    }));

  const injuryTypeOptions = toOptions(injuryTypesQuery.data?.data);
  const injuryFactorOptions = toOptions(injuryFactorsQuery.data?.data);
  const occupationOptions = toOptions(occupationsQuery.data?.data);

  const isFetchingCategories =
    injuryTypesQuery.isLoading ||
    injuryFactorsQuery.isLoading ||
    occupationsQuery.isLoading;

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

  useEffect(() => {
    if (fields.length < desiredDetailsCount) {
      append(
        Array.from(
          { length: desiredDetailsCount - fields.length },
          makeAccidentDetail,
        ),
        { shouldFocus: false },
      );
    } else if (fields.length > desiredDetailsCount) {
      remove(
        Array.from(
          { length: fields.length - desiredDetailsCount },
          (_, index) => desiredDetailsCount + index,
        ),
      );
    }
  }, [append, desiredDetailsCount, fields.length, remove]);

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="flex flex-col gap-2">
        <p>Doanh nghiệp xảy ra tai nạn lao động vui lòng nhập theo từng bước</p>

        {desiredDetailsCount === 0 && (
          <p className="text-error">
            Tổng số vụ tai nạn là 0, không có chi tiết vụ tai nạn cần khai báo.
          </p>
        )}
      </div>

      {fields.map((field, index) => {
        const row = details[index];
        const totalExpense =
          (Number(row?.medicalExpense) || 0) +
          (Number(row?.salaryExpenseDuringTreatment) || 0) +
          (Number(row?.compensationExpense) || 0);

        return (
          <div
            key={field.id}
            className="flex flex-col gap-6 rounded-md border-b border-border pb-6"
          >
            <Button
              type="button"
              aria-expanded={!collapsedDetails.has(field.id)}
              aria-controls={`accident-detail-${field.id}`}
              onClick={() =>
                setCollapsedDetails((collapsed) => {
                  const next = new Set(collapsed);
                  if (next.has(field.id)) next.delete(field.id);
                  else next.add(field.id);
                  return next;
                })
              }
              className="flex w-full cursor-pointer items-center justify-between text-left"
            >
              <h5>Chi tiết vụ tai nạn số {index + 1}</h5>
              <ChevronDown
                size={20}
                strokeWidth={2}
                className={`transition-transform ${
                  collapsedDetails.has(field.id) ? "" : "rotate-180"
                }`}
              />
            </Button>

            <div
              id={`accident-detail-${field.id}`}
              className={
                collapsedDetails.has(field.id)
                  ? "hidden"
                  : "flex flex-col gap-[20px]"
              }
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                  control={control}
                  name={`accidentDetails.${index}.injuryTypeId`}
                  render={({ field: input }) => (
                    <FloatingSelect
                      label="1. Phân theo nguyên nhân xảy ra TNLĐ"
                      required
                      placeholder="Chọn nguyên nhân xảy ra TNLĐ"
                      options={injuryTypeOptions}
                      value={input.value}
                      onChange={input.onChange}
                      onBlur={input.onBlur}
                      disabled={
                        isFetchingCategories || injuryTypesQuery.isError
                      }
                      error={getError(`accidentDetails.${index}.injuryTypeId`)}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name={`accidentDetails.${index}.injuryFactorId`}
                  render={({ field: input }) => (
                    <FloatingSelect
                      label="2. Phân theo yếu tố gây chấn thương"
                      required
                      placeholder="Chọn yếu tố gây chấn thương"
                      options={injuryFactorOptions}
                      value={input.value}
                      onChange={input.onChange}
                      onBlur={input.onBlur}
                      disabled={
                        isFetchingCategories || injuryFactorsQuery.isError
                      }
                      error={getError(
                        `accidentDetails.${index}.injuryFactorId`,
                      )}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name={`accidentDetails.${index}.occupationId`}
                  render={({ field: input }) => (
                    <FloatingSelect
                      label="3. Phân theo nghề nghiệp"
                      required
                      placeholder="Chọn nghề nghiệp"
                      options={occupationOptions}
                      value={input.value}
                      onChange={input.onChange}
                      onBlur={input.onBlur}
                      disabled={
                        isFetchingCategories || occupationsQuery.isError
                      }
                      error={getError(`accidentDetails.${index}.occupationId`)}
                    />
                  )}
                />
              </div>

              <div className="flex flex-col gap-3">
                <p>4. Chi tiết vụ tai nạn số {index + 1}</p>
                <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2 lg:grid-cols-4">
                  <FloatingInput
                    {...registerNumberField(
                      `accidentDetails.${index}.totalVictims`,
                      getVictimFieldDeps(index),
                    )}
                    type="number"
                    min={0}
                    required
                    label="Tổng số người bị nạn"
                    placeholder="Nhập tổng số người bị nạn"
                    error={getError(`accidentDetails.${index}.totalVictims`)}
                  />
                  <FloatingInput
                    {...registerNumberField(
                      `accidentDetails.${index}.totalFemaleVictims`,
                      getVictimFieldDeps(index),
                    )}
                    type="number"
                    min={0}
                    required
                    label="Tổng số lao động nữ bị nạn"
                    placeholder="Nhập tổng số lao động nữ bị nạn"
                    error={getError(
                      `accidentDetails.${index}.totalFemaleVictims`,
                    )}
                  />
                  <FloatingInput
                    {...registerNumberField(
                      `accidentDetails.${index}.totalFatalVictims`,
                      getVictimFieldDeps(index),
                    )}
                    type="number"
                    min={0}
                    required
                    label="Tổng số người chết"
                    placeholder="Nhập tổng số người chết"
                    error={getError(
                      `accidentDetails.${index}.totalFatalVictims`,
                    )}
                  />
                  <FloatingInput
                    {...registerNumberField(
                      `accidentDetails.${index}.totalSeverelyInjuredVictims`,
                      getVictimFieldDeps(index),
                    )}
                    type="number"
                    min={0}
                    required
                    label="Tổng số người bị thương nặng"
                    placeholder="Nhập tổng số người bị thương nặng"
                    error={getError(
                      `accidentDetails.${index}.totalSeverelyInjuredVictims`,
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2 lg:grid-cols-4">
                  <FloatingInput
                    {...registerNumberField(
                      `accidentDetails.${index}.nonManagedVictims`,
                      getNonManagedVictimFieldDeps(index),
                    )}
                    type="number"
                    min={0}
                    required
                    label="Số người bị nạn không QL"
                    placeholder="Nhập số người bị nạn không QL"
                    error={getError(
                      `accidentDetails.${index}.nonManagedVictims`,
                    )}
                  />
                  <FloatingInput
                    {...registerNumberField(
                      `accidentDetails.${index}.nonManagedFemaleVictims`,
                      getNonManagedVictimFieldDeps(index),
                    )}
                    type="number"
                    min={0}
                    required
                    label="Lao động nữ bị nạn không QL"
                    placeholder="Nhập lao động nữ bị nạn không QL"
                    error={getError(
                      `accidentDetails.${index}.nonManagedFemaleVictims`,
                    )}
                  />
                  <FloatingInput
                    {...registerNumberField(
                      `accidentDetails.${index}.nonManagedFatalVictims`,
                      getNonManagedVictimFieldDeps(index),
                    )}
                    type="number"
                    min={0}
                    required
                    label="Số người chết không QL"
                    placeholder="Nhập số người chết không QL"
                    error={getError(
                      `accidentDetails.${index}.nonManagedFatalVictims`,
                    )}
                  />
                  <FloatingInput
                    {...registerNumberField(
                      `accidentDetails.${index}.nonManagedSeverelyInjuredVictims`,
                      getNonManagedVictimFieldDeps(index),
                    )}
                    type="number"
                    min={0}
                    required
                    label="Người bị thương nặng không QL"
                    placeholder="Nhập người bị thương nặng không QL"
                    error={getError(
                      `accidentDetails.${index}.nonManagedSeverelyInjuredVictims`,
                    )}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <p>5. Thiệt hại do tai nạn lao động số {index + 1}</p>
                <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2 lg:grid-cols-4">
                  <FloatingInput
                    {...register(`accidentDetails.${index}.medicalExpense`, {
                      setValueAs: parseThousands,
                    })}
                    formatThousands
                    label="Chi phí y tế"
                    required
                    placeholder="Nhập chi phí y tế"
                    error={getError(`accidentDetails.${index}.medicalExpense`)}
                  />
                  <FloatingInput
                    {...register(
                      `accidentDetails.${index}.salaryExpenseDuringTreatment`,
                      {
                        setValueAs: parseThousands,
                      },
                    )}
                    formatThousands
                    label="Chi phí trả lương trong thời gian điều trị"
                    required
                    placeholder="Nhập chi phí trả lương trong thời gian điều trị"
                    error={getError(
                      `accidentDetails.${index}.salaryExpenseDuringTreatment`,
                    )}
                  />
                  <FloatingInput
                    {...register(
                      `accidentDetails.${index}.compensationExpense`,
                      {
                        setValueAs: parseThousands,
                      },
                    )}
                    formatThousands
                    label="Chi phí bồi thường trợ cấp  "
                    placeholder="Nhập chi phí bồi thường trợ cấp"
                    error={getError(
                      `accidentDetails.${index}.compensationExpense`,
                    )}
                  />

                  <FloatingInput
                    label="Tổng số tiền chi phí"
                    type="text"
                    required
                    value={new Intl.NumberFormat("vi-VN").format(totalExpense)}
                    disabled
                  />
                </div>

                <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2 lg:grid-cols-4">
                  <FloatingInput
                    {...register(`accidentDetails.${index}.totalDaysOff`, {
                      setValueAs: (value: string) =>
                        value === "" ? null : Number(value),
                    })}
                    type="number"
                    min={0}
                    label="Tổng số ngày nghỉ vì TNLĐ"
                    required
                    placeholder="Nhập tổng số ngày nghỉ vì TNLĐ"
                    error={getError(`accidentDetails.${index}.totalDaysOff`)}
                  />

                  <FloatingInput
                    {...register(
                      `accidentDetails.${index}.propertyDamageExpense`,
                      {
                        setValueAs: parseThousands,
                      },
                    )}
                    formatThousands
                    label="Thiệt hại tài sản"
                    placeholder="Nhập thiệt hại tài sản"
                    error={getError(
                      `accidentDetails.${index}.propertyDamageExpense`,
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default AccidentDetailsStep;
