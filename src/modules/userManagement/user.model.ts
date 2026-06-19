import { RoleEnum } from '@prisma/client';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface DashboardLoginInput {
  email:    string;
  password: string;
}

export interface DashboardLoginResponse {
  accessToken:  string;
  refreshToken: string;
}

export interface DashboardRefreshTokenResponse {
  accessToken:  string;
  refreshToken: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordFromLinkInput {
  token:       string;
  newPassword: string;
}

export interface ChangePasswordInput {
  oldPassword: string;
  newPassword: string;
}

// ─── User CRUD ────────────────────────────────────────────────────────────────

export interface CreateUserInput {
  name:     string;
  email:    string;
  password: string;
  role:     RoleEnum;
}

export interface UpdateUserInput {
  name?:  string;
  email?: string;
}

export interface UpdateProfileInput {
  name?: string;
}

// ─── Responses ────────────────────────────────────────────────────────────────

export interface DashboardUserResponse {
  id:    number;
  name:  string;
  email: string;
  role:  RoleEnum;
}

