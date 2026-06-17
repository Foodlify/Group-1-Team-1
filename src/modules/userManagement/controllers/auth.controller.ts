import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserAuthService } from '../services/auth.service';
import { sendSuccess } from '../../../utils/reponse';
import asyncHandler from '../../../utils/asyncHandler';
import { successMessage } from '../../../shared_infrastructure/success/successMessages';
import { setAuthCookies, setAccessTokenCookie, clearAuthCookies } from '../../../shared_infrastructure/http/cookie.utils';

export class UserAuthController {
  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await UserAuthService.login(req.body);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    sendSuccess(res, successMessage.DASHBOARD_LOGIN_SUCCEED.message, StatusCodes.OK);
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Refresh token missing' });
      return;
    }
    const result = await UserAuthService.refreshToken(refreshToken);
    setAccessTokenCookie(res, result.accessToken);
    sendSuccess(res, successMessage.TOKEN_REFRESHED.message, StatusCodes.OK);
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    await UserAuthService.logout(req.userId!);
    clearAuthCookies(res);
    sendSuccess(res, successMessage.DASHBOARD_LOGGED_OUT.message, StatusCodes.OK);
  });

  revokeRefreshToken = asyncHandler(async (req: Request, res: Response) => {
    await UserAuthService.logout(req.userId!);
    clearAuthCookies(res);
    sendSuccess(res, successMessage.REFRESH_TOKEN_REVOKED.message, StatusCodes.OK);
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    await UserAuthService.forgotPassword(req.body);
    sendSuccess(res, successMessage.FORGOT_PASSWORD_LINK_SENT.message, StatusCodes.OK);
  });

  resetPasswordFromLink = asyncHandler(async (req: Request, res: Response) => {
    await UserAuthService.resetPasswordFromLink(req.body);
    sendSuccess(res, successMessage.PASSWORD_RESET_FROM_LINK_SUCCESS.message, StatusCodes.OK);
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    await UserAuthService.changePassword(req.userId!, req.body);
    sendSuccess(res, successMessage.PASSWORD_CHANGED_SUCCESS.message, StatusCodes.OK);
  });
}
