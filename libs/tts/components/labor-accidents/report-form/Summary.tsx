// libs/tts/components/labor-accidents/LaborAccidentSummary.tsx
'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import ListLayout from '@/libs/tts/components/layout/ListLayout';
import { laborAccidentApis } from '@/libs/tts/services/apis/laborAccidentApis';

const YEARS = [2026, 2025, 2024, 2023, 2022];

const DEFAULT_BUSINESS_TYPES = [
  'Doanh nghiệp nhà nước',
  'Công ty trách nhiệm hữu hạn',
  'Công ty cổ phần',
  'Công ty hợp danh',
  'Doanh nghiệp tư nhân',
  'Doanh nghiệp có vốn đầu tư nước ngoài',
  'Đơn vị kinh tế tập thể',
  'Đơn vị kinh tế cá thể',
  'Đơn vị hành chính sự nghiệp, đảng, đoàn thể, hiệp hội',
];

interface SummaryRowItem {
  name?: string;
  label?: string;
  code?: string;
  // Các trường Bảng I
  totalFacilities?: number;
  participatingFacilities?: number;
  totalWorkers?: number;
  participatingWorkers?: number;
  femaleWorkers?: number;
  kTnld?: number | string;
  kChet?: number | string;
  note?: string | number;
  // Các trường Bảng I & II
  totalCases?: number;
  fatalCases?: number;
  totalFatalCases?: number;
  multipleVictimCases?: number;
  totalMultipleVictimCases?: number;
  totalVictims?: number;
  femaleVictims?: number;
  totalFemaleVictims?: number;
  fatalVictims?: number;
  totalFatalVictims?: number;
  severelyInjuredVictims?: number;
  totalSeverelyInjuredVictims?: number;
  // Các trường chi phí & ngày nghỉ Bảng II
  totalLeaveDays?: number;
  leaveDays?: number;
  totalCost?: number;
  medicalCost?: number;
  treatmentSalaryCost?: number;
  compensationCost?: number;
  propertyDamageCost?: number;
}

const formatNumber = (val?: number | string) => {
  if (val === undefined || val === null || val === '') return 0;
  const num = Number(val);
  return Number.isNaN(num) ? val : new Intl.NumberFormat('vi-VN').format(num);
};

const LaborAccidentSummary: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryYear = Number(searchParams.get('year'));
  const year = YEARS.includes(queryYear) ? queryYear : YEARS[0];

  const { data, isLoading, isError } = useQuery({
    queryKey: ['labor-accident-summary', year],
    queryFn: () => laborAccidentApis.getOverallSummary(year),
  });

  const rawData = data as Record<string, any> | undefined;

  // Chuẩn bị dữ liệu cho Bảng I (Loại hình cơ sở)
  const businessTypeRows: SummaryRowItem[] = useMemo(() => {
    const list = (rawData?.businessTypes as SummaryRowItem[]) ?? [];
    if (list.length > 0) return list;
    return DEFAULT_BUSINESS_TYPES.map((name) => ({ name, code: '' }));
  }, [rawData]);

  // Tính dòng Tổng số cho Bảng I
  const totalSection1: SummaryRowItem = useMemo(() => {
    const t1 = rawData?.total1 ?? {};
    return {
      totalFacilities:
        t1.totalFacilities ??
        businessTypeRows.reduce((sum, r) => sum + (Number(r.totalFacilities) || 0), 0),
      participatingFacilities:
        t1.participatingFacilities ??
        businessTypeRows.reduce((sum, r) => sum + (Number(r.participatingFacilities) || 0), 0),
      totalWorkers:
        t1.totalWorkers ??
        businessTypeRows.reduce((sum, r) => sum + (Number(r.totalWorkers) || 0), 0),
      participatingWorkers:
        t1.participatingWorkers ??
        businessTypeRows.reduce((sum, r) => sum + (Number(r.participatingWorkers) || 0), 0),
      femaleWorkers:
        t1.femaleWorkers ??
        businessTypeRows.reduce((sum, r) => sum + (Number(r.femaleWorkers) || 0), 0),
      totalVictims:
        t1.totalVictims ??
        businessTypeRows.reduce((sum, r) => sum + (Number(r.totalVictims) || 0), 0),
      fatalVictims:
        t1.totalFatalVictims ??
        t1.fatalVictims ??
        businessTypeRows.reduce(
          (sum, r) => sum + (Number(r.totalFatalVictims ?? r.fatalVictims) || 0),
          0,
        ),
      severelyInjuredVictims:
        t1.totalSeverelyInjuredVictims ??
        t1.severelyInjuredVictims ??
        businessTypeRows.reduce(
          (sum, r) =>
            sum + (Number(r.totalSeverelyInjuredVictims ?? r.severelyInjuredVictims) || 0),
          0,
        ),
      kTnld: t1.kTnld ?? 0,
      kChet: t1.kChet ?? 0,
      note: t1.note ?? '',
    };
  }, [rawData, businessTypeRows]);

  // Chuẩn bị các nhóm phân loại cho Bảng II
  const classificationGroups = useMemo(() => {
    if (!rawData) return [];

    const groups: Array<{ groupLabel: string; rows: SummaryRowItem[] }> = [
      {
        groupLabel: 'Phân theo ngành nghề',
        rows: rawData.industries ?? rawData.businessSectors ?? rawData.businessTypes ?? [],
      },
      {
        groupLabel: 'Phân theo nguyên nhân',
        rows: rawData.accidentCauses ?? rawData.causes ?? rawData.injuryTypes ?? [],
      },
      {
        groupLabel: 'Phân theo yếu tố gây chấn thương',
        rows: rawData.injuryFactors ?? [],
      },
    ];

    if (Array.isArray(rawData.occupations) && rawData.occupations.length > 0) {
      groups.push({
        groupLabel: 'Phân theo nghề nghiệp',
        rows: rawData.occupations,
      });
    }

    return groups.filter((g) => g.rows.length > 0);
  }, [rawData]);

  const totalSection2: SummaryRowItem = useMemo(() => {
    return rawData?.total2 ?? rawData?.total1 ?? {};
  }, [rawData]);

  return (
    <ListLayout
      title="Báo cáo tổng hợp"
      actions={
        <div className="flex items-center gap-3">
          <select
            aria-label="Năm báo cáo tổng hợp"
            value={year}
            onChange={(event) =>
              router.replace(`/labor-accidents/summary?year=${event.target.value}`)
            }
            className="h-9 min-w-20 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
          >
            {YEARS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => window.print()}
            className="h-9 rounded-md border border-primary bg-white px-4 text-sm font-medium text-primary transition-colors hover:bg-muted"
          >
            In báo cáo
          </button>
          <button
            type="button"
            onClick={() => router.push(`/labor-accidents?year=${year}`)}
            className="h-9 rounded-md border border-border bg-white px-4 text-sm font-medium text-slate-500 transition-colors hover:bg-muted"
          >
            Huỷ bỏ
          </button>
        </div>
      }
    >
      {isLoading && (
        <div className="p-6 text-sm text-muted-foreground">Đang tải báo cáo tổng hợp...</div>
      )}

      {isError && (
        <div className="p-6 text-sm text-error">
          Không thể tải báo cáo tổng hợp. Vui lòng thử lại.
        </div>
      )}

      {data && (
        <div className="print-report space-y-6 bg-white p-4 print:space-y-4 print:p-0">
          {/* ==================== I. THÔNG TIN TỔNG QUAN ==================== */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-foreground">I. Thông tin tổng quan:</h3>

            <div className="report-table-container overflow-x-auto rounded-md border border-border print:overflow-visible">
              <table className="w-full min-w-[1100px] border-collapse text-[11px] text-foreground print:min-w-0">
                <thead className="bg-muted text-center font-medium text-slate-600">
                  <tr>
                    <th
                      rowSpan={3}
                      className="min-w-[220px] border border-gray-200 px-3 py-2 text-center"
                    >
                      Loại hình cơ sở
                    </th>
                    <th rowSpan={3} className="w-12 border border-gray-200 px-2 py-2">
                      Mã số
                    </th>
                    <th colSpan={2} className="border border-gray-200 px-2 py-1.5">
                      Cơ sở
                    </th>
                    <th colSpan={3} className="border border-gray-200 px-2 py-1.5">
                      Lực lượng lao động
                    </th>
                    <th colSpan={3} className="border border-gray-200 px-2 py-1.5">
                      Tổng số tai nạn lao động
                    </th>
                    <th colSpan={2} className="border border-gray-200 px-2 py-1.5">
                      Tần suất tai nạn lao động
                    </th>
                    <th rowSpan={3} className="min-w-[90px] border border-gray-200 px-2 py-2">
                      Ghi chú
                    </th>
                  </tr>
                  <tr>
                    <th rowSpan={2} className="w-16 border border-gray-200 px-2 py-1.5">
                      Tổng số
                    </th>
                    <th rowSpan={2} className="w-20 border border-gray-200 px-2 py-1.5">
                      Số cơ sở tham gia
                    </th>
                    <th rowSpan={2} className="w-20 border border-gray-200 px-2 py-1.5">
                      Tổng số lao động
                    </th>
                    <th rowSpan={2} className="w-24 border border-gray-200 px-2 py-1.5">
                      Số LĐ của cơ sở tham gia báo cáo
                    </th>
                    <th rowSpan={2} className="w-20 border border-gray-200 px-2 py-1.5">
                      Số lao động nữ
                    </th>
                    <th colSpan={3} className="border border-gray-200 px-2 py-1.5">
                      Số người bị TNLĐ
                    </th>
                    <th rowSpan={2} className="w-16 border border-gray-200 px-2 py-1.5">
                      KTNLĐ
                    </th>
                    <th rowSpan={2} className="w-16 border border-gray-200 px-2 py-1.5">
                      KChết
                    </th>
                  </tr>
                  <tr>
                    <th className="w-16 border border-gray-200 px-2 py-1.5">Tổng số</th>
                    <th className="w-16 border border-gray-200 px-2 py-1.5">Số người chết</th>
                    <th className="w-20 border border-gray-200 px-2 py-1.5">
                      Số người bị thương nặng
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr className="border-b border-gray-200 bg-white font-semibold text-gray-900">
                    <td className="border border-gray-200 px-3 py-2.5 text-left">Tổng số</td>
                    <td className="border border-gray-200 px-2 py-2.5 text-left"></td>
                    <td className="border border-gray-200 px-2 py-2.5 text-left">
                      {formatNumber(totalSection1.totalFacilities)}
                    </td>
                    <td className="border border-gray-200 px-2 py-2.5 text-left">
                      {formatNumber(totalSection1.participatingFacilities)}
                    </td>
                    <td className="border border-gray-200 px-2 py-2.5 text-left">
                      {formatNumber(totalSection1.totalWorkers)}
                    </td>
                    <td className="border border-gray-200 px-2 py-2.5 text-left">
                      {formatNumber(totalSection1.participatingWorkers)}
                    </td>
                    <td className="border border-gray-200 px-2 py-2.5 text-left">
                      {formatNumber(totalSection1.femaleWorkers)}
                    </td>
                    <td className="border border-gray-200 px-2 py-2.5 text-left">
                      {formatNumber(totalSection1.totalVictims)}
                    </td>
                    <td className="border border-gray-200 px-2 py-2.5 text-left">
                      {formatNumber(totalSection1.fatalVictims)}
                    </td>
                    <td className="border border-gray-200 px-2 py-2.5 text-left">
                      {formatNumber(totalSection1.severelyInjuredVictims)}
                    </td>
                    <td className="border border-gray-200 px-2 py-2.5 text-left">
                      {totalSection1.kTnld ?? 0}
                    </td>
                    <td className="border border-gray-200 px-2 py-2.5 text-left">
                      {totalSection1.kChet ?? 0}
                    </td>
                    <td className="border border-gray-200 px-2 py-2.5 text-left">
                      {totalSection1.note ?? ''}
                    </td>
                  </tr>

                  {businessTypeRows.map((row, idx) => (
                    <tr
                      key={`${row.code || idx}-${row.name || row.label}`}
                      className="border-b border-gray-200 hover:bg-muted/40"
                    >
                      <td className="border border-gray-200 px-3 py-2.5 text-left">
                        {row.name || row.label}
                      </td>
                      <td className="border border-gray-200 px-2 py-2.5 text-left">
                        {row.code || ''}
                      </td>
                      <td className="border border-gray-200 px-2 py-2.5 text-left">
                        {formatNumber(row.totalFacilities ?? row.totalCases)}
                      </td>
                      <td className="border border-gray-200 px-2 py-2.5 text-left">
                        {formatNumber(row.participatingFacilities)}
                      </td>
                      <td className="border border-gray-200 px-2 py-2.5 text-left">
                        {formatNumber(row.totalWorkers)}
                      </td>
                      <td className="border border-gray-200 px-2 py-2.5 text-left">
                        {formatNumber(row.participatingWorkers)}
                      </td>
                      <td className="border border-gray-200 px-2 py-2.5 text-left">
                        {formatNumber(row.femaleWorkers)}
                      </td>
                      <td className="border border-gray-200 px-2 py-2.5 text-left">
                        {formatNumber(row.totalVictims)}
                      </td>
                      <td className="border border-gray-200 px-2 py-2.5 text-left">
                        {formatNumber(row.totalFatalVictims ?? row.fatalVictims)}
                      </td>
                      <td className="border border-gray-200 px-2 py-2.5 text-left">
                        {formatNumber(
                          row.totalSeverelyInjuredVictims ?? row.severelyInjuredVictims,
                        )}
                      </td>
                      <td className="border border-gray-200 px-2 py-2.5 text-left">
                        {row.kTnld ?? 0}
                      </td>
                      <td className="border border-gray-200 px-2 py-2.5 text-left">
                        {row.kChet ?? 0}
                      </td>
                      <td className="border border-gray-200 px-2 py-2.5 text-left">
                        {row.note ?? ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ==================== II. PHÂN LOẠI TNLĐ ==================== */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-foreground">II. Phân loại TNLĐ:</h3>

            <div className="report-table-container overflow-x-auto rounded-md border border-border print:overflow-visible">
              <table className="w-full min-w-[1200px] border-collapse text-[11px] text-foreground print:min-w-0">
                <thead className="bg-muted text-center font-medium text-slate-600">
                  <tr>
                    <th
                      rowSpan={3}
                      className="min-w-[160px] border border-gray-200 px-3 py-2 text-center"
                    >
                      Tên chỉ tiêu thống kê
                    </th>
                    <th rowSpan={3} className="w-12 border border-gray-200 px-2 py-2">
                      Mã số
                    </th>
                    <th colSpan={7} className="border border-gray-200 px-2 py-1.5">
                      Phân loại TNLĐ theo mức độ thương tật
                    </th>
                    <th colSpan={6} className="border border-gray-200 px-2 py-1.5">
                      Theo mức độ thương tật
                    </th>
                  </tr>
                  <tr>
                    <th colSpan={3} className="border border-gray-200 px-2 py-1.5">
                      Số vụ TNLĐ
                    </th>
                    <th colSpan={4} className="border border-gray-200 px-2 py-1.5">
                      Số người bị nạn (Người)
                    </th>
                    <th rowSpan={2} className="w-16 border border-gray-200 px-1.5 py-1.5">
                      Tổng số ngày nghỉ vì TNLĐ
                    </th>
                    <th rowSpan={2} className="w-20 border border-gray-200 px-1.5 py-1.5">
                      Tổng số tiền
                    </th>
                    <th colSpan={3} className="border border-gray-200 px-2 py-1.5">
                      Tổng số ngày nghỉ vì TNLĐ
                    </th>
                    <th rowSpan={2} className="w-24 border border-gray-200 px-1.5 py-1.5">
                      Thiệt hại tài sản (1.000 đ)
                    </th>
                  </tr>
                  <tr>
                    <th className="w-14 border border-gray-200 px-1.5 py-1.5">Tổng số</th>
                    <th className="w-16 border border-gray-200 px-1.5 py-1.5">
                      Số vụ có người chết
                    </th>
                    <th className="w-20 border border-gray-200 px-1.5 py-1.5">
                      Số vụ có từ 2 người bị nạn trở lên
                    </th>
                    <th className="w-16 border border-gray-200 px-1.5 py-1.5">Tổng số</th>
                    <th className="w-16 border border-gray-200 px-1.5 py-1.5">Số LĐ nữ</th>
                    <th className="w-20 border border-gray-200 px-1.5 py-1.5">
                      Số người bị chết
                    </th>
                    <th className="w-24 border border-gray-200 px-1.5 py-1.5">
                      Số người bị thương nặng
                    </th>
                    <th className="w-16 border border-gray-200 px-1.5 py-1.5">Y Tế</th>
                    <th className="w-24 border border-gray-200 px-1.5 py-1.5">
                      Trả lương theo thời gian điều trị
                    </th>
                    <th className="w-24 border border-gray-200 px-1.5 py-1.5">
                      Bồi thường/ Trợ cấp
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr className="border-b border-gray-200 bg-white font-semibold text-gray-900">
                    <td className="border border-gray-200 px-3 py-2 text-left">Tổng số</td>
                    <td className="border border-gray-200 px-2 py-2 text-left"></td>
                    <td className="border border-gray-200 px-2 py-2 text-left">
                      {formatNumber(totalSection2.totalCases)}
                    </td>
                    <td className="border border-gray-200 px-2 py-2 text-left">
                      {formatNumber(totalSection2.totalFatalCases ?? totalSection2.fatalCases)}
                    </td>
                    <td className="border border-gray-200 px-2 py-2 text-left">
                      {formatNumber(
                        totalSection2.totalMultipleVictimCases ??
                          totalSection2.multipleVictimCases,
                      )}
                    </td>
                    <td className="border border-gray-200 px-2 py-2 text-left">
                      {formatNumber(totalSection2.totalVictims)}
                    </td>
                    <td className="border border-gray-200 px-2 py-2 text-left">
                      {formatNumber(
                        totalSection2.totalFemaleVictims ?? totalSection2.femaleVictims,
                      )}
                    </td>
                    <td className="border border-gray-200 px-2 py-2 text-left">
                      {formatNumber(totalSection2.totalFatalVictims ?? totalSection2.fatalVictims)}
                    </td>
                    <td className="border border-gray-200 px-2 py-2 text-left">
                      {formatNumber(
                        totalSection2.totalSeverelyInjuredVictims ??
                          totalSection2.severelyInjuredVictims,
                      )}
                    </td>
                    <td className="border border-gray-200 px-2 py-2 text-left">
                      {formatNumber(totalSection2.totalLeaveDays ?? totalSection2.leaveDays)}
                    </td>
                    <td className="border border-gray-200 px-2 py-2 text-left">
                      {formatNumber(totalSection2.totalCost)}
                    </td>
                    <td className="border border-gray-200 px-2 py-2 text-left">
                      {formatNumber(totalSection2.medicalCost)}
                    </td>
                    <td className="border border-gray-200 px-2 py-2 text-left">
                      {formatNumber(totalSection2.treatmentSalaryCost)}
                    </td>
                    <td className="border border-gray-200 px-2 py-2 text-left">
                      {formatNumber(totalSection2.compensationCost)}
                    </td>
                    <td className="border border-gray-200 px-2 py-2 text-left">
                      {formatNumber(totalSection2.propertyDamageCost)}
                    </td>
                  </tr>

                  {classificationGroups.map((group) =>
                    group.rows.map((row, index) => (
                      <tr
                        key={`${group.groupLabel}-${row.code || index}-${row.name || row.label}`}
                        className="border-b border-gray-200 hover:bg-muted/40"
                      >
                        {index === 0 && (
                          <td
                            rowSpan={group.rows.length}
                            className="border border-gray-200 bg-white px-3 py-2 text-left align-middle font-semibold text-gray-800"
                          >
                            {group.groupLabel}
                          </td>
                        )}
                        <td
                          title={row.name || row.label}
                          className="border border-gray-200 px-2 py-2 text-left"
                        >
                          {row.code || index + 1}
                        </td>
                        <td className="border border-gray-200 px-2 py-2 text-left">
                          {formatNumber(row.totalCases)}
                        </td>
                        <td className="border border-gray-200 px-2 py-2 text-left">
                          {formatNumber(row.totalFatalCases ?? row.fatalCases)}
                        </td>
                        <td className="border border-gray-200 px-2 py-2 text-left">
                          {formatNumber(row.totalMultipleVictimCases ?? row.multipleVictimCases)}
                        </td>
                        <td className="border border-gray-200 px-2 py-2 text-left">
                          {formatNumber(row.totalVictims)}
                        </td>
                        <td className="border border-gray-200 px-2 py-2 text-left">
                          {formatNumber(row.totalFemaleVictims ?? row.femaleVictims)}
                        </td>
                        <td className="border border-gray-200 px-2 py-2 text-left">
                          {formatNumber(row.totalFatalVictims ?? row.fatalVictims)}
                        </td>
                        <td className="border border-gray-200 px-2 py-2 text-left">
                          {formatNumber(
                            row.totalSeverelyInjuredVictims ?? row.severelyInjuredVictims,
                          )}
                        </td>
                        <td className="border border-gray-200 px-2 py-2 text-left">
                          {formatNumber(row.totalLeaveDays ?? row.leaveDays)}
                        </td>
                        <td className="border border-gray-200 px-2 py-2 text-left">
                          {formatNumber(row.totalCost)}
                        </td>
                        <td className="border border-gray-200 px-2 py-2 text-left">
                          {formatNumber(row.medicalCost)}
                        </td>
                        <td className="border border-gray-200 px-2 py-2 text-left">
                          {formatNumber(row.treatmentSalaryCost)}
                        </td>
                        <td className="border border-gray-200 px-2 py-2 text-left">
                          {formatNumber(row.compensationCost)}
                        </td>
                        <td className="border border-gray-200 px-2 py-2 text-left">
                          {formatNumber(row.propertyDamageCost)}
                        </td>
                      </tr>
                    )),
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </ListLayout>
  );
};

export default LaborAccidentSummary;