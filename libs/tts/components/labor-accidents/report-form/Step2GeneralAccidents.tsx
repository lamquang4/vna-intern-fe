// libs/tts/components/labor-accidents/report-form/Step2GeneralAccidents.tsx
'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useFormContext, UseFieldArrayReturn } from 'react-hook-form';
import {
  GeneralAccidentSubTab,
  LaborAccidentReportFormValues,
  MasterAccidentCategoryDto,
} from '@/libs/shared/tts/models/labor-accident.model';
import { VictimMetricsFields } from './VictimMetricsFields';
import { DamageMetricsFields } from './DamageMetricsFields';
import { FormattedNumberInput } from './FormattedNumberInput';

interface Step2Props {
  activeSubTab: GeneralAccidentSubTab;
  onChangeSubTab: (tab: GeneralAccidentSubTab) => void;
  fieldArray: UseFieldArrayReturn<LaborAccidentReportFormValues, 'generalAccidents.details'>;
  categories: MasterAccidentCategoryDto[];
  disabled?: boolean;
}

export const Step2GeneralAccidents: React.FC<Step2Props> = ({
  activeSubTab,
  onChangeSubTab,
  fieldArray,
  categories,
  disabled = false,
}) => {
  const { register, formState: { errors } } = useFormContext<LaborAccidentReportFormValues>();
  const [openAccordions, setOpenAccordions] = useState<Record<number, boolean>>({ 0: true });

  const causeOptions = categories.filter((c) => c.type === 'CAUSE');
  const injuryOptions = categories.filter((c) => c.type === 'INJURY_FACTOR');
  const occupationOptions = categories.filter((c) => c.type === 'OCCUPATION');

  const toggleAccordion = (index: number) => {
    setOpenAccordions((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="space-y-5">
      {/* Thanh chuyển Tab (1) và Tab (2) */}
      <div className="flex gap-6 border-b border-border">
        <button
          type="button"
          onClick={() => onChangeSubTab('SUMMARY')}
          className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
            activeSubTab === 'SUMMARY'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          (1) Tổng số vụ tai nạn lao động
        </button>
        <button
          type="button"
          onClick={() => onChangeSubTab('DETAILS')}
          className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
            activeSubTab === 'DETAILS'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          (2) Chi tiết các vụ tai nạn lao động
        </button>
      </div>

      <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
        **** Doanh nghiệp xảy ra tai nạn lao động vui lòng nhập theo từng bước
      </p>

      {/* TAB 1: MÀN 26.2 */}
      {activeSubTab === 'SUMMARY' && (
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-foreground">
              1. Tổng số vụ tai nạn lao động & số nạn nhân tai nạn lao động
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <label className="mb-1 block text-sm text-foreground">
                  Tổng số vụ <span className="text-red-500">*</span>
                </label>
                <FormattedNumberInput<LaborAccidentReportFormValues>
                  name="generalAccidents.summary.totalCases"
                  disabled={disabled}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-foreground">
                  Tổng số vụ có người chết <span className="text-red-500">*</span>
                </label>
                <FormattedNumberInput<LaborAccidentReportFormValues>
                  name="generalAccidents.summary.fatalCases"
                  disabled={disabled}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-foreground">
                  Tổng số vụ có 2 người bị nạn trở lên <span className="text-red-500">*</span>
                </label>
                <FormattedNumberInput<LaborAccidentReportFormValues>
                  name="generalAccidents.summary.multipleVictimCases"
                  disabled={disabled}
                />
              </div>
            </div>

            <VictimMetricsFields fieldPrefix="generalAccidents.summary" disabled={disabled} />
          </div>

          <DamageMetricsFields
            fieldPrefix="generalAccidents.summary"
            title="2. Thiệt hại do tai nạn lao động"
            disabled={disabled}
          />
        </div>
      )}

      {/* TAB 2: MÀN 26.3 */}
      {activeSubTab === 'DETAILS' && (
        <div className="space-y-6">
          {fieldArray.fields.length === 0 ? (
            <div className="rounded-md border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm italic text-muted-foreground">
              Không có vụ tai nạn lao động nào (Tổng số vụ ở bước 1 đang bằng 0).
            </div>
          ) : (
            fieldArray.fields.map((field, index) => {
              const isOpen = openAccordions[index] ?? true;
              return (
                <div key={field.id} className="rounded-md border border-border bg-background">
                  <button
                    type="button"
                    onClick={() => toggleAccordion(index)}
                    className="flex w-full items-center gap-2 rounded-md px-4 py-3 text-left text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    <span>Chi tiết vụ tai nạn số {index + 1}</span>
                  </button>

                  {isOpen && (
                    <div className="space-y-5 border-t border-border p-4">
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-foreground">
                            1. Phân theo nguyên nhân xảy ra TNLĐ
                          </label>
                          <select
                            disabled={disabled}
                            {...register(`generalAccidents.details.${index}.causeCategoryId`)}
                            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
                          >
                            <option value="">-- Chọn nguyên nhân --</option>
                            {causeOptions.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                          {errors.generalAccidents?.details?.[index]?.causeCategoryId?.message && (
                            <p className="mt-1 text-xs text-error">
                              {errors.generalAccidents.details[index]?.causeCategoryId?.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-foreground">
                            2. Phân theo yếu tố gây chấn thương
                          </label>
                          <select
                            disabled={disabled}
                            {...register(`generalAccidents.details.${index}.injuryFactorCategoryId`)}
                            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
                          >
                            <option value="">-- Chọn yếu tố gây chấn thương --</option>
                            {injuryOptions.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                          {errors.generalAccidents?.details?.[index]?.injuryFactorCategoryId?.message && (
                            <p className="mt-1 text-xs text-error">
                              {errors.generalAccidents.details[index]?.injuryFactorCategoryId?.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-foreground">
                            3. Phân theo nghề nghiệp
                          </label>
                          <select
                            disabled={disabled}
                            {...register(`generalAccidents.details.${index}.occupationCategoryId`)}
                            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
                          >
                            <option value="">-- Chọn nghề nghiệp --</option>
                            {occupationOptions.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                          {errors.generalAccidents?.details?.[index]?.occupationCategoryId?.message && (
                            <p className="mt-1 text-xs text-error">
                              {errors.generalAccidents.details[index]?.occupationCategoryId?.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-2">
                        <h5 className="mb-3 text-sm font-medium text-foreground">
                          4. Chi tiết vụ tai nạn số {index + 1}
                        </h5>
                        <VictimMetricsFields
                          fieldPrefix={`generalAccidents.details.${index}`}
                          disabled={disabled}
                        />
                      </div>

                      <DamageMetricsFields
                        fieldPrefix={`generalAccidents.details.${index}`}
                        title={`5. Thiệt hại do tai nạn lao động số ${index + 1}`}
                        disabled={disabled}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};