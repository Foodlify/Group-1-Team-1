import { Request, Response } from 'express';
import { CustomerService } from '../Services/customer.service';
import { StatusCodes } from 'http-status-codes';
import { InvalidCredentials } from '../customer.exception';
import { sendSuccess } from '../../../utils/reponse';
import asyncHandler from '../../../utils/asyncHandler';
import { successMessage } from '../../../shared_infrastructure/success/successMessages';
import { setAuthCookies, setAccessTokenCookie, clearAuthCookies } from '../../../shared_infrastructure/http/cookie.utils';

export class CustomerController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await CustomerService.register(req.body);
    sendSuccess(res, successMessage.CUSTOMER_REGISTERED.message, StatusCodes.CREATED, result.user);
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await CustomerService.login(req.body);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    sendSuccess(res, successMessage.lOGIN_SUCCEED.message, StatusCodes.OK);
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) throw new InvalidCredentials('Refresh token missing');
    const result = await CustomerService.refreshToken({ refreshToken });
    setAccessTokenCookie(res, result.accessToken);
    sendSuccess(res, successMessage.TOKEN_REFRESHED.message, StatusCodes.OK);
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    await CustomerService.logout(req.userId!);
    clearAuthCookies(res);
    sendSuccess(res, successMessage.CUSTOMER_LOGGED_OUT.message, StatusCodes.OK);
  });

  revokeRefreshToken = asyncHandler(async (req: Request, res: Response) => {
    await CustomerService.logout(req.userId!);
    clearAuthCookies(res);
    sendSuccess(res, successMessage.REFRESH_TOKEN_REVOKED.message, StatusCodes.OK);
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    await CustomerService.forgotPassword(req.body);
    sendSuccess(res, successMessage.FORGOT_PASSWORD_LINK_SENT.message, StatusCodes.OK);
  });

  resetPasswordFromLink = asyncHandler(async (req: Request, res: Response) => {
    await CustomerService.resetPasswordFromLink(req.body);
    sendSuccess(res, successMessage.PASSWORD_RESET_FROM_LINK_SUCCESS.message, StatusCodes.OK);
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    await CustomerService.changePassword(req.userId!, req.body);
    sendSuccess(res, successMessage.PASSWORD_CHANGED_SUCCESS.message, StatusCodes.OK);
  });
}
