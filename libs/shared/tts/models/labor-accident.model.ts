export type ReportPeriod = 'SIX_MONTHS' | 'FULL_YEAR'; // 6 tháng | Cả năm
export type ReportStatus = 'PENDING' | 'IN_PROGRESS' | 'ACCEPTED';

/**
 * 4 Mục trong Dropdown "Chọn mục báo cáo" (Popup danh mục báo cáo TNLĐ - Màn 26.1)
 */
export type ReportSectionKey =
  | 'COMPANY_INFO'         // Thông tin doanh nghiệp
  | 'GENERAL_ACCIDENTS'    // 1. Tai nạn lao động
  | 'ARTICLE_39_ALLOWANCE' // 2. Tai nạn lao động được hưởng trợ cấp theo quy định tại Khoản 2 Điều 39 Luật ATVSLĐ
  | 'OVERVIEW';            // Xem tổng quan báo cáo tai nạn lao động

export type GeneralAccidentSubTab = 'SUMMARY' | 'DETAILS'; // Tab (1) và Tab (2) ở Màn 26.2 & 26.3

/**
 * Danh mục dùng cho 3 Dropdown ở Màn 26.3 & Group dòng ở Màn 26.5
 */
export type AccidentCategoryType = 'CAUSE' | 'INJURY_FACTOR' | 'OCCUPATION';
export type CauseParentGroup = 'EMPLOYER' | 'EMPLOYEE' | 'OBJECTIVE'; // a. Do NSDLĐ | b. Do NLĐ | Khách quan

export interface MasterAccidentCategoryDto {
  id: string;
  code: string; // VD: "1".."9", "101", "102", "103"
  name: string; // VD: "Không có thiết bị an toàn...", "Thiết bị nâng"
  type: AccidentCategoryType;
  parentGroup?: CauseParentGroup;
}

// =========================================================
// CÁC KHỐI DỮ LIỆU CƠ SỞ (REUSABLE BLOCKS)
// =========================================================

/** 3 ô thống kê Số vụ (Dùng ở 26.2, 26.4, 26.5) */
export interface CaseCountMetrics {
  totalCases: number;          // Tổng số vụ
  fatalCases: number;          // Tổng số vụ có người chết
  multipleVictimCases: number; // Tổng số vụ có 2 người bị nạn trở lên
}

/** 8 ô thống kê Người bị nạn (Dùng ở 26.2, 26.3, 26.4, 26.5) */
export interface VictimCountMetrics {
  totalVictims: number;             // Tổng số người bị nạn
  femaleVictims: number;            // Tổng số lao động nữ bị nạn
  fatalVictims: number;             // Tổng số người bị chết
  severelyInjuredVictims: number;   // Tổng số người bị thương nặng
  unmanagedVictims: number;         // Số người bị nạn không QL
  unmanagedFemaleVictims: number;   // Lao động nữ bị nạn không QL
  unmanagedFatalVictims: number;    // Số người chết không QL
  unmanagedSeverelyInjured: number; // Người bị thương nặng không QL
}

/** 6 ô Thiệt hại do TNLĐ (Dùng ở 26.2, 26.3, 26.4, 26.5) - Đơn vị: 1.000đ */
export interface DamageCostMetrics {
  medicalCost: number;         // Chi phí y tế
  treatmentSalaryCost: number; // Chi phí trả lương trong thời gian điều trị
  compensationCost: number;    // Chi phí bồi thường trợ cấp
  totalCost: number;           // Tổng số tiền chi phí (Auto-sum: Y tế + Trả lương + Bồi thường)
  totalLeaveDays: number;      // Tổng số ngày nghỉ vì TNLĐ
  propertyDamageCost: number;  // Thiệt hại tài sản
}

/** Gộp đầy đủ 17 trường cho Màn 26.2 (Tab 1) và Màn 26.4 */
export type FullAccidentMetrics = CaseCountMetrics & VictimCountMetrics & DamageCostMetrics;

// =========================================================
// MODELS CHO TỪNG MÀN HÌNH
// =========================================================

/** Màn 26: Item hiển thị trên bảng danh sách */
export interface ReportListItemDto {
  id: string;
  companyName: string;
  taxCode: string;
  reportYear: number;
  reportPeriod: ReportPeriod;
  status: ReportStatus;
}

/** Màn 26.1: Thông tin công ty */
export interface CompanyInfoFormValues {
  // Readonly từ thông tin DN
  companyName: string;
  companyType: string;
  businessSector: string;
  // User nhập (*)
  totalEmployees: number;
  totalFemaleEmployees: number;
  totalWageFund: number; // Đơn vị: 1.000đ
}

/** Màn 26.3: Chi tiết 1 vụ tai nạn (1 phần tử trong mảng accordion) */
export interface AccidentCaseDetailFormValues extends VictimCountMetrics, DamageCostMetrics {
  id?: string;
  causeCategoryId: string;        // 1. Phân theo nguyên nhân xảy ra TNLĐ
  injuryFactorCategoryId: string; // 2. Phân theo yếu tố gây chấn thương
  occupationCategoryId: string;   // 3. Phân theo nghề nghiệp
}

/** Toàn bộ State của Form Báo cáo (Dùng cho React Hook Form) */
export interface LaborAccidentReportFormValues {
  id?: string;
  reportYear: number;
  reportPeriod: ReportPeriod;
  status: ReportStatus;
  companyInfo: CompanyInfoFormValues;
  generalAccidents: {
    summary: FullAccidentMetrics;            // Màn 26.2
    details: AccidentCaseDetailFormValues[]; // Màn 26.3
  };
  article39Accidents: FullAccidentMetrics;   // Màn 26.4
  attachmentUrl?: string;                    // Màn 26.5 & 26.6 (baocaoTNLD.pdf)
  attachmentName?: string;
  attachmentFile?: File;
}

/** Dòng hiển thị trên Bảng tổng hợp ở Màn 26.5 & 26.6 */
export interface OverviewTableRow extends CaseCountMetrics, VictimCountMetrics {
  key: string;
  label: string;        // Tên chỉ tiêu thống kê
  code?: string;        // Mã số (1..9, 101, 102, 10...)
  rowType: 'SECTION_HEADER' | 'SUB_HEADER' | 'DATA_ROW' | 'TOTAL_ROW';
}