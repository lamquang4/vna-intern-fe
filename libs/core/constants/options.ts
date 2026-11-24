import {
  Gender,
  AccidentReportPeriod,
  AccidentReportStatus,
} from "@/libs/shared/tts/models/enums";

export const GENDER_OPTIONS = [
  { value: Gender.MALE, label: "Nam" },
  { value: Gender.FEMALE, label: "Nữ" },
];

export const USER_STATUS_OPTIONS = [
  { value: "true", label: "Hoạt động" },
  { value: "false", label: "Ngừng hoạt động" },
];

export const ACCIDENT_REPORT_STATUS_OPTIONS = [
  { value: AccidentReportStatus.ACCEPTED, label: "Đã tiếp nhận" },
  { value: AccidentReportStatus.PENDING, label: "Chờ báo cáo" },
  { value: AccidentReportStatus.IN_PROGRESS, label: "Đang báo cáo" },
  { value: AccidentReportStatus.APPROVED, label: "Đã phê duyệt" },
  { value: AccidentReportStatus.DECLINED, label: "Đã từ chối" },
  { value: AccidentReportStatus.EXPIRED, label: "Đã quá hạn" },
];

export const ACCIDENT_REPORT_PERIOD_OPTIONS = [
  { value: AccidentReportPeriod.FULL_YEAR, label: "Cả năm" },
  { value: AccidentReportPeriod.SIX_MONTHS, label: "6 tháng" },
];

export const ACCIDENT_REPORT_STEP_OPTIONS = [
  { value: "0", label: "Thông tin doanh nghiệp" },
  { value: "1", label: "Tai nạn lao động (Tổng số vụ tai nạn lao động)" },
  { value: "2", label: "Tai nạn lao động (Chi tiết các vụ tai nạn lao động)" },
  {
    value: "3",
    label:
      "Tai nạn lao động được thưởng trợ cấp theo quy định tại Khoản 2 Điều 39 Luật ATVSLĐ",
  },
  { value: "4", label: "Xem tổng quan báo cáo tại nạn lao động" },
];

export const YEAR_OPTIONS = (startYear = 2026) => {
  const currentYear = new Date().getFullYear();

  return Array.from({ length: currentYear - startYear + 1 }, (_, index) => {
    const year = currentYear - index;

    return {
      value: String(year),
      label: String(year),
    };
  });
};
