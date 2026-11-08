// libs/tts/hooks/useLaborAccidents.ts
import { useQuery } from '@tanstack/react-query';
import { laborAccidentApis } from '@/libs/tts/services/apis/laborAccidentApis';
import {
  LaborAccidentReportFormValues,
  MasterAccidentCategoryDto,
  ReportListItemDto,
} from '@/libs/shared/tts/models/labor-accident.model';
import { createEmptyFullMetrics } from '@/libs/shared/tts/schemas/labor-accident.schema';

const USE_MOCK = true; // Đổi thành false khi Backend đã sẵn sàng API

export const MOCK_CATEGORIES: MasterAccidentCategoryDto[] = [
  // 1.1.a Do người sử dụng lao động (Mã 1 -> 6)
  { id: 'c1', code: '1', name: 'Không có thiết bị an toàn hoặc thiết bị không đảm bảo an toàn', type: 'CAUSE', parentGroup: 'EMPLOYER' },
  { id: 'c2', code: '2', name: 'Không có phương tiện bảo vệ cá nhân hoặc phương tiện bảo vệ cá nhân không tốt', type: 'CAUSE', parentGroup: 'EMPLOYER' },
  { id: 'c3', code: '3', name: 'Tổ chức lao động không hợp lý', type: 'CAUSE', parentGroup: 'EMPLOYER' },
  { id: 'c4', code: '4', name: 'Chưa huấn luyện hoặc huấn luyện an toàn vệ sinh lao động chưa đầy đủ', type: 'CAUSE', parentGroup: 'EMPLOYER' },
  { id: 'c5', code: '5', name: 'Không có quy trình an toàn hoặc biện pháp làm việc an toàn', type: 'CAUSE', parentGroup: 'EMPLOYER' },
  { id: 'c6', code: '6', name: 'Điều kiện làm việc không tốt', type: 'CAUSE', parentGroup: 'EMPLOYER' },
  // 1.1.b Do người lao động & Khách quan (Mã 7 -> 9)
  { id: 'c7', code: '7', name: 'Vi phạm nội quy, quy trình, quy chuẩn, biện pháp làm việc an toàn', type: 'CAUSE', parentGroup: 'EMPLOYEE' },
  { id: 'c8', code: '8', name: 'Không sử dụng phương tiện bảo vệ cá nhân', type: 'CAUSE', parentGroup: 'EMPLOYEE' },
  { id: 'c9', code: '9', name: 'Khách quan khó tránh/ Nguyên nhân chưa kể đến', type: 'CAUSE', parentGroup: 'OBJECTIVE' },
  // 1.2 Yếu tố gây chấn thương (Mã 101...)
  { id: 'i101', code: '101', name: 'Thiết bị nâng', type: 'INJURY_FACTOR' },
  // 1.3 Nghề nghiệp (Mã 102, 103...)
  { id: 'o102', code: '102', name: 'Nhà lãnh đạo cơ quan Đảng Cộng sản Việt Nam cấp Trung ương', type: 'OCCUPATION' },
  { id: 'o103', code: '103', name: 'Công nhân', type: 'OCCUPATION' },
];

export const MOCK_REPORT_LIST: ReportListItemDto[] = [
  {
    id: 'rep-6m-2022',
    companyName: 'CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ VẬN TẢI PHẠM THIÊN ÂN',
    taxCode: '0317118106',
    reportYear: 2022,
    reportPeriod: 'SIX_MONTHS',
    status: 'DRAFT',
  },
  {
    id: 'rep-fy-2022',
    companyName: 'CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ VẬN TẢI PHẠM THIÊN ÂN',
    taxCode: '0317118106',
    reportYear: 2022,
    reportPeriod: 'FULL_YEAR',
    status: 'ACCEPTED',
  },
];

export const MOCK_REPORT_DETAIL: LaborAccidentReportFormValues = {
  id: 'rep-6m-2022',
  reportYear: 2022,
  reportPeriod: 'SIX_MONTHS',
  status: 'DRAFT',
  companyInfo: {
    companyName: 'Công ty TNHH ABC',
    companyType: 'Công ty trách nhiệm hữu hạn tư nhân',
    businessSector: 'Sản xuất cơ khí hàng tiêu dùng',
    totalEmployees: 10,
    totalFemaleEmployees: 5,
    totalWageFund: 10.2,
  },
  generalAccidents: {
    summary: {
      ...createEmptyFullMetrics(),
      totalCases: 1,
      fatalCases: 1,
      multipleVictimCases: 1,
      totalVictims: 10,
      femaleVictims: 5,
      fatalVictims: 5,
      severelyInjuredVictims: 10,
      medicalCost: 10000000,
      treatmentSalaryCost: 10000000,
      compensationCost: 10000000,
      totalCost: 30000000,
      totalLeaveDays: 20,
      propertyDamageCost: 10000000,
    },
    details: [
      {
        causeCategoryId: 'c1',
        injuryFactorCategoryId: 'i101',
        occupationCategoryId: 'o102',
        totalVictims: 10,
        femaleVictims: 5,
        fatalVictims: 5,
        severelyInjuredVictims: 10,
        unmanagedVictims: 0,
        unmanagedFemaleVictims: 0,
        unmanagedFatalVictims: 0,
        unmanagedSeverelyInjured: 0,
        medicalCost: 10000000,
        treatmentSalaryCost: 10000000,
        compensationCost: 10000000,
        totalCost: 30000000,
        totalLeaveDays: 20,
        propertyDamageCost: 10000000,
      },
    ],
  },
  article39Accidents: createEmptyFullMetrics(),
  attachmentName: 'baocaoTNLD.pdf',
  attachmentUrl: '#',
};

export function createNewLaborAccidentReport(
  reportYear: number,
  reportPeriod: LaborAccidentReportFormValues['reportPeriod'] = 'FULL_YEAR'
): LaborAccidentReportFormValues {
  return {
    reportYear,
    reportPeriod,
    status: 'DRAFT',
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

export function useLaborAccidents(year: number) {
  return useQuery({
    queryKey: ['labor-accidents', year],
    queryFn: async () => (USE_MOCK ? MOCK_REPORT_LIST : laborAccidentApis.getReportsByYear(year)),
  });
}

export function useLaborAccidentDetail(id?: string) {
  return useQuery({
    queryKey: ['labor-accident-detail', id],
    queryFn: async () => {
      if (USE_MOCK) {
        return {
          ...MOCK_REPORT_DETAIL,
          id,
          status: id === 'rep-fy-2022' ? ('ACCEPTED' as const) : ('DRAFT' as const),
        };
      }
      if (!id) {
        throw new Error('Thiếu mã báo cáo');
      }
      return laborAccidentApis.getReportDetail(id);
    },
    enabled: !!id,
  });
}

export function useAccidentCategories() {
  return useQuery({
    queryKey: ['labor-accident-categories'],
    queryFn: async () => (USE_MOCK ? MOCK_CATEGORIES : laborAccidentApis.getMasterCategories()),
  });
}