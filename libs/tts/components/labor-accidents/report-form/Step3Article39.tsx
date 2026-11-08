// libs/tts/components/labor-accidents/report-form/Step3Article39.tsx
'use client';

import React from 'react';
import { LaborAccidentReportFormValues } from '@/libs/shared/tts/models/labor-accident.model';
import { VictimMetricsFields } from './VictimMetricsFields';
import { DamageMetricsFields } from './DamageMetricsFields';
import { FormattedNumberInput } from './FormattedNumberInput';

export const Step3Article39: React.FC<{ disabled?: boolean }> = ({ disabled = false }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="border-b border-border pb-3 text-base font-semibold text-foreground">
          1. Tổng số vụ tai nạn lao động & số nạn nhân tai nạn lao động
        </h4>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm text-foreground">
              Tổng số vụ <span className="text-red-500">*</span>
            </label>
            <FormattedNumberInput<LaborAccidentReportFormValues>
              name="article39Accidents.totalCases"
              disabled={disabled}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-foreground">
              Tổng số vụ có người chết <span className="text-red-500">*</span>
            </label>
            <FormattedNumberInput<LaborAccidentReportFormValues>
              name="article39Accidents.fatalCases"
              disabled={disabled}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-foreground">
              Tổng số vụ có 2 người bị nạn trở lên <span className="text-red-500">*</span>
            </label>
            <FormattedNumberInput<LaborAccidentReportFormValues>
              name="article39Accidents.multipleVictimCases"
              disabled={disabled}
            />
          </div>
        </div>

        <VictimMetricsFields fieldPrefix="article39Accidents" disabled={disabled} />
      </div>

      <DamageMetricsFields
        fieldPrefix="article39Accidents"
        title="2. Thiệt hại do tai nạn lao động"
        disabled={disabled}
      />
    </div>
  );
};