import { Request, Response, NextFunction } from 'express';
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

    //   res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: "strict",
    // });

    sendSuccess(res, successMessage.lOGIN_SUCCEED.message, StatusCodes.OK, {
      accessToken: result.accessToken,
      // refreshToken: result.refreshToken
    });
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    // const refreshToken = req.cookies.refreshToken;
    const result = await CustomerService.refreshToken(req.body);
    sendSuccess(
      res,
      successMessage.TOKEN_REFRESHED.message,
      StatusCodes.OK,
      result,
    );
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.customerId;
    if (!customerId) {
      throw new InvalidCredentials('Unauthorized');
    }
    const result = await CustomerService.logout(customerId);
    sendSuccess(
      res,
      successMessage.CUSTOMER_LOGGED_OUT.message,
      StatusCodes.OK,
    );
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const result = await CustomerService.forgotPassword(req.body);
    sendSuccess(
      res,
      successMessage.FORGOT_PASSWORD_LINK_SENT.message,
      StatusCodes.OK,
    );
  });

  resetPasswordFromLink = asyncHandler(async (req: Request, res: Response) => {
    const result = await CustomerService.resetPasswordFromLink(req.body);
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
    const result = await CustomerService.changePassword(userId, req.body);
    sendSuccess(
      res,
      successMessage.PASSWORD_CHANGED_SUCCESS.message,
      StatusCodes.OK,
    );
  });
}
