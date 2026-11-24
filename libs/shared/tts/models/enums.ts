export const Gender = {
  MALE: "MALE",
  FEMALE: "FEMALE",
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];

export const RoleCode = {
  SO: "SO",
  DOANH_NGHIEP: "DOANH_NGHIEP",
} as const;

export type RoleCode = (typeof RoleCode)[keyof typeof RoleCode];

export const CategoryType = {
  INJURY_FACTOR: "INJURY_FACTOR", // Yếu tố chấn thương
  INJURY_TYPE: "INJURY_TYPE", // Loại chấn thương
  OCCUPATION: "OCCUPATION", // Danh mục nghề nghiệp
} as const;

export type CategoryType = (typeof CategoryType)[keyof typeof CategoryType];

export const AccidentReportStatus = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  ACCEPTED: "ACCEPTED",
  APPROVED: "APPROVED",
  DECLINED: "DECLINED",
  EXPIRED: "EXPIRED",
} as const;

export type AccidentReportStatus =
  (typeof AccidentReportStatus)[keyof typeof AccidentReportStatus];

export const AccidentReportReviewStatus = {
  APPROVED: AccidentReportStatus.APPROVED,
  DECLINED: AccidentReportStatus.DECLINED,
} as const;

export type AccidentReportReviewStatus =
  (typeof AccidentReportReviewStatus)[keyof typeof AccidentReportReviewStatus];

export const AccidentReportPeriod = {
  SIX_MONTHS: "SIX_MONTHS",
  FULL_YEAR: "FULL_YEAR",
} as const;

export type AccidentReportPeriod =
  (typeof AccidentReportPeriod)[keyof typeof AccidentReportPeriod];
