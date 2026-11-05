export type EmailOtpPurpose =
  | "CHANGE_EMAIL"
  | "REGISTER_ENTERPRISE"
  | "FORGOT_PASSWORD";

// Request

// đăng nhập
export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

// Đổi mật khẩu
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// Khởi tạo mật khẩu
export interface InitializePasswordRequest {
  password: string;
}

// Gửi và gửi lại otp đến email
export interface EmailOtpRequest {
  email: string;
  purpose: EmailOtpPurpose;
}

// Quên mật khẩu

export interface ResetPasswordRequest {
  email: string;
  otpCode: string;
  newPassword: string;
  confirmNewPassword: string;
}

// Thay đổi email
export interface VerifyChangeEmailOtpRequest {
  email: string;
  otpCode: string;
}

export interface ChangeEmailRequest {
  newEmail: string;
}

// Đăng ký tài khoản doanh nghiệp
export interface VerifyRegisterEnterpriseEmailOtpRequest {
  email: string;
  otpCode: string;
}

// response
export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  tokenType: "Bearer";
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number; // giây thời hạn của access token
}

// JWT
export interface AccessTokenPayload {
  sub: string; // user id
  sid: string; // session id
  username: string;
  role: string;
  type: "access";
  iss: string;
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  sub: string;
  sid: string;
  type: "refresh";
  role: string;
  iss: string;
  iat: number;
  exp: number;
}
