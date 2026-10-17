// Request
// đăng nhập
export interface LoginRequest {
  username: string;
  password: string;
  remember_me?: boolean;
}

// Quên mật khẩu
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResendForgotPasswordOtpRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp_code: string;
  new_password: string;
  confirm_new_password: string;
}

// Đổi mật khẩu
export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  confirm_new_password: string;
}

// Thay đổi email
export interface VerifyChangeEmailOtpRequest {
  otp_code: string;
}

export interface ChangeEmailRequest {
  new_email: string;
}

// refresh token
export interface RefreshTokenRequest {
  refresh_token: string;
}

// response
export interface LoginResponse {
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

// JWT
export interface AccessTokenPayload {
  sub: string; // user_id
  session_id: string;
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  sub: string; // user_id
  iat: number;
  exp: number;
}
