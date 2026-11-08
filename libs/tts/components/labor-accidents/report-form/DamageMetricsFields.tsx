// libs/tts/components/labor-accidents/report-form/DamageMetricsFields.tsx
'use client';

import React, { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { LaborAccidentReportFormValues } from '@/libs/shared/tts/models/labor-accident.model';
import { FormattedNumberInput } from './FormattedNumberInput';

interface DamageMetricsFieldsProps {
  fieldPrefix:
    | 'generalAccidents.summary'
    | `generalAccidents.details.${number}`
    | 'article39Accidents';
  title?: string;
  disabled?: boolean;
}

export const DamageMetricsFields: React.FC<DamageMetricsFieldsProps> = ({
  fieldPrefix,
  title = '2. Thiệt hại do tai nạn lao động',
  disabled = false,
}) => {
  const { control, setValue } = useFormContext<LaborAccidentReportFormValues>();

  const [medicalCost, treatmentSalaryCost, compensationCost] = useWatch({
    control,
    name: [
      `${fieldPrefix}.medicalCost`,
      `${fieldPrefix}.treatmentSalaryCost`,
      `${fieldPrefix}.compensationCost`,
    ],
  });

  useEffect(() => {
    const total =
      (Number(medicalCost) || 0) +
      (Number(treatmentSalaryCost) || 0) +
      (Number(compensationCost) || 0);
    setValue(`${fieldPrefix}.totalCost`, total, { shouldValidate: true });
  }, [medicalCost, treatmentSalaryCost, compensationCost, fieldPrefix, setValue]);

  return (
    <div className="mt-6 space-y-4 border-t border-border pt-5">
      <h4 className="text-base font-semibold text-foreground">{title}</h4>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="relative">
          <label className="mb-1 block text-sm text-foreground">
            Chi phí y tế <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <FormattedNumberInput<LaborAccidentReportFormValues>
              name={`${fieldPrefix}.medicalCost`}
              disabled={disabled}
              className="pr-16"
            />
            <span className="absolute right-3 text-xs text-muted-foreground">(1.000đ)</span>
          </div>
        </div>

        <div className="relative">
          <label className="mb-1 block text-sm text-foreground">
            Chi phí trả lương trong thời gian điều trị <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <FormattedNumberInput<LaborAccidentReportFormValues>
              name={`${fieldPrefix}.treatmentSalaryCost`}
              disabled={disabled}
              className="pr-16"
            />
            <span className="absolute right-3 text-xs text-muted-foreground">(1.000đ)</span>
          </div>
        </div>

        <div className="relative">
          <label className="mb-1 block text-sm text-foreground">
            Chi phí bồi thường trợ cấp <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <FormattedNumberInput<LaborAccidentReportFormValues>
              name={`${fieldPrefix}.compensationCost`}
              disabled={disabled}
              className="pr-16"
            />
            <span className="absolute right-3 text-xs text-muted-foreground">(1.000đ)</span>
          </div>
        </div>

        <div className="relative">
          <label className="mb-1 block text-sm text-muted-foreground">
            Tổng số tiền chi phí <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <FormattedNumberInput<LaborAccidentReportFormValues>
              name={`${fieldPrefix}.totalCost`}
              disabled
              className="cursor-not-allowed bg-muted pr-16 text-muted-foreground"
            />
            <span className="absolute right-3 text-xs text-muted-foreground">(1.000đ)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm text-foreground">
            Tổng số ngày nghỉ vì TNLĐ <span className="text-red-500">*</span>
          </label>
          <FormattedNumberInput<LaborAccidentReportFormValues>
            name={`${fieldPrefix}.totalLeaveDays`}
            disabled={disabled}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-foreground">Thiệt hại tài sản</label>
          <div className="relative flex items-center">
            <FormattedNumberInput<LaborAccidentReportFormValues>
              name={`${fieldPrefix}.propertyDamageCost`}
              disabled={disabled}
              className="pr-16"
            />
            <span className="absolute right-3 text-xs text-muted-foreground">(1.000đ)</span>
          </div>
        </div>
      </div>
    </div>
  );
};