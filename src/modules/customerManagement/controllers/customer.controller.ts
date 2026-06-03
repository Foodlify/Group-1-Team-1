import { Request, Response } from 'express';
import { CustomerService } from '../Services/customer.service';
import { StatusCodes } from 'http-status-codes';
import { InvalidCredentials } from '../customer.execption';
import { sendSuccess } from '../../../utils/reponse';
import asyncHandler from '../../../utils/asyncHandler';
import { successMessage } from '../../../shared_infrastructure/success/successMessages';

export class CustomerController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await CustomerService.register(req.body);
    sendSuccess(
      res,
      successMessage.CUSTOMER_REGISTERED.message,
      StatusCodes.CREATED,
      result.user,
    );
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await CustomerService.login(req.body);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
    };

    res.cookie('accessToken', result.accessToken, {
      ...cookieOptions,
      maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
    });

    res.cookie('refreshToken', result.refreshToken, {
      ...cookieOptions,
      maxAge: 4 * 24 * 60 * 60 * 1000, // 4 days
    });

    sendSuccess(res, successMessage.lOGIN_SUCCEED.message, StatusCodes.OK);
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new InvalidCredentials('Refresh token missing');
    }

    const result = await CustomerService.refreshToken({ refreshToken });

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, successMessage.TOKEN_REFRESHED.message, StatusCodes.OK);
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.customerId;
    if (!customerId) {
      throw new InvalidCredentials('Unauthorized');
    }
    await CustomerService.logout(customerId);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    sendSuccess(res, successMessage.CUSTOMER_LOGGED_OUT.message, StatusCodes.OK);
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    await CustomerService.forgotPassword(req.body);
    sendSuccess(
      res,
      successMessage.FORGOT_PASSWORD_LINK_SENT.message,
      StatusCodes.OK,
    );
  });

  resetPasswordFromLink = asyncHandler(async (req: Request, res: Response) => {
    await CustomerService.resetPasswordFromLink(req.body);
    sendSuccess(
      res,
      successMessage.PASSWORD_RESET_FROM_LINK_SUCCESS.message,
      StatusCodes.OK,
    );
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId;
    if (!userId) {
      throw new InvalidCredentials('Unauthorized');
    }
    await CustomerService.changePassword(userId, req.body);
    sendSuccess(
      res,
      successMessage.PASSWORD_CHANGED_SUCCESS.message,
      StatusCodes.OK,
    );
  });

  revokeRefreshToken = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.customerId;
    if (!customerId) {
      throw new InvalidCredentials('Unauthorized');
    }
    await CustomerService.revokeRefreshToken(customerId);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    sendSuccess(res, successMessage.REFRESH_TOKEN_REVOKED.message, StatusCodes.OK);
  });

}
