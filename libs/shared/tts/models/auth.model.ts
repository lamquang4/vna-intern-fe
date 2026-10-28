// Request
// đăng nhập
export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

// Quên mật khẩu
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otpCode: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ResendForgotPasswordOtpRequest {
  email: string;
}

// Đổi mật khẩu
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// Thay đổi email
export interface VerifyChangeEmailOtpRequest {
  otpCode: string;
}

export interface ChangeEmailRequest {
  newEmail: string;
}

export interface InitializePasswordRequest {
  password: string;
}

// response
export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  tokenType: "Bearer";
  user: {
    id: string;
    username: string;
    role: string;
  };
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
  iss: string;
  iat: number;
  exp: number;
}
