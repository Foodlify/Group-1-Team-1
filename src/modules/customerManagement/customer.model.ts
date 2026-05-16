// ─── Input Interfaces ────────────────────────────────────────────────────────

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  dob?: string;
  gender?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordFromLinkInput {
  token: string;
  newPassword: string;
}

export interface ChangePasswordInput {
  oldPassword: string;
  newPassword: string;
}

// ─── Response Interfaces ──────────────────────────────────────────────────────

export interface UserResponseData {
  id: number;
  customerId?: number;
  name: string;
  email: string;
  phone?: string | null;
}

export interface RegisterResponse {
  user: UserResponseData;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface LogoutResponse {
  // Empty as message is handled by controller
}

export interface ForgotPasswordResponse {
  // Empty as message is handled by controller
}

export interface ResetPasswordFromLinkResponse {
  // Empty as message is handled by controller
}

export interface ChangePasswordResponse {
  // Empty as message is handled by controller
}
