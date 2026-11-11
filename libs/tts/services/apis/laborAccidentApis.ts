import { axiosInstance } from '@/libs/core/services/axiosInstance.ts';
import type {
  AccidentCaseDetailFormValues,
  FullAccidentMetrics,
  LaborAccidentReportFormValues,
  MasterAccidentCategoryDto,
  ReportListItemDto,
  ReportPeriod,
} from '@/libs/shared/tts/models/labor-accident.model';
import { createEmptyFullMetrics } from '@/libs/shared/tts/schemas/labor-accident.schema';

type BackendStats = {
  totalCases?: number | null;
  fatalCases?: number | null;
  totalCasesWithTwoOrMoreVictims?: number | null;
  totalVictims?: number | null;
  nonManagedVictims?: number | null;
  totalFemaleVictims?: number | null;
  nonManagedFemaleVictims?: number | null;
  totalFatalVictims?: number | null;
  nonManagedFatalVictims?: number | null;
  totalSeverelyInjuredVictims?: number | null;
  nonManagedSeverelyInjuredVictims?: number | null;
  medicalExpense?: number | null;
  salaryExpenseDuringTreatment?: number | null;
  compensationExpense?: number | null;
  totalExpense?: number | null;
  totalDaysOff?: number | null;
  propertyDamageExpense?: number | null;
};

type BackendDetail = BackendStats & {
  accidentDetailId?: string | null;
  injuryTypeId: string;
  injuryFactorId: string;
  occupationId: string;
};

type BackendReport = {
  accidentReportId: string;
  enterpriseId: string;
  year: number;
  reportPeriod: ReportPeriod;
  status: 'PENDING' | 'IN_PROGRESS' | 'ACCEPTED';
  name: string;
  taxCode: string;
  businessTypeId: string;
  businessIndustryId: string;
  totalEmployees: number | null;
  femaleEmployees: number | null;
  totalSalaryFund: number | null;
  accidentTotals: BackendStats | null;
  accidentDetails: BackendDetail[] | null;
  subsidizedAccident: BackendStats | null;
  stampedReport?: {
    fileName: string | null;
    contentType: string | null;
    size: number | null;
    url: string;
  } | null;
};

export interface LaborAccidentListFilters {
  name?: string;
  taxCode?: string;
  province?: string;
  ward?: string;
  reportPeriod?: ReportPeriod;
  status?: 'PENDING' | 'IN_PROGRESS' | 'ACCEPTED';
}

export interface DeleteLaborAccidentReportsRequest {
  reportIds: string[];
}

export interface LaborAccidentSummary {
  year: number;
  businessTypes: Array<{ name: string; code: string; totalCases: number; totalVictims: number }>;
  total1: BackendStats;
  injuryTypes: Array<{ name: string; code: string; totalVictims: number; totalFatalVictims: number }>;
  injuryFactors: Array<{ name: string; code: string; totalVictims: number; totalFatalVictims: number }>;
  occupations: Array<{ name: string; code: string; totalVictims: number; totalFatalVictims: number }>;
  total2: BackendStats;
}

const value = (input: number | null | undefined) => input ?? 0;

const toUiStats = (stats: BackendStats | null | undefined): FullAccidentMetrics => {
  const result = createEmptyFullMetrics();
  if (!stats) return result;
  return {
    ...result,
    totalCases: value(stats.totalCases),
    fatalCases: value(stats.fatalCases),
    multipleVictimCases: value(stats.totalCasesWithTwoOrMoreVictims),
    totalVictims: value(stats.totalVictims),
    femaleVictims: value(stats.totalFemaleVictims),
    fatalVictims: value(stats.totalFatalVictims),
    severelyInjuredVictims: value(stats.totalSeverelyInjuredVictims),
    unmanagedVictims: value(stats.nonManagedVictims),
    unmanagedFemaleVictims: value(stats.nonManagedFemaleVictims),
    unmanagedFatalVictims: value(stats.nonManagedFatalVictims),
    unmanagedSeverelyInjured: value(stats.nonManagedSeverelyInjuredVictims),
    medicalCost: value(stats.medicalExpense),
    treatmentSalaryCost: value(stats.salaryExpenseDuringTreatment),
    compensationCost: value(stats.compensationExpense),
    totalCost: value(stats.totalExpense),
    totalLeaveDays: value(stats.totalDaysOff),
    propertyDamageCost: value(stats.propertyDamageExpense),
  };
};

