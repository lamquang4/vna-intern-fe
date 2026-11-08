// libs/tts/components/labor-accidents/report-form/Step1CompanyInfo.tsx
'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { LaborAccidentReportFormValues } from '@/libs/shared/tts/models/labor-accident.model';
import { FormattedNumberInput } from './FormattedNumberInput';

interface Step1CompanyInfoProps {
  disabled?: boolean;
}

export const Step1CompanyInfo: React.FC<Step1CompanyInfoProps> = ({
  disabled = false,
}) => {
  const { register } = useFormContext<LaborAccidentReportFormValues>();

  return (
    <div className="space-y-6">
      <h4 className="border-b border-border pb-3 text-base font-semibold text-foreground">1. Thông tin công ty</h4>
      <p className="rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm font-medium text-warning">
        *** Lưu ý: nhập tổng quỹ lương 6 tháng khi khai báo TNLĐ 6 tháng hoặc tổng quỹ lương 12 tháng
        khi khai báo TNLĐ cả năm
      </p>

      <div className="grid grid-cols-1 gap-5 rounded-md border border-border bg-muted/30 p-5 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm text-muted-foreground">Tên công ty</label>
          <input
            type="text"
            disabled
            {...register('companyInfo.companyName')}
            className="h-10 w-full rounded-md border border-border bg-muted px-3 text-sm text-muted-foreground"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted-foreground">Loại hình công ty</label>
          <input
            type="text"
            disabled
            {...register('companyInfo.companyType')}
            className="h-10 w-full rounded-md border border-border bg-muted px-3 text-sm text-muted-foreground"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted-foreground">Ngành nghề kinh doanh</label>
          <input
            type="text"
            disabled
            {...register('companyInfo.businessSector')}
            className="h-10 w-full rounded-md border border-border bg-muted px-3 text-sm text-muted-foreground"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm text-foreground">
            Tổng số lao động của cơ sở <span className="text-red-500">*</span>
          </label>
          <FormattedNumberInput<LaborAccidentReportFormValues>
            name="companyInfo.totalEmployees"
            disabled={disabled}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-foreground">
            Tổng số lao động nữ <span className="text-red-500">*</span>
          </label>
          <FormattedNumberInput<LaborAccidentReportFormValues>
            name="companyInfo.totalFemaleEmployees"
            disabled={disabled}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-foreground">
            Tổng quỹ lương <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <FormattedNumberInput<LaborAccidentReportFormValues>
              name="companyInfo.totalWageFund"
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