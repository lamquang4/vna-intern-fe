// src/features/labor-accident-report/utils/overview-calculator.ts
import {
  AccidentCaseDetailFormValues,
  CaseCountMetrics,
  DamageCostMetrics,
  LaborAccidentReportFormValues,
  MasterAccidentCategoryDto,
  OverviewTableRow,
  VictimCountMetrics,
} from '@/libs/shared/tts/models/labor-accident.model';

const ZERO_METRICS: CaseCountMetrics & VictimCountMetrics = {
  totalCases: 0,
  fatalCases: 0,
  multipleVictimCases: 0,
  totalVictims: 0,
  femaleVictims: 0,
  fatalVictims: 0,
  severelyInjuredVictims: 0,
  unmanagedVictims: 0,
  unmanagedFemaleVictims: 0,
  unmanagedFatalVictims: 0,
  unmanagedSeverelyInjured: 0,
};

export function aggregateCasesByCategory(
  cases: AccidentCaseDetailFormValues[]
): CaseCountMetrics & VictimCountMetrics {
  return cases.reduce(
    (acc, item) => ({
      totalCases: acc.totalCases + 1,
      fatalCases: acc.fatalCases + (Number(item.fatalVictims) > 0 ? 1 : 0),
      multipleVictimCases: acc.multipleVictimCases + (Number(item.totalVictims) >= 2 ? 1 : 0),
      totalVictims: acc.totalVictims + (Number(item.totalVictims) || 0),
      femaleVictims: acc.femaleVictims + (Number(item.femaleVictims) || 0),
      fatalVictims: acc.fatalVictims + (Number(item.fatalVictims) || 0),
      severelyInjuredVictims:
        acc.severelyInjuredVictims + (Number(item.severelyInjuredVictims) || 0),
      unmanagedVictims: acc.unmanagedVictims + (Number(item.unmanagedVictims) || 0),
      unmanagedFemaleVictims:
        acc.unmanagedFemaleVictims + (Number(item.unmanagedFemaleVictims) || 0),
      unmanagedFatalVictims:
        acc.unmanagedFatalVictims + (Number(item.unmanagedFatalVictims) || 0),
      unmanagedSeverelyInjured:
        acc.unmanagedSeverelyInjured + (Number(item.unmanagedSeverelyInjured) || 0),
    }),
    { ...ZERO_METRICS }
  );
}

/**
 * Dựng danh sách các dòng hiển thị trên Bảng I (Màn 26.5 & 26.6)
 */