const toUiDetail = (detail: BackendDetail): AccidentCaseDetailFormValues => ({
  id: detail.accidentDetailId ?? undefined,
  causeCategoryId: detail.injuryTypeId,
  injuryFactorCategoryId: detail.injuryFactorId,
  occupationCategoryId: detail.occupationId,
  ...toUiStats(detail),
});

const toUiReport = (report: BackendReport): LaborAccidentReportFormValues => ({
  id: report.accidentReportId,
  reportYear: report.year,
  reportPeriod: report.reportPeriod,
  status: report.status,
  companyInfo: {
    companyName: report.name,
    companyType: report.businessTypeId,
    businessSector: report.businessIndustryId,
    totalEmployees: value(report.totalEmployees),
    totalFemaleEmployees: value(report.femaleEmployees),
    totalWageFund: value(report.totalSalaryFund),
  },
  generalAccidents: {
    summary: toUiStats(report.accidentTotals),
    details: (report.accidentDetails ?? []).map(toUiDetail),
  },
  article39Accidents: toUiStats(report.subsidizedAccident),
  attachmentUrl: report.stampedReport?.url,
  attachmentName: report.stampedReport?.fileName ?? undefined,
});

const toUiListItem = (report: BackendReport): ReportListItemDto => ({
  id: report.accidentReportId,
  companyName: report.name,
  taxCode: report.taxCode,
  reportYear: report.year,
  reportPeriod: report.reportPeriod,
  status: report.status,
});

const toBackendStats = (
  stats: FullAccidentMetrics | AccidentCaseDetailFormValues,
): BackendStats => ({
  totalCases: 'totalCases' in stats ? stats.totalCases : undefined,
  fatalCases: 'fatalCases' in stats ? stats.fatalCases : undefined,
  totalCasesWithTwoOrMoreVictims:
    'multipleVictimCases' in stats ? stats.multipleVictimCases : undefined,
  totalVictims: stats.totalVictims,
  nonManagedVictims: stats.unmanagedVictims,
  totalFemaleVictims: stats.femaleVictims,
  nonManagedFemaleVictims: stats.unmanagedFemaleVictims,
  totalFatalVictims: stats.fatalVictims,
  nonManagedFatalVictims: stats.unmanagedFatalVictims,
  totalSeverelyInjuredVictims: stats.severelyInjuredVictims,
  nonManagedSeverelyInjuredVictims: stats.unmanagedSeverelyInjured,
  medicalExpense: stats.medicalCost,
  salaryExpenseDuringTreatment: stats.treatmentSalaryCost,
  compensationExpense: stats.compensationCost,
  totalExpense: stats.totalCost,
  totalDaysOff: stats.totalLeaveDays,
  propertyDamageExpense: stats.propertyDamageCost,
});

const toBackendPayload = (report: LaborAccidentReportFormValues) => ({
  totalEmployees: report.companyInfo.totalEmployees,
  femaleEmployees: report.companyInfo.totalFemaleEmployees,
  totalSalaryFund: report.companyInfo.totalWageFund,
  accidentTotals: toBackendStats(report.generalAccidents.summary),
  accidentDetails: report.generalAccidents.details.map((detail) => ({
    accidentDetailId: detail.id,
    injuryTypeId: detail.causeCategoryId,
    injuryFactorId: detail.injuryFactorCategoryId,
    occupationId: detail.occupationCategoryId,
    ...toBackendStats(detail),
  })),
  subsidizedAccident: toBackendStats(report.article39Accidents),
});

const toFormData = (
  report: LaborAccidentReportFormValues,
  includeAttachment: boolean,
) => {
  const payload = toBackendPayload(report);
  const formData = new FormData();
  formData.append('totalEmployees', String(payload.totalEmployees));
  formData.append('femaleEmployees', String(payload.femaleEmployees));
  formData.append('totalSalaryFund', String(payload.totalSalaryFund));
  formData.append('accidentTotals', JSON.stringify(payload.accidentTotals));
  formData.append('accidentDetails', JSON.stringify(payload.accidentDetails));
  formData.append('subsidizedAccident', JSON.stringify(payload.subsidizedAccident));
  if (includeAttachment && report.attachmentFile) {
    formData.append('stampedReport', report.attachmentFile);
  }
  return formData;
};

const getList = async (
  path: string,
  year: number,
  filters: LaborAccidentListFilters = {},
) => {
  const response = await axiosInstance.get<{ data: BackendReport[] }>(path, {
    params: { year, page: 1, size: 100, ...filters },
  });
  return response.data.data.map(toUiListItem);
};

export const laborAccidentApis = {
  deleteReports: async (data: DeleteLaborAccidentReportsRequest) => {
    const response = await axiosInstance.delete<{ message: string; data: null }>(
      '/accident-reports',
      { data },
    );
    return response.data;
  },

  getOverallSummary: async (year: number) => {
    const response = await axiosInstance.get<{ data: LaborAccidentSummary }>(
      '/accident-reports/summary',
      { params: { year } },
    );
    const summary = response.data.data;
    const mapSummaryStats = (stats: BackendStats | undefined) => ({
      ...stats,
      ...toUiStats(stats),
    });
    const mapSummaryRows = <T extends { totalVictims?: number }>(rows: T[] | undefined) =>
      (rows ?? []).map((row) => ({
        ...row,
        ...mapSummaryStats(row as BackendStats),
      }));

    return {
      ...summary,
      businessTypes: mapSummaryRows(summary.businessTypes),
      total1: mapSummaryStats(summary.total1),
      injuryTypes: mapSummaryRows(summary.injuryTypes),
      injuryFactors: mapSummaryRows(summary.injuryFactors),
      occupations: mapSummaryRows(summary.occupations),
      total2: mapSummaryStats(summary.total2),
    };
  },

  getReportsByYear: (
    year: number,
    role: string,
    filters?: LaborAccidentListFilters,
  ) =>
    getList(
      role === 'DOANH_NGHIEP' ? '/accident-reports/me' : '/accident-reports',
      year,
      filters,
    ),

  getReportDetail: async (id: string) => {
    const response = await axiosInstance.get<{ data: BackendReport }>(`/accident-reports/${id}`);
    return toUiReport(response.data.data);
  },

  getMasterCategories: async (): Promise<MasterAccidentCategoryDto[]> => {
    const types = ['INJURY_TYPE', 'INJURY_FACTOR', 'OCCUPATION'] as const;
    const responses = await Promise.all(
      types.map((type) =>
        axiosInstance.get<{ data: Array<{ categoryId: string; code: string; name: string; type: string }> }>(
          '/categories',
          { params: { type } },
        ),
      ),
    );
    return responses.flatMap((response) =>
      response.data.data.map((category) => ({
        id: category.categoryId,
        code: category.code,
        name: category.name,
        type: category.type === 'INJURY_TYPE' ? 'CAUSE' : category.type,
        parentGroup: category.type === 'INJURY_TYPE' ? 'OBJECTIVE' : undefined,
      })),
    ) as MasterAccidentCategoryDto[];
  },

  getReportId: async (year: number, period: ReportPeriod, role: string) => {
    const reports = await laborAccidentApis.getReportsByYear(year, role);
    return reports.find((report) => report.reportPeriod === period)?.id;
  },

  updateReport: async (
    id: string,
    report: LaborAccidentReportFormValues,
    includeAttachment = false,
  ) => {
    const response = await axiosInstance.put<{ data: BackendReport }>(
      `/accident-reports/${id}`,
      toFormData(report, includeAttachment),
    );
    return toUiReport(response.data.data);
  },
};
