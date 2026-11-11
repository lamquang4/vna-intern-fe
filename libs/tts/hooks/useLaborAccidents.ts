import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useGetMe } from './useAuth';
import { laborAccidentApis } from '@/libs/tts/services/apis/laborAccidentApis';
import type { LaborAccidentListFilters } from '@/libs/tts/services/apis/laborAccidentApis';
import { createEmptyFullMetrics } from '@/libs/shared/tts/schemas/labor-accident.schema';
import type { LaborAccidentReportFormValues } from '@/libs/shared/tts/models/labor-accident.model';
import type { ErrorResponse } from '@/libs/shared/core/models/common.model';
import { getErrorMessage } from '@/libs/core/utils/errorUtil';
import type { DeleteLaborAccidentReportsRequest } from '@/libs/tts/services/apis/laborAccidentApis';
import { toast } from 'react-hot-toast';

export function createNewLaborAccidentReport(
  reportYear: number,
  reportPeriod: LaborAccidentReportFormValues['reportPeriod'] = 'FULL_YEAR',
): LaborAccidentReportFormValues {
  return {
    reportYear,
    reportPeriod,
    status: 'PENDING',
    companyInfo: {
      companyName: '',
      companyType: '',
      businessSector: '',
      totalEmployees: 0,
      totalFemaleEmployees: 0,
      totalWageFund: 0,
    },
    generalAccidents: {
      summary: createEmptyFullMetrics(),
      details: [],
    },
    article39Accidents: createEmptyFullMetrics(),
  };
}

export function useLaborAccidents(year: number, filters?: LaborAccidentListFilters) {
  const { data: accountData, isLoading: isAccountLoading } = useGetMe();
  const role = accountData?.data.roleCode;

  return useQuery({
    queryKey: ['labor-accidents', year, role, filters],
    queryFn: () => laborAccidentApis.getReportsByYear(year, role!, filters),
    enabled: !isAccountLoading && !!role,
  });
}

export function useLaborAccidentDetail(id?: string) {
  return useQuery({
    queryKey: ['labor-accident-detail', id],
    queryFn: () => {
      if (!id) throw new Error('Thiếu mã báo cáo');
      return laborAccidentApis.getReportDetail(id);
    },
    enabled: !!id,
  });
}

export function useAccidentCategories() {
  return useQuery({
    queryKey: ['labor-accident-categories'],
    queryFn: laborAccidentApis.getMasterCategories,
  });
}

export function useDeleteLaborAccidentReports() {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; data: null },
    AxiosError<ErrorResponse>,
    DeleteLaborAccidentReportsRequest
  >({
    mutationFn: laborAccidentApis.deleteReports,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['labor-accidents'] });
      toast.success(response.message || 'Xóa báo cáo thành công');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Xóa báo cáo thất bại'));
    },
  });
}
