'use client';

import React from 'react';
import { Eye, Pencil, Plus } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLaborAccidents } from '@/libs/tts/hooks/useLaborAccidents';
import DataTable from '@/libs/core/components/ui/DataTable';
import ListLayout from '@/libs/tts/components/layout/ListLayout';
import { TableColumn } from '@/libs/core/models/component.model';
import { ReportListItemDto } from '@/libs/shared/tts/models/labor-accident.model';
import { Button } from '@/libs/core/components/ui/Button';

const YEARS = [2026, 2025, 2024, 2023, 2022];

const LaborAccidentList: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryYear = Number(searchParams.get('year'));
  const selectedYear = YEARS.includes(queryYear) ? queryYear : YEARS[0];
  const { data: items = [], isLoading, isError } = useLaborAccidents(selectedYear);

  const handleYearChange = (year: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('year', year.toString());
    router.replace(`/labor-accidents?${params.toString()}`);
  };

  const handleAddReport = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('year', selectedYear.toString());
    router.push(`/labor-accidents/new?${params.toString()}`);
  };

  const navigateToReport = (id: string) => {
    const query = searchParams.toString();
    router.push(`/labor-accidents/${id}${query ? `?${query}` : ''}`);
  };

  const columns: TableColumn<ReportListItemDto>[] = [
    {
      key: 'actions',
      header: 'Thao tác',
      headerClassName: 'w-28 text-center',
      className: 'w-28',
      cell: (item) => (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            title="Xem báo cáo"
            aria-label={`Xem báo cáo của ${item.companyName}`}
            onClick={() => navigateToReport(item.id)}
            className="text-slate-400 transition-colors hover:text-primary"
          >
            <Eye size={16} strokeWidth={1.8} />
          </button>
          {item.status === 'DRAFT' && (
            <button
              type="button"
              title="Chỉnh sửa báo cáo"
              aria-label={`Chỉnh sửa báo cáo của ${item.companyName}`}
              onClick={() => navigateToReport(item.id)}
              className="text-slate-400 transition-colors hover:text-primary"
            >
              <Pencil size={16} strokeWidth={1.8} />
            </button>
          )}
        </div>
      ),
    },
    {
      key: 'companyName',
      header: 'Tên doanh nghiệp',
      cell: (item) => item.companyName,
    },
    {
      key: 'taxCode',
      header: 'Mã số thuế',
      cell: (item) => item.taxCode,
    },
    {
      key: 'reportPeriod',
      header: 'Kỳ báo cáo',
      cell: (item) => (item.reportPeriod === 'SIX_MONTHS' ? '6 tháng' : 'Cả năm'),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      cell: (item) => {
        const isAccepted = item.status === 'ACCEPTED';
        return (
          <span
            className={`inline-flex items-center gap-2 ${
              isAccepted ? 'text-primary' : 'text-slate-400'
            }`}
          >
            <span
              className={`size-2 rounded-full ${isAccepted ? 'bg-primary' : 'bg-slate-400'}`}
            />
            <span>{isAccepted ? 'Đã tiếp nhận' : 'Đang báo cáo'}</span>
          </span>
        );
      },
    },
  ];

  return (
    <ListLayout
      title="Báo cáo định kỳ Tai nạn lao động"
      count={items.length}
      actions={
        <>
          <select
            aria-label="Năm báo cáo"
            value={selectedYear}
            onChange={(e) => handleYearChange(Number(e.target.value))}
            className="h-10 min-w-20 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
          >
            {YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <Button
            type="button"
            onClick={handleAddReport}
            className="flex h-10 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-white hover:opacity-90"
          >
            <Plus size={18} strokeWidth={2} />
            <span>Tạo báo cáo</span>
          </Button>
        </>
      }
    >
      {isError ? (
        <div className="flex min-h-[240px] items-center justify-center p-4 text-sm text-error">
          Không thể tải danh sách báo cáo. Vui lòng thử lại.
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-border">
          <DataTable
            columns={columns}
            data={items}
            getRowId={(item) => item.id}
            isLoading={isLoading}
          />
        </div>
      )}
    </ListLayout>
  );
};

export default LaborAccidentList;