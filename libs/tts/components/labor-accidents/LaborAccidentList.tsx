'use client';

import React, { useEffect, useState } from 'react';
import { Eye, FileChartColumn, Pencil, Plus, Trash2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDeleteLaborAccidentReports, useLaborAccidents } from '@/libs/tts/hooks/useLaborAccidents';
import DataTable from '@/libs/core/components/ui/DataTable';
import ListLayout from '@/libs/tts/components/layout/ListLayout';
import { TableColumn } from '@/libs/core/models/component.model';
import { ReportListItemDto } from '@/libs/shared/tts/models/labor-accident.model';
import { Button } from '@/libs/core/components/ui/Button';
import { useGetMe } from '@/libs/tts/hooks/useAuth';
import { Input } from '@/libs/core/components/ui/Input';
import type { LaborAccidentListFilters } from '@/libs/tts/services/apis/laborAccidentApis';
import { useGetHCMProvince } from '@/libs/tts/hooks/useLocation';
import { ConfirmDialog } from '@/libs/core/components/ui/ConfirmDialog';

const YEARS = [2026, 2025, 2024, 2023, 2022];

const LaborAccidentList: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryYear = Number(searchParams.get('year'));
  const selectedYear = YEARS.includes(queryYear) ? queryYear : YEARS[0];

  const { data: accountData } = useGetMe();
  const isDepartment = accountData?.data.roleCode === 'SO';
  const canCreate = accountData?.data.roleCode === 'DOANH_NGHIEP';
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const deleteReportsMutation = useDeleteLaborAccidentReports();

  const { data: hcmProvince } = useGetHCMProvince();
  const selectedProvince = searchParams.get('province') ?? hcmProvince?.province ?? 'Hồ Chí Minh';
  const selectedWard = searchParams.get('ward') ?? '';
  const selectedReportPeriod = searchParams.get('reportPeriod') ?? '';
  const selectedStatus = searchParams.get('status') ?? '';
  const wardOptions = hcmProvince?.wards ?? [];

  // State cục bộ cho 2 ô input text để lọc tự động (Debounce 300ms)
  const [nameInput, setNameInput] = useState(searchParams.get('name') ?? '');
  const [taxCodeInput, setTaxCodeInput] = useState(searchParams.get('taxCode') ?? '');

  // Hàm cập nhật URL searchParams ngay khi chọn dropdown
  const updateFilterParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    if (value.trim()) {
      params.set(key, value.trim());
    } else {
      params.delete(key);
    }
    router.replace(`/labor-accidents?${params.toString()}`, { scroll: false });
  };

  // Tự động lọc sau 300ms khi gõ Tên doanh nghiệp hoặc Mã số thuế
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentName = searchParams.get('name') ?? '';
      const currentTaxCode = searchParams.get('taxCode') ?? '';

      if (nameInput !== currentName || taxCodeInput !== currentTaxCode) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('page');

        if (nameInput.trim()) params.set('name', nameInput.trim());
        else params.delete('name');

        if (taxCodeInput.trim()) params.set('taxCode', taxCodeInput.trim());
        else params.delete('taxCode');

        router.replace(`/labor-accidents?${params.toString()}`, { scroll: false });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [nameInput, taxCodeInput, searchParams, router]);

  const appliedFilters: LaborAccidentListFilters = {
    name: searchParams.get('name') || undefined,
    taxCode: searchParams.get('taxCode') || undefined,
    province: selectedProvince || undefined,
    ward: selectedWard || undefined,
    reportPeriod: (selectedReportPeriod as LaborAccidentListFilters['reportPeriod']) || undefined,
    status: (selectedStatus as LaborAccidentListFilters['status']) || undefined,
  };

  const { data: items = [], isLoading, isError } = useLaborAccidents(
    selectedYear,
    isDepartment ? appliedFilters : undefined,
  );

  const handleYearChange = (year: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('year', year.toString());
    router.replace(`/labor-accidents?${params.toString()}`, { scroll: false });
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

  const handleDeleteReports = () => {
    if (selectedIds.length === 0 || deleteReportsMutation.isPending) return;
    deleteReportsMutation.mutate(
      { reportIds: selectedIds },
      {
        onSuccess: () => {
          setSelectedIds([]);
          setDeleteOpen(false);
        },
      },
    );
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
          {item.status !== 'ACCEPTED' && (
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
      header: isDepartment ? (
        <div>
          <div>Tên doanh nghiệp</div>
          <Input
            name="name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Tìm tên doanh nghiệp"
            className="mt-2 h-8 w-full rounded-md bg-background px-2 text-xs font-normal"
          />
        </div>
      ) : (
        'Tên doanh nghiệp'
      ),
      cell: (item) => item.companyName,
    },
    {
      key: 'taxCode',
      header: isDepartment ? (
        <div>
          <div>Mã số thuế</div>
          <Input
            name="taxCode"
            value={taxCodeInput}
            onChange={(e) => setTaxCodeInput(e.target.value)}
            placeholder="Tìm mã số thuế"
            className="mt-2 h-8 w-full rounded-md bg-background px-2 text-xs font-normal"
          />
        </div>
      ) : (
        'Mã số thuế'
      ),
      cell: (item) => item.taxCode,
    },
    {
      key: 'reportPeriod',
      header: isDepartment ? (
        <div>
          <div>Kỳ báo cáo</div>
          <select
            aria-label="Lọc kỳ báo cáo"
            name="reportPeriod"
            value={selectedReportPeriod}
            onChange={(e) => updateFilterParam('reportPeriod', e.target.value)}
            className="mt-2 h-8 w-full rounded-md border border-border bg-background px-2 text-xs font-normal text-foreground outline-none focus:border-primary"
          >
            <option value="">Tất cả</option>
            <option value="SIX_MONTHS">6 tháng</option>
            <option value="FULL_YEAR">Cả năm</option>
          </select>
        </div>
      ) : (
        'Kỳ báo cáo'
      ),
      cell: (item) => (item.reportPeriod === 'SIX_MONTHS' ? '6 tháng' : 'Cả năm'),
    },
    {
      key: 'status',
      header: isDepartment ? (
        <div>
          <div>Trạng thái</div>
          <select
            aria-label="Lọc trạng thái"
            name="status"
            value={selectedStatus}
            onChange={(e) => updateFilterParam('status', e.target.value)}
            className="mt-2 h-8 w-full rounded-md border border-border bg-background px-2 text-xs font-normal text-foreground outline-none focus:border-primary"
          >
            <option value="">Tất cả</option>
            <option value="PENDING">Chưa báo cáo</option>
            <option value="IN_PROGRESS">Đang báo cáo</option>
            <option value="ACCEPTED">Đã tiếp nhận</option>
          </select>
        </div>
      ) : (
        'Trạng thái'
      ),
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
            <span>
              {isAccepted
                ? 'Đã tiếp nhận'
                : item.status === 'PENDING'
                  ? 'Chưa báo cáo'
                  : 'Đang báo cáo'}
            </span>
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
          {selectedIds.length > 0 && (
            <Button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="flex items-center gap-2 rounded-md bg-error px-3 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              <Trash2 size={18} />
              <span>Xóa ({selectedIds.length})</span>
            </Button>
          )}
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
          {isDepartment ? (
            <Button
              type="button"
              onClick={() => router.push(`/labor-accidents/summary?year=${selectedYear}`)}
              className="flex h-10 items-center gap-2 rounded-md border border-primary bg-white px-3 text-sm font-medium text-primary hover:bg-muted"
            >
              <FileChartColumn size={18} strokeWidth={2} />
              <span>Báo cáo tổng hợp</span>
            </Button>
          ) : (
            canCreate && (
              <Button
                type="button"
                onClick={handleAddReport}
                className="flex h-10 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-white hover:opacity-90"
              >
                <Plus size={18} strokeWidth={2} />
                <span>Tạo báo cáo</span>
              </Button>
            )
          )}
        </>
      }
    >
      <div className="space-y-4">
        {/* Hàng lọc Tỉnh/ thành phố và Phường/ Xã nằm ngay bên dưới tiêu đề */}
        {isDepartment && (
          <div className="grid grid-cols-1 gap-4 pt-1 md:grid-cols-2">
            <div className="relative">
              <label className="absolute -top-2 left-3 bg-background px-1 text-xs text-slate-400">
                Tỉnh/ thành phố
              </label>
              <select
                aria-label="Lọc tỉnh thành phố"
                name="province"
                value={selectedProvince}
                onChange={(e) => updateFilterParam('province', e.target.value)}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
              >
                <option value={selectedProvince}>{selectedProvince}</option>
              </select>
            </div>

            <div className="relative">
              <label className="absolute -top-2 left-3 bg-background px-1 text-xs text-slate-400">
                Phường/ Xã
              </label>
              <select
                aria-label="Lọc xã phường"
                name="ward"
                value={selectedWard}
                onChange={(e) => updateFilterParam('ward', e.target.value)}
                disabled={!selectedProvince}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary disabled:opacity-50"
              >
                <option value="">Tất cả</option>
                {wardOptions.map((ward) => (
                  <option key={ward.name} value={ward.name}>
                    {ward.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Bảng dữ liệu và bộ lọc trường input/dropdown trên cột */}
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
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
          </div>
        )}
      </div>
      {deleteOpen && (
        <ConfirmDialog
          title="Xác nhận xóa báo cáo"
          description={`Bạn có chắc chắn muốn xóa ${selectedIds.length} báo cáo đã chọn?`}
          confirmText="Xác nhận"
          cancelText="Hủy bỏ"
          isLoading={deleteReportsMutation.isPending}
          onConfirm={handleDeleteReports}
          onClose={() => setDeleteOpen(false)}
        />
      )}
    </ListLayout>
  );
};

export default LaborAccidentList;