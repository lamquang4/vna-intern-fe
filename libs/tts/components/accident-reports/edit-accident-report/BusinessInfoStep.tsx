"use client";
import { useFormContext, useFormState, type FieldPath } from "react-hook-form";
import { FloatingInput } from "@/libs/core/components/ui/fields/FloatingInput";
import { parseThousands } from "@/libs/core/utils/formatters";
import type { UpdateAccidentReportFormValues } from "@/libs/shared/tts/schemas/accident-report.schema";

interface Props {
  companyName?: string;
  businessTypeName?: string;
  businessIndustryName?: string;
}

const employeeFieldDeps: FieldPath<UpdateAccidentReportFormValues>[] = [
  "totalEmployees",
  "femaleEmployees",
];

function BusinessInfoStep({
  companyName = "",
  businessTypeName = "",
  businessIndustryName = "",
}: Props) {
  const { control, register, getFieldState, trigger } =
    useFormContext<UpdateAccidentReportFormValues>();
  const formState = useFormState({ control });
  const getError = (name: FieldPath<UpdateAccidentReportFormValues>) =>
    getFieldState(name, formState).error?.message;

  const registerEmployeeField = (
    name: "totalEmployees" | "femaleEmployees",
  ) => {
    const field = register(name, {
      setValueAs: (value: string) => (value === "" ? null : Number(value)),
    });

    return {
      ...field,
      onBlur: async (event: Parameters<typeof field.onBlur>[0]) => {
        await field.onBlur(event);
        await trigger(employeeFieldDeps);
      },
    };
  };

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="flex flex-col gap-2">
        <h5>1. Thông tin công ty</h5>
        <p className="text-error">
          Lưu ý: nhập tổng quỹ lương 6 tháng khi khai báo TNLĐ 6 tháng hoặc tổng
          quỹ lương 12 tháng khi khai báo TNLĐ cả năm.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2 lg:grid-cols-3">
        <FloatingInput
          label="Tên công ty"
          type="text"
          value={companyName}
          disabled
        />

        <FloatingInput
          label="Loại hình kinh doanh"
          type="text"
          value={businessTypeName}
          disabled
        />

        <FloatingInput
          label="Ngành nghề kinh doanh"
          type="text"
          value={businessIndustryName}
          disabled
        />
      </div>

      <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2 lg:grid-cols-3">
        <FloatingInput
          {...registerEmployeeField("totalEmployees")}
          type="number"
          min={0}
          required
          label="Tổng số lao động của cơ sở"
          placeholder="Nhập tổng số lao động của cơ sở"
          error={getError("totalEmployees")}
        />
        <FloatingInput
          {...registerEmployeeField("femaleEmployees")}
          type="number"
          min={0}
          required
          label="Tổng số lao động nữ"
          placeholder="Nhập tổng số lao động nữ"
          error={getError("femaleEmployees")}
        />
        <FloatingInput
          {...register("totalSalaryFund", {
            setValueAs: parseThousands,
          })}
          formatThousands
          required
          label="Tổng quỹ lương (1.000đ)"
          placeholder="Nhập tổng quỹ lương"
          error={getError("totalSalaryFund")}
        />
      </div>
    </div>
  );
}

export default BusinessInfoStep;
