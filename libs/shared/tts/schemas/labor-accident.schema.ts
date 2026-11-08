import { z } from 'zod';
import {
  AccidentCaseDetailFormValues,
  FullAccidentMetrics,
} from '../models/labor-accident.model';

const nonNegativeInt = z
  .number({ error: 'Vui lòng nhập số' })
  .finite('Vui lòng nhập số hợp lệ')
  .int('Phải là số nguyên')
  .min(0, 'Không được nhỏ hơn 0');
const nonNegativeDecimal = z
  .number({ error: 'Vui lòng nhập số' })
  .finite('Vui lòng nhập số hợp lệ')
  .min(0, 'Không được nhỏ hơn 0');

export const caseCountSchema = z.object({
  totalCases: nonNegativeInt,
  fatalCases: nonNegativeInt,
  multipleVictimCases: nonNegativeInt,
});

export const victimCountSchema = z.object({
  totalVictims: nonNegativeInt,
  femaleVictims: nonNegativeInt,
  fatalVictims: nonNegativeInt,
  severelyInjuredVictims: nonNegativeInt,
  unmanagedVictims: nonNegativeInt,
  unmanagedFemaleVictims: nonNegativeInt,
  unmanagedFatalVictims: nonNegativeInt,
  unmanagedSeverelyInjured: nonNegativeInt,
});

export const damageCostSchema = z.object({
  medicalCost: nonNegativeDecimal,
  treatmentSalaryCost: nonNegativeDecimal,
  compensationCost: nonNegativeDecimal,
  totalCost: nonNegativeDecimal,
  totalLeaveDays: nonNegativeInt,
  propertyDamageCost: nonNegativeDecimal,
});

export const fullAccidentMetricsSchema = caseCountSchema
  .merge(victimCountSchema)
  .merge(damageCostSchema)
  .refine((data) => data.fatalCases <= data.totalCases, {
    message: 'Số vụ có người chết không được lớn hơn tổng số vụ',
    path: ['fatalCases'],
  })
  .refine((data) => data.multipleVictimCases <= data.totalCases, {
    message: 'Số vụ >= 2 người bị nạn không được lớn hơn tổng số vụ',
    path: ['multipleVictimCases'],
  })
  .refine((data) => data.femaleVictims <= data.totalVictims, {
    message: 'Số LĐ nữ bị nạn không được lớn hơn tổng số người bị nạn',
    path: ['femaleVictims'],
  })
  .refine((data) => data.fatalVictims <= data.totalVictims, {
    message: 'Số người chết không được lớn hơn tổng số người bị nạn',
    path: ['fatalVictims'],
  })
  .refine((data) => data.severelyInjuredVictims <= data.totalVictims, {
    message: 'Số người bị thương nặng không được lớn hơn tổng số người bị nạn',
    path: ['severelyInjuredVictims'],
  })
  .refine((data) => data.unmanagedVictims <= data.totalVictims, {
    message: 'Số người không thuộc quản lý không được lớn hơn tổng số người bị nạn',
    path: ['unmanagedVictims'],
  })
  .refine((data) => data.unmanagedFemaleVictims <= data.femaleVictims, {
    message: 'Lao động nữ không thuộc quản lý không được lớn hơn tổng lao động nữ bị nạn',
    path: ['unmanagedFemaleVictims'],
  })
  .refine((data) => data.unmanagedFemaleVictims <= data.unmanagedVictims, {
    message: 'Lao động nữ không thuộc quản lý không được lớn hơn số người bị nạn không QL',
    path: ['unmanagedFemaleVictims'],
  })
  .refine((data) => data.unmanagedFatalVictims <= data.fatalVictims, {
    message: 'Số người chết không thuộc quản lý không được lớn hơn tổng người chết',
    path: ['unmanagedFatalVictims'],
  })
  .refine((data) => data.unmanagedFatalVictims <= data.unmanagedVictims, {
    message: 'Số người chết không thuộc quản lý không được lớn hơn số người bị nạn không QL',
    path: ['unmanagedFatalVictims'],
  })
  .refine((data) => data.unmanagedSeverelyInjured <= data.severelyInjuredVictims, {
    message: 'Số người bị thương nặng không thuộc quản lý không hợp lệ',
    path: ['unmanagedSeverelyInjured'],
  })
  .refine((data) => data.unmanagedSeverelyInjured <= data.unmanagedVictims, {
    message: 'Số người bị thương nặng không thuộc quản lý không được lớn hơn số người bị nạn không QL',
    path: ['unmanagedSeverelyInjured'],
  })
  .refine(
    (data) =>
      data.totalCost === data.medicalCost + data.treatmentSalaryCost + data.compensationCost,
    {
      message: 'Tổng chi phí phải bằng chi phí y tế + trả lương + bồi thường',
      path: ['totalCost'],
    }
  );

export const accidentCaseDetailSchema = victimCountSchema
  .merge(damageCostSchema)
  .extend({
    id: z.string().optional(),
    causeCategoryId: z.string().min(1, 'Vui lòng chọn nguyên nhân xảy ra TNLĐ'),
    injuryFactorCategoryId: z.string().min(1, 'Vui lòng chọn yếu tố gây chấn thương'),
    occupationCategoryId: z.string().min(1, 'Vui lòng chọn nghề nghiệp'),
  })
  .refine((data) => data.femaleVictims <= data.totalVictims, {
    message: 'Tổng số lao động nữ bị nạn không được lớn hơn tổng số người bị nạn',
    path: ['femaleVictims'],
  })
  .refine((data) => data.fatalVictims <= data.totalVictims, {
    message: 'Tổng số người bị chết không được lớn hơn tổng số người bị nạn',
    path: ['fatalVictims'],
  })
  .refine((data) => data.severelyInjuredVictims <= data.totalVictims, {
    message: 'Tổng số người bị thương nặng không được lớn hơn tổng số người bị nạn',
    path: ['severelyInjuredVictims'],
  })
  .refine((data) => data.unmanagedVictims <= data.totalVictims, {
    message: 'Số người bị nạn không QL không được lớn hơn tổng số người bị nạn',
    path: ['unmanagedVictims'],
  })
  .refine((data) => data.unmanagedFemaleVictims <= data.unmanagedVictims, {
    message: 'Số lao động nữ bị nạn không QL không được lớn hơn số người bị nạn không QL',
    path: ['unmanagedFemaleVictims'],
  })
  .refine((data) => data.unmanagedFatalVictims <= data.unmanagedVictims, {
    message: 'Số người chết không QL không được lớn hơn số người bị nạn không QL',
    path: ['unmanagedFatalVictims'],
  })
  .refine((data) => data.unmanagedSeverelyInjured <= data.unmanagedVictims, {
    message: 'Số người bị thương nặng không QL không được lớn hơn số người bị nạn không QL',
    path: ['unmanagedSeverelyInjured'],
  });

type CompanyWorkforce = {
  totalEmployees: number;
  totalFemaleEmployees: number;
};

type VictimMetrics = Pick<
  FullAccidentMetrics,
  | 'totalVictims'
  | 'femaleVictims'
  | 'fatalVictims'
  | 'severelyInjuredVictims'
  | 'unmanagedVictims'
  | 'unmanagedFemaleVictims'
  | 'unmanagedFatalVictims'
  | 'unmanagedSeverelyInjured'
>;

const DETAIL_SUM_FIELDS = [
  'totalVictims',
  'femaleVictims',
  'fatalVictims',
  'severelyInjuredVictims',
  'unmanagedVictims',
  'unmanagedFemaleVictims',
  'unmanagedFatalVictims',
  'unmanagedSeverelyInjured',
  'medicalCost',
  'treatmentSalaryCost',
  'compensationCost',
  'totalCost',
  'totalLeaveDays',
  'propertyDamageCost',
] as const;

type DetailSumField = (typeof DETAIL_SUM_FIELDS)[number];

const addDetailTotalIssues = (
  summary: FullAccidentMetrics,
  details: AccidentCaseDetailFormValues[],
  context: z.RefinementCtx
) => {
  DETAIL_SUM_FIELDS.forEach((field: DetailSumField) => {
    const detailsTotal = details.reduce((total, detail) => total + detail[field], 0);

    if (detailsTotal !== summary[field]) {
      context.addIssue({
        code: 'custom',
        message: `Tổng giá trị chi tiết (${detailsTotal}) phải khớp với giá trị khai báo ở bước trước (${summary[field]})`,
        path: ['generalAccidents', 'summary', field],
      });
    }
  });
};

const addWorkforceIssues = (
  metrics: VictimMetrics,
  workforce: CompanyWorkforce,
  path: (string | number)[],
  context: z.RefinementCtx
) => {
  const addIssue = (field: keyof VictimMetrics, message: string) => {
    context.addIssue({
      code: 'custom',
      message,
      path: [...path, field],
    });
  };

  if (metrics.totalVictims > workforce.totalEmployees) {
    addIssue('totalVictims', 'Số người bị nạn không được lớn hơn tổng số lao động');
  }
  if (metrics.femaleVictims > workforce.totalFemaleEmployees) {
    addIssue('femaleVictims', 'Số lao động nữ bị nạn không được lớn hơn tổng số lao động nữ');
  }
  if (metrics.fatalVictims > workforce.totalEmployees) {
    addIssue('fatalVictims', 'Số người chết không được lớn hơn tổng số lao động');
  }
  if (metrics.severelyInjuredVictims > workforce.totalEmployees) {
    addIssue(
      'severelyInjuredVictims',
      'Số người bị thương nặng không được lớn hơn tổng số lao động'
    );
  }
  if (metrics.unmanagedVictims > workforce.totalEmployees) {
    addIssue(
      'unmanagedVictims',
      'Số người bị nạn không thuộc quản lý không được lớn hơn tổng số lao động'
    );
  }
  if (metrics.unmanagedFemaleVictims > workforce.totalFemaleEmployees) {
    addIssue(
      'unmanagedFemaleVictims',
      'Số lao động nữ bị nạn không thuộc quản lý không được lớn hơn tổng số lao động nữ'
    );
  }
  if (metrics.unmanagedFatalVictims > workforce.totalEmployees) {
    addIssue(
      'unmanagedFatalVictims',
      'Số người chết không thuộc quản lý không được lớn hơn tổng số lao động'
    );
  }
  if (metrics.unmanagedSeverelyInjured > workforce.totalEmployees) {
    addIssue(
      'unmanagedSeverelyInjured',
      'Số người bị thương nặng không thuộc quản lý không được lớn hơn tổng số lao động'
    );
  }

  const managedVictims = metrics.totalVictims - metrics.unmanagedVictims;
  const managedFemaleVictims = metrics.femaleVictims - metrics.unmanagedFemaleVictims;
  const managedFatalVictims = metrics.fatalVictims - metrics.unmanagedFatalVictims;
  const managedSeverelyInjured =
    metrics.severelyInjuredVictims - metrics.unmanagedSeverelyInjured;

  if (managedVictims + metrics.unmanagedVictims > workforce.totalEmployees) {
    addIssue(
      'totalVictims',
      'Tổng số lao động có quản lý và không thuộc quản lý không được lớn hơn tổng số lao động'
    );
  }
  if (managedFemaleVictims + metrics.unmanagedFemaleVictims > workforce.totalFemaleEmployees) {
    addIssue(
      'femaleVictims',
      'Tổng số lao động nữ có quản lý và không thuộc quản lý không được lớn hơn tổng số lao động nữ'
    );
  }
  if (managedFatalVictims + metrics.unmanagedFatalVictims > workforce.totalEmployees) {
    addIssue(
      'fatalVictims',
      'Tổng số người chết có quản lý và không thuộc quản lý không được lớn hơn tổng số lao động'
    );
  }
  if (managedSeverelyInjured + metrics.unmanagedSeverelyInjured > workforce.totalEmployees) {
    addIssue(
      'severelyInjuredVictims',
      'Tổng số người bị thương nặng có quản lý và không thuộc quản lý không được lớn hơn tổng số lao động'
    );
  }
};

const addPreviousStepIssues = (
  metrics: VictimMetrics,
  previousMetrics: VictimMetrics,
  path: (string | number)[],
  context: z.RefinementCtx
) => {
  const fields: {
    field: keyof VictimMetrics;
    label: string;
  }[] = [
    { field: 'totalVictims', label: 'Tổng số người bị nạn' },
    { field: 'femaleVictims', label: 'Tổng số lao động nữ bị nạn' },
    { field: 'fatalVictims', label: 'Tổng số người bị chết' },
    { field: 'severelyInjuredVictims', label: 'Tổng số người bị thương nặng' },
    { field: 'unmanagedVictims', label: 'Số người bị nạn không QL' },
    { field: 'unmanagedFemaleVictims', label: 'Lao động nữ bị nạn không QL' },
    { field: 'unmanagedFatalVictims', label: 'Số người chết không QL' },
    { field: 'unmanagedSeverelyInjured', label: 'Người bị thương nặng không QL' },
  ];

  fields.forEach(({ field, label }) => {
    if (metrics[field] > previousMetrics[field]) {
      context.addIssue({
        code: 'custom',
        message: `${label} không được lớn hơn giá trị đã nhập ở bước trước`,
        path: [...path, field],
      });
    }
  });
};

export const laborAccidentReportSchema = z.object({
  id: z.string().optional(),
  reportYear: z.number().int('Năm phải là số nguyên').min(2000).max(2100),
  reportPeriod: z.enum(['SIX_MONTHS', 'FULL_YEAR']),
  status: z.enum(['DRAFT', 'ACCEPTED']),
  companyInfo: z
    .object({
      companyName: z.string().trim().min(1, 'Chưa có tên doanh nghiệp'),
      companyType: z.string().trim().min(1, 'Chưa có loại hình doanh nghiệp'),
      businessSector: z.string().trim().min(1, 'Chưa có ngành nghề kinh doanh'),
      totalEmployees: nonNegativeInt,
      totalFemaleEmployees: nonNegativeInt,
      totalWageFund: nonNegativeDecimal,
    })
    .refine((data) => data.totalFemaleEmployees <= data.totalEmployees, {
      message: 'Tổng số lao động nữ không được lớn hơn tổng số lao động',
      path: ['totalFemaleEmployees'],
    }),
  generalAccidents: z.object({
    summary: fullAccidentMetricsSchema,
    details: z.array(accidentCaseDetailSchema),
  }),
  article39Accidents: fullAccidentMetricsSchema,
  attachmentUrl: z.string().optional(),
  attachmentName: z.string().optional(),
}).superRefine((data, context) => {
  const workforce = {
    totalEmployees: data.companyInfo.totalEmployees,
    totalFemaleEmployees: data.companyInfo.totalFemaleEmployees,
  };

  addWorkforceIssues(data.generalAccidents.summary, workforce, ['generalAccidents', 'summary'], context);
  data.generalAccidents.details.forEach((detail, index) => {
    addWorkforceIssues(detail, workforce, ['generalAccidents', 'details', index], context);
    addPreviousStepIssues(
      detail,
      data.generalAccidents.summary,
      ['generalAccidents', 'details', index],
      context
    );
  });
  addDetailTotalIssues(
    data.generalAccidents.summary,
    data.generalAccidents.details,
    context
  );
  addWorkforceIssues(data.article39Accidents, workforce, ['article39Accidents'], context);

  if (data.generalAccidents.details.length !== data.generalAccidents.summary.totalCases) {
    context.addIssue({
      code: 'custom',
      message: 'Số dòng chi tiết phải khớp với tổng số vụ tai nạn',
      path: ['generalAccidents', 'details'],
    });
  }
});

// =========================================================
// FACTORY FUNCTIONS TẠO GIÁ TRỊ MẶC ĐỊNH
// =========================================================

export const createEmptyFullMetrics = (): FullAccidentMetrics => ({
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
  medicalCost: 0,
  treatmentSalaryCost: 0,
  compensationCost: 0,
  totalCost: 0,
  totalLeaveDays: 0,
  propertyDamageCost: 0,
});

export const createEmptyCaseDetail = (): AccidentCaseDetailFormValues => ({
  causeCategoryId: '',
  injuryFactorCategoryId: '',
  occupationCategoryId: '',
  totalVictims: 0,
  femaleVictims: 0,
  fatalVictims: 0,
  severelyInjuredVictims: 0,
  unmanagedVictims: 0,
  unmanagedFemaleVictims: 0,
  unmanagedFatalVictims: 0,
  unmanagedSeverelyInjured: 0,
  medicalCost: 0,
  treatmentSalaryCost: 0,
  compensationCost: 0,
  totalCost: 0,
  totalLeaveDays: 0,
  propertyDamageCost: 0,
});