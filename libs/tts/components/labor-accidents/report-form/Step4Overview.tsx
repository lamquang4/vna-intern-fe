// libs/tts/components/labor-accidents/report-form/Step4Overview.tsx
'use client';

import React, { useMemo, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  LaborAccidentReportFormValues,
  MasterAccidentCategoryDto,
} from '@/libs/shared/tts/models/labor-accident.model';
import {
  buildOverviewMatrixRows,
  calculateGrandTotalDamage,
} from '@/libs/tts/utils/laborAccidentCalculator';

interface Step4OverviewProps {
  categories: MasterAccidentCategoryDto[];
  isReadOnly?: boolean;
  onUploadPdf?: (file: File) => Promise<{ url: string; name: string }>;
}

export const Step4Overview: React.FC<Step4OverviewProps> = ({
  categories,
  isReadOnly = false,
  onUploadPdf,
}) => {
  const { watch, setValue } = useFormContext<LaborAccidentReportFormValues>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formValues = watch();
  const matrixRows = useMemo(
    () => buildOverviewMatrixRows(formValues, categories),
    [formValues, categories]
  );
  const totalDamage = useMemo(() => calculateGrandTotalDamage(formValues), [formValues]);

  const periodLabel = formValues.reportPeriod === 'SIX_MONTHS' ? '6 tháng' : 'Cả năm';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (onUploadPdf) {
      const uploaded = await onUploadPdf(file);
      setValue('attachmentUrl', uploaded.url, { shouldDirty: true });
      setValue('attachmentName', uploaded.name, { shouldDirty: true });
    } else {
      setValue('attachmentUrl', URL.createObjectURL(file), { shouldDirty: true });
      setValue('attachmentName', file.name, { shouldDirty: true });
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN').format(Number(val) || 0);

  return (
    <div className="print-report space-y-5 print:space-y-2 print:p-0">
      {/* HEADER KHI IN (Chuẩn Phụ lục XII Nghị định 39/2016/NĐ-CP dành cho Doanh nghiệp) */}
      <header className="hidden print:block print-report-header mb-3">
        <div className="text-center text-[11px] leading-snug">
          <p className="font-bold">PHỤ LỤC XII</p>
          <p className="mt-0.5 font-bold uppercase">
            MẪU BÁO CÁO TỔNG HỢP TÌNH HÌNH TAI NẠN LAO ĐỘNG CỦA NGƯỜI SỬ DỤNG LAO ĐỘNG
          </p>
          <p className="italic text-[10px]">
            (Kèm theo Nghị định số 39/2016/NĐ-CP ngày 15 tháng 5 năm 2016 của Chính phủ)
          </p>
        </div>

        <div className="mt-3 flex justify-between text-[11px]">
          <p>
            <span className="font-semibold">Đơn vị báo cáo:</span>{' '}
            {formValues.companyInfo.companyName || '........................................'}
          </p>
          <p>
            <span className="font-semibold">Ngành nghề sản xuất kinh doanh:</span>{' '}
            {formValues.companyInfo.businessSector || '........................'}
          </p>
        </div>

        <div className="mt-3 text-center text-[12px] leading-snug">
          <p className="font-bold uppercase">BÁO CÁO TỔNG HỢP TÌNH HÌNH TAI NẠN LAO ĐỘNG</p>
          <p className="font-semibold uppercase text-[11px]">
            KỲ BÁO CÁO: {periodLabel.toUpperCase()} NĂM {formValues.reportYear}
          </p>
          <p className="mt-1 text-[10px] italic">
            Ngày báo cáo: Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm{' '}
            {new Date().getFullYear()}
          </p>
        </div>

        <div className="mt-2 text-[11px] leading-snug">
          <p>
            <span className="font-semibold">Kính gửi:</span> Sở Lao động - Thương binh và Xã hội
            Thành phố Hồ Chí Minh
          </p>
          <p className="font-bold mt-2">I. Thông tin chung về tai nạn lao động</p>
        </div>
      </header>

      {/* KHỐI TIÊU ĐỀ & ĐÍNH KÈM FILE TRÊN WEB (Ẩn khi in) */}
      <div className="space-y-3 rounded-md border border-border bg-background p-4 print:hidden">
        <h3 className="text-base font-semibold text-foreground">
          Báo cáo tổng hợp tình hình tai nạn lao động - Kỳ báo cáo: {periodLabel} năm{' '}
          {formValues.reportYear}
        </h3>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="text-warning">
            **Vui lòng đính kèm báo cáo TNLĐ có dấu mộc công ty:{' '}
            {!isReadOnly && (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="ml-1 font-medium text-primary underline"
                >
                  Tại đây
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </>
            )}
          </span>

          {formValues.attachmentName && (
            <a
              href={formValues.attachmentUrl || '#'}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline"
            >
              {formValues.attachmentName}
            </a>
          )}
        </div>
      </div>

      {/* BẢNG I & BẢNG II: Thêm print:overflow-visible và print:border-0 */}
      <div className="report-table-container overflow-x-auto print:overflow-visible rounded-md border border-border print:border-0">
        <table className="w-full min-w-[1100px] print:min-w-0 border-collapse text-[11px] text-foreground">
          <thead className="bg-muted text-center font-semibold text-foreground">
            <tr>
              <th
                rowSpan={4}
                className="min-w-[260px] print:min-w-[220px] border border-border px-3 py-2 text-left"
              >
                Tên chỉ tiêu thống kê
              </th>
              <th rowSpan={4} className="w-12 border border-border px-2 py-2">
                Mã số
              </th>
              <th colSpan={11} className="border border-border px-2 py-1.5">
                Phân loại TNLĐ theo mức độ thương tật
              </th>
            </tr>
            <tr>
              <th colSpan={3} className="border border-border px-2 py-1.5">
                Số vụ (Vụ)
              </th>
              <th colSpan={8} className="border border-border px-2 py-1.5">
                Số người bị nạn (Người)
              </th>
            </tr>
            <tr>
              <th rowSpan={2} className="w-12 border border-border px-1.5 py-1">
                Tổng số
              </th>
              <th rowSpan={2} className="w-14 border border-border px-1.5 py-1">
                Số vụ có người chết
              </th>
              <th rowSpan={2} className="w-16 border border-border px-1.5 py-1">
                Số vụ có từ 2 người bị nạn trở lên
              </th>
              <th colSpan={2} className="border border-border px-1.5 py-1">
                Tổng số
              </th>
              <th colSpan={2} className="border border-gray-200 px-1.5 py-1">
                Số LĐ nữ
              </th>
              <th colSpan={2} className="border border-gray-200 px-1.5 py-1">
                Số người bị chết
              </th>
              <th colSpan={2} className="border border-gray-200 px-1.5 py-1">
                Số người bị thương nặng
              </th>
            </tr>
            <tr>
              <th className="w-12 border border-border px-1.5 py-1">Tổng số</th>
              <th className="w-16 border border-border px-1.5 py-1">
                NN không thuộc quyền quản lý
              </th>
              <th className="w-12 border border-border px-1.5 py-1">Tổng số</th>
              <th className="w-16 border border-border px-1.5 py-1">
                NN không thuộc quyền quản lý
              </th>
              <th className="w-12 border border-border px-1.5 py-1">Tổng số</th>
              <th className="w-16 border border-border px-1.5 py-1">
                NN không thuộc quyền quản lý
              </th>
              <th className="w-12 border border-border px-1.5 py-1">Tổng số</th>
              <th className="w-16 border border-border px-1.5 py-1">
                NN không thuộc quyền quản lý
              </th>
            </tr>
          </thead>

          <tbody>
            {matrixRows.map((row) => {
              if (row.rowType === 'SECTION_HEADER') {
                return (
                  <tr key={row.key} className="bg-white font-bold text-gray-900">
                    <td colSpan={13} className="border border-border bg-muted px-3 py-2 text-left">
                      {row.label}
                    </td>
                  </tr>
                );
              }

              if (row.rowType === 'SUB_HEADER') {
                return (
                  <tr key={row.key} className="bg-white text-gray-700">
                    <td
                      colSpan={13}
                      className="border border-border px-3 py-2 text-left text-muted-foreground"
                    >
                      {row.label}
                    </td>
                  </tr>
                );
              }

              const isTotal = row.rowType === 'TOTAL_ROW';
              return (
                <tr
                  key={row.key}
                  className={`border-b border-border text-center ${
                    isTotal ? 'bg-muted font-semibold' : 'hover:bg-muted/50'
                  }`}
                >
                  <td className="border border-gray-200 px-3 py-2 text-left">{row.label}</td>
                  <td className="border border-gray-200 px-2 py-2">{row.code || ''}</td>
                  <td className="border border-gray-200 px-1.5 py-2">{row.totalCases}</td>
                  <td className="border border-gray-200 px-1.5 py-2">{row.fatalCases}</td>
                  <td className="border border-gray-200 px-1.5 py-2">{row.multipleVictimCases}</td>
                  <td className="border border-gray-200 px-1.5 py-2">{row.totalVictims}</td>
                  <td className="border border-gray-200 px-1.5 py-2">{row.unmanagedVictims}</td>
                  <td className="border border-gray-200 px-1.5 py-2">{row.femaleVictims}</td>
                  <td className="border border-gray-200 px-1.5 py-2">
                    {row.unmanagedFemaleVictims}
                  </td>
                  <td className="border border-gray-200 px-1.5 py-2">{row.fatalVictims}</td>
                  <td className="border border-gray-200 px-1.5 py-2">
                    {row.unmanagedFatalVictims}
                  </td>
                  <td className="border border-gray-200 px-1.5 py-2">
                    {row.severelyInjuredVictims}
                  </td>
                  <td className="border border-gray-200 px-1.5 py-2">
                    {row.unmanagedSeverelyInjured}
                  </td>
                </tr>
              );
            })}

            <tr className="bg-white font-bold text-gray-900">
              <td colSpan={13} className="border border-gray-200 px-3 py-2 text-left">
                II. Thiệt hại do tai nạn lao động
              </td>
            </tr>
          </tbody>
        </table>

        {/* BẢNG II: THIỆT HẠI DO TAI NẠN LAO ĐỘNG */}
        <table className="w-full border-collapse border border-t-0 border-gray-200 text-[11px] text-gray-800 text-center">
          <thead className="bg-gray-50 font-medium text-gray-600">
            <tr>
              <th rowSpan={3} className="border border-gray-200 px-3 py-2 w-[35%]">
                Tổng số ngày nghỉ vì tai nạn lao động (kể cả ngày nghỉ chế độ )
              </th>
              <th colSpan={4} className="border border-gray-200 px-2 py-1.5">
                Chi phí do TNLĐ (1.000đ)
              </th>
              <th rowSpan={3} className="border border-gray-200 px-3 py-2 w-[15%]">
                Thiệt hại tài sản
                <br />
                (1.000đ)
              </th>
            </tr>
            <tr>
              <th rowSpan={2} className="border border-gray-200 px-2 py-1.5">
                Tổng số
              </th>
              <th colSpan={3} className="border border-gray-200 px-2 py-1.5">
                Khoản chi cụ thể của cơ sở
              </th>
            </tr>
            <tr>
              <th className="border border-gray-200 px-2 py-1.5">Y tế</th>
              <th className="border border-gray-200 px-2 py-1.5">
                Trả lương trong thời gian điều trị
              </th>
              <th className="border border-gray-200 px-2 py-1.5">Bồi thường trợ cấp</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-200 px-3 py-2.5">{totalDamage.totalLeaveDays}</td>
              <td className="border border-gray-200 px-3 py-2.5">
                {formatCurrency(totalDamage.totalCost)}
              </td>
              <td className="border border-gray-200 px-3 py-2.5">
                {formatCurrency(totalDamage.medicalCost)}
              </td>
              <td className="border border-gray-200 px-3 py-2.5">
                {formatCurrency(totalDamage.treatmentSalaryCost)}
              </td>
              <td className="border border-gray-200 px-3 py-2.5">
                {formatCurrency(totalDamage.compensationCost)}
              </td>
              <td className="border border-gray-200 px-3 py-2.5">
                {formatCurrency(totalDamage.propertyDamageCost)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* CHỮ KÝ CUỐI TRANG */}
      <footer className="hidden print:grid print-signature">
        <div>
          <p className="font-semibold uppercase">NGƯỜI LẬP BÁO CÁO</p>
          <p className="text-xs italic">(Ký, ghi rõ họ tên)</p>
        </div>
        <div>
          <p className="font-semibold uppercase">NGƯỜI SỬ DỤNG LAO ĐỘNG</p>
          <p className="text-xs italic">(Ký, ghi rõ họ tên, chức vụ và đóng dấu)</p>
          <div className="print-stamp-space" />
        </div>
      </footer>
    </div>
  );
};