import { Response } from 'express';

const COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
  res.cookie('accessToken',  accessToken,  COOKIE_OPTS);
  res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
}

export function setAccessTokenCookie(res: Response, accessToken: string): void {
  res.cookie('accessToken', accessToken, COOKIE_OPTS);
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
}