export function buildOverviewMatrixRows(
  formValues: LaborAccidentReportFormValues,
  categories: MasterAccidentCategoryDto[]
): OverviewTableRow[] {
  const gSummary = formValues.generalAccidents.summary;
  const gDetails = formValues.generalAccidents.details || [];
  const a39 = formValues.article39Accidents;

  const employerCauses = categories.filter(
    (c) => c.type === 'CAUSE' && c.parentGroup === 'EMPLOYER'
  );
  const employeeCauses = categories.filter(
    (c) => c.type === 'CAUSE' && (c.parentGroup === 'EMPLOYEE' || c.parentGroup === 'OBJECTIVE')
  );
  const injuryFactors = categories.filter((c) => c.type === 'INJURY_FACTOR');
  const occupations = categories.filter((c) => c.type === 'OCCUPATION');

  const rows: OverviewTableRow[] = [
    // --- MỤC 1: TAI NẠN LAO ĐỘNG ---
    {
      key: 'sec-1',
      label: '1. Tai nạn lao động',
      rowType: 'SECTION_HEADER',
      ...ZERO_METRICS,
    },
    {
      key: 'sec-1-sum',
      label: 'Tai nạn lao động',
      rowType: 'DATA_ROW',
      ...gSummary,
    },

    // --- 1.1 PHÂN THEO NGUYÊN NHÂN XẢY RA TNLĐ ---
    {
      key: 'sec-1.1',
      label: '1.1 Phân theo nguyên nhân xảy ra TNLĐ',
      rowType: 'SECTION_HEADER',
      ...ZERO_METRICS,
    },
    {
      key: 'sec-1.1-a',
      label: 'a. Do người sử dụng lao động',
      rowType: 'SUB_HEADER',
      ...ZERO_METRICS,
    },
    ...employerCauses.map((cat): OverviewTableRow => {
      const matched = gDetails.filter((d) => d.causeCategoryId === cat.id);
      return {
        key: `cause-${cat.id}`,
        label: cat.name,
        code: cat.code,
        rowType: 'DATA_ROW',
        ...aggregateCasesByCategory(matched),
      };
    }),
    {
      key: 'sec-1.1-b',
      label: 'b. Do người lao động',
      rowType: 'SUB_HEADER',
      ...ZERO_METRICS,
    },
    ...employeeCauses.map((cat): OverviewTableRow => {
      const matched = gDetails.filter((d) => d.causeCategoryId === cat.id);
      return {
        key: `cause-${cat.id}`,
        label: cat.name,
        code: cat.code,
        rowType: 'DATA_ROW',
        ...aggregateCasesByCategory(matched),
      };
    }),

    // --- 1.2 PHÂN THEO YẾU TỐ GÂY CHẤN THƯƠNG ---
    {
      key: 'sec-1.2',
      label: '1.2. Phân theo yếu tố gây chấn thương',
      rowType: 'SECTION_HEADER',
      ...ZERO_METRICS,
    },
    ...injuryFactors.map((cat): OverviewTableRow => {
      const matched = gDetails.filter((d) => d.injuryFactorCategoryId === cat.id);
      return {
        key: `injury-${cat.id}`,
        label: cat.name,
        code: cat.code,
        rowType: 'DATA_ROW',
        ...aggregateCasesByCategory(matched),
      };
    }),

    // --- 1.3 PHÂN THEO NGHỀ NGHIỆP ---
    {
      key: 'sec-1.3',
      label: '1.3 Phân theo nghề nghiệp',
      rowType: 'SECTION_HEADER',
      ...ZERO_METRICS,
    },
    ...occupations.map((cat): OverviewTableRow => {
      const matched = gDetails.filter((d) => d.occupationCategoryId === cat.id);
      return {
        key: `occ-${cat.id}`,
        label: cat.name,
        code: cat.code,
        rowType: 'DATA_ROW',
        ...aggregateCasesByCategory(matched),
      };
    }),

    // --- MỤC 2: TNLĐ HƯỞNG TRỢ CẤP KHOẢN 2 ĐIỀU 39 ---
    {
      key: 'sec-2',
      label: '2. Tai nạn được hưởng trợ cấp theo quy định tại Khoản 2 Điều 39 Luật ATVSLĐ',
      rowType: 'SECTION_HEADER',
      ...ZERO_METRICS,
    },
    {
      key: 'sec-2-data',
      label: '',
      code: '10',
      rowType: 'DATA_ROW',
      ...a39,
    },

    // --- MỤC 3: TỔNG SỐ (3 = 1 + 2) ---
    {
      key: 'sec-3',
      label: '3. Tổng số',
      rowType: 'SECTION_HEADER',
      ...ZERO_METRICS,
    },
    {
      key: 'sec-3-total',
      label: 'Tổng số (3=1+2)',
      rowType: 'TOTAL_ROW',
      totalCases: (Number(gSummary.totalCases) || 0) + (Number(a39.totalCases) || 0),
      fatalCases: (Number(gSummary.fatalCases) || 0) + (Number(a39.fatalCases) || 0),
      multipleVictimCases:
        (Number(gSummary.multipleVictimCases) || 0) + (Number(a39.multipleVictimCases) || 0),
      totalVictims: (Number(gSummary.totalVictims) || 0) + (Number(a39.totalVictims) || 0),
      femaleVictims: (Number(gSummary.femaleVictims) || 0) + (Number(a39.femaleVictims) || 0),
      fatalVictims: (Number(gSummary.fatalVictims) || 0) + (Number(a39.fatalVictims) || 0),
      severelyInjuredVictims:
        (Number(gSummary.severelyInjuredVictims) || 0) + (Number(a39.severelyInjuredVictims) || 0),
      unmanagedVictims:
        (Number(gSummary.unmanagedVictims) || 0) + (Number(a39.unmanagedVictims) || 0),
      unmanagedFemaleVictims:
        (Number(gSummary.unmanagedFemaleVictims) || 0) + (Number(a39.unmanagedFemaleVictims) || 0),
      unmanagedFatalVictims:
        (Number(gSummary.unmanagedFatalVictims) || 0) + (Number(a39.unmanagedFatalVictims) || 0),
      unmanagedSeverelyInjured:
        (Number(gSummary.unmanagedSeverelyInjured) || 0) +
        (Number(a39.unmanagedSeverelyInjured) || 0),
    },
  ];

  return rows;
}

export function calculateGrandTotalDamage(
  formValues: LaborAccidentReportFormValues
): DamageCostMetrics {
  const metrics = [formValues.generalAccidents.summary, formValues.article39Accidents];

  return metrics.reduce(
    (total, current) => ({
      medicalCost: total.medicalCost + Number(current.medicalCost || 0),
      treatmentSalaryCost:
        total.treatmentSalaryCost + Number(current.treatmentSalaryCost || 0),
      compensationCost: total.compensationCost + Number(current.compensationCost || 0),
      totalCost: total.totalCost + Number(current.totalCost || 0),
      totalLeaveDays: total.totalLeaveDays + Number(current.totalLeaveDays || 0),
      propertyDamageCost:
        total.propertyDamageCost + Number(current.propertyDamageCost || 0),
    }),
    {
      medicalCost: 0,
      treatmentSalaryCost: 0,
      compensationCost: 0,
      totalCost: 0,
      totalLeaveDays: 0,
      propertyDamageCost: 0,
    }
  );
}