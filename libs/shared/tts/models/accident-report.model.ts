import { FileResponse } from "../../core/models/common.model";
import { AccidentReportPeriod, AccidentReportStatus } from "./enums";

export interface AccidentVictimStats {
  // Số vụ
  totalCases: number; // Tổng số vụ
  fatalCases: number; // Số vụ có người chết
  totalCasesWithTwoOrMoreVictims: number; // Số vụ có từ 2 người bị nạn trở lên

  // Số người bị nạn
  totalVictims: number; // Tổng số người bị nạn
  nonManagedVictims: number; // NN không thuộc quyền quản lý

  totalFemaleVictims: number; // Số LĐ nữ
  nonManagedFemaleVictims: number; // LĐ nữ không thuộc quyền quản lý

  totalFatalVictims: number; // Số người chết
  nonManagedFatalVictims: number; // Người chết không thuộc quyền quản lý

  totalSeverelyInjuredVictims: number; // Số người bị thương nặng
  nonManagedSeverelyInjuredVictims: number; // Người bị thương nặng không thuộc quyền quản lý
}

export interface AccidentStats extends AccidentVictimStats {
  medicalExpense: number; // Chi phí y tế
  salaryExpenseDuringTreatment: number; // Chi phí trả lương trong thời gian điều trị
  compensationExpense: number; // Chi phí bồi thường trợ cấp
  totalExpense: number; // Tổng số tiền chi phí
  totalDaysOff: number; // Tổng số ngày nghỉ vì TNLĐ
  propertyDamageExpense: number; // Thiệt hại tài sản
}

export interface AccidentDetail {
  accidentDetailId?: string | null;
  injuryTypeId: string; // Phân theo nguyên nhân xảy ra TNLĐ (type: INJURY_TYPE)
  injuryFactorId: string; // Phân theo yếu tố gây chấn thương (type: INJURY_FACTOR)
  occupationId: string; // Phân theo nghề nghiệp (type: OCCUPATION)

  totalVictims: number; // Tổng số người bị nạn
  totalFemaleVictims: number; // Tổng số lao động nữ bị nạn
  totalFatalVictims: number; // Số người chết
  totalSeverelyInjuredVictims: number; // Tổng số người bị thương nặng
  nonManagedVictims: number; // Số người bị nạn không QL
  nonManagedFemaleVictims: number; // Lao động nữ bị nạn không QL
  nonManagedFatalVictims: number; // Số người chết không QL
  nonManagedSeverelyInjuredVictims: number; // Người bị thương nặng không QL

  medicalExpense: number; // Chi phí y tế
  salaryExpenseDuringTreatment: number; // Chi phí trả lương trong thời gian điều trị
  compensationExpense: number; // Chi phí bồi thường trợ cấp
  totalExpense: number; // Tổng số tiền chi phí
  totalDaysOff: number; // Tổng số ngày nghỉ vì TNLĐ
  propertyDamageExpense?: number; // Thiệt hại tài sản
}

export interface ReportSummaryDamage {
  totalDaysOff: number; // Tổng số ngày nghỉ vì TNLĐ
  totalExpense: number; // Tổng số tiền chi phí (Y tế + Lương + Bồi thường)
  medicalExpense: number; // Chi phí y tế
  salaryExpenseDuringTreatment: number; // Chi phí trả lương trong thời gian điều trị
  compensationExpense: number; // Chi phí bồi thường trợ cấp
  propertyDamageExpense: number; // Thiệt hại tài sản
}

export interface ReportSummaryBusinessMetrics {
  totalBusinesses: number; // Cơ sở: Tổng số
  reportedBusinesses: number; // Cơ sở: Số cơ sở tham gia báo cáo
  totalEmployees: number; // Lực lượng lao động: Tổng số lao động
  reportedEmployees: number; // Số LĐ của cơ sở tham gia báo cáo
  femaleEmployees: number; // Số lao động nữ
  accidentFrequency: number; // Tần suất TNLĐ (KTNLĐ)
  fatalFrequency: number; // Tần suất chết người (KChết)
}

export interface ReportSummaryCategory
  extends AccidentVictimStats, Partial<ReportSummaryDamage> {
  categoryId: string; // ID danh mục
  name: string; // Tên danh mục
  code: string; // Mã danh mục
}

export interface ReportSummaryBusinessType
  extends AccidentVictimStats, ReportSummaryBusinessMetrics {
  businessTypeId: string;
  name: string; // Tên loại hình kinh doanh
  code: string;
}

export type OverallBusinessStats = AccidentVictimStats &
  ReportSummaryBusinessMetrics;

export type OverallClassificationStats = AccidentVictimStats &
  ReportSummaryDamage;

// request
export interface UpdateAccidentReportRequest {
  // Thông tin doanh nghiệp
  totalEmployees?: number | null; // Tổng số lao động của cơ sở
  femaleEmployees?: number | null; // Tổng số lao động nữ
  totalSalaryFund?: number | null; // Tổng quỹ lương

  // 1. Tai nạn lao động (tổng số vụ tai nạn lao động)
  accidentTotals?: AccidentStats | null;

  // 1. Tai nạn lao động (chi tiết tai nạn lao động)
  accidentDetails?: AccidentDetail[] | null;

  // 2. TNLĐ được hưởng trợ cấp theo Khoản 2 Điều 39 Luật ATVSLĐ
  subsidizedAccident?: AccidentStats | null;

  // Xem tổng quan báo cáo tai nạn lao động
  stampedReport?: File | null; // pdf
}

// response
export interface AccidentReportResponse {
  accidentReportId: string;
  name: string;
  taxCode: string;
  reportPeriod: AccidentReportPeriod;
  status: AccidentReportStatus;
  createdAt: string;
  updatedAt?: string | null;
}

export interface AccidentReportDetailResponse {
  year: number;
  reportPeriod: AccidentReportPeriod;
  status: AccidentReportStatus;

  // Thông tin doanh nghiệp
  companyName: string;
  businessTypeName: string;
  businessIndustryName: string;
  totalEmployees?: number | null;
  femaleEmployees?: number | null;
  totalSalaryFund?: number | null;

  // 1. Tai nạn lao động (tổng số vụ tai nạn lao động)
  accidentTotals?: AccidentStats | null;

  // 1. Tai nạn lao động (chi tiết tai nạn lao động)
  accidentDetails?: AccidentDetail[] | null;

  // 2. TNLĐ được hưởng trợ cấp theo Khoản 2 Điều 39 Luật ATVSLĐ
  subsidizedAccident?: AccidentStats | null;

  // Xem tổng quan báo cáo tai nạn lao động
  stampedReport?: FileResponse | null;
}

export interface AccidentReportSummaryResponse {
  // 1. Tai nạn lao động
  accident: AccidentStats;

  // Mục 1.1
  injuryTypes: ReportSummaryCategory[];

  // Mục 1.2
  injuryFactors: ReportSummaryCategory[];

  // Mục 1.3
  occupations: ReportSummaryCategory[];

  // Mục 2
  subsidizedAccident: AccidentStats;

  // Mục 3
  grandTotal: AccidentStats;

  // 2. Thiệt hại tai nạn lao động
  accidentDamage: ReportSummaryDamage;
}

export interface OverallAccidentReportResponse {
  year: number;

  // I. Thông tin tổng quan
  businessTypes: ReportSummaryBusinessType[];
  total1: OverallBusinessStats;

  // II. Phân loại TNLĐ
  injuryTypes: ReportSummaryCategory[];
  injuryFactors: ReportSummaryCategory[];
  occupations: ReportSummaryCategory[];
  total2: OverallClassificationStats;
}
