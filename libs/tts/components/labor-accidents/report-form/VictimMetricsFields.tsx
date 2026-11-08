// libs/tts/components/labor-accidents/report-form/VictimMetricsFields.tsx
'use client';

import React from 'react';
import { LaborAccidentReportFormValues } from '@/libs/shared/tts/models/labor-accident.model';
import { FormattedNumberInput } from './FormattedNumberInput';

interface VictimMetricsFieldsProps {
  fieldPrefix:
    | 'generalAccidents.summary'
    | `generalAccidents.details.${number}`
    | 'article39Accidents';
  disabled?: boolean;
}

const VICTIM_FIELDS = [
  { key: 'totalVictims', label: 'Tổng số người bị nạn' },
  { key: 'femaleVictims', label: 'Tổng số lao động nữ bị nạn' },
  { key: 'fatalVictims', label: 'Tổng số người bị chết' },
  { key: 'severelyInjuredVictims', label: 'Tổng số người bị thương nặng' },
  { key: 'unmanagedVictims', label: 'Số người bị nạn không QL' },
  { key: 'unmanagedFemaleVictims', label: 'Lao động nữ bị nạn không QL' },
  { key: 'unmanagedFatalVictims', label: 'Số người chết không QL' },
  { key: 'unmanagedSeverelyInjured', label: 'Người bị thương nặng không QL' },
] as const;

export const VictimMetricsFields: React.FC<VictimMetricsFieldsProps> = ({
  fieldPrefix,
  disabled = false,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {VICTIM_FIELDS.map((field) => (
        <div key={field.key}>
          <label className="mb-1 block text-sm text-foreground">
            {field.label} <span className="text-red-500">*</span>
          </label>
          <FormattedNumberInput<LaborAccidentReportFormValues>
            name={`${fieldPrefix}.${field.key}`}
            disabled={disabled}
          />
        </div>
      ))}
    </div>
  );
};