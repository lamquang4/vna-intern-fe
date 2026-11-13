export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
];
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export const MIME_PDF = "application/pdf";
export const MIME_DOC = "application/msword";
export const MIME_DOCX =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  ...ALLOWED_IMAGE_MIME_TYPES,
  MIME_PDF,
  MIME_DOC,
  MIME_DOCX,
];

export const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_ACCIDENT_REPORT_PDF_SIZE = 15 * 1024 * 1024; // 15MB

export const OTP_LENGTH = 6;
export const OTP_EXPIRE_SECONDS = 5 * 60; // 5 phút
export const OTP_RESEND_COOLDOWN_SECONDS = 3 * 60; // 3 phút

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;
export const DEFAULT_PASSWORD = "12345678";

export const MAX_EMAIL_LENGTH = 255;
export const MAX_ENTERPRISE_EMAIL_LENGTH = 254;
export const MAX_FULLNAME_LENGTH = 100;
export const MAX_POSITION_LENGTH = 100;
export const MAX_ADDRESS_LENGTH = 255;
export const MAX_ENTERPRISE_ADDRESS_LENGTH = 500;
export const MAX_ENTERPRISE_PROVINCE_LENGTH = 150;

export const MAX_ENTERPRISE_NAME_LENGTH = 200;
export const MAX_FOREIGN_NAME_LENGTH = 200;
export const MAX_BUSINESS_LOCATION_LENGTH = 500;
export const MAX_REPRESENTATIVE_LENGTH = 150;
export const MAX_PHONE_LENGTH = 30;

export const MAX_ACCIDENT_DETAILS = 20; // số vụ chi tiết tối đa khi khai báo TNLĐ
export const MAX_REVIEW_NOTE_LENGTH = 500;
