import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserAuthService } from '../services/auth.service';
import { sendSuccess } from '../../../utils/reponse';
import asyncHandler from '../../../utils/asyncHandler';

const COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

export class UserAuthController {
  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await UserAuthService.login(req.body);

    res.cookie('accessToken',  result.accessToken,  { ...COOKIE_OPTS, maxAge: 2 * 24 * 60 * 60 * 1000 });
    res.cookie('refreshToken', result.refreshToken, { ...COOKIE_OPTS, maxAge: 4 * 24 * 60 * 60 * 1000 });

    sendSuccess(res, 'Login successful', StatusCodes.OK);
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Refresh token missing' });
      return;
    }

    const result = await UserAuthService.refreshToken(refreshToken);

    res.cookie('accessToken', result.accessToken, { ...COOKIE_OPTS, maxAge: 2 * 24 * 60 * 60 * 1000 });
    sendSuccess(res, 'Token refreshed', StatusCodes.OK);
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    await UserAuthService.logout(req.userId!);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    sendSuccess(res, 'Logged out successfully', StatusCodes.OK);
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    await UserAuthService.forgotPassword(req.body);
    sendSuccess(res, 'If the email exists, a reset link will be sent', StatusCodes.OK);
  });

  resetPasswordFromLink = asyncHandler(async (req: Request, res: Response) => {
    await UserAuthService.resetPasswordFromLink(req.body);
    sendSuccess(res, 'Password reset successfully', StatusCodes.OK);
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    await UserAuthService.changePassword(req.userId!, req.body);
    sendSuccess(res, 'Password changed successfully', StatusCodes.OK);
  });
}
