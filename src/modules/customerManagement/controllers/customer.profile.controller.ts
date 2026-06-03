import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CustomerProfileService } from '../Services/customer.profile.service';
import { sendSuccess } from '../../../utils/reponse';
import asyncHandler from '../../../utils/asyncHandler';
import { successMessage } from '../../../shared_infrastructure/success/successMessages';

export class CustomerProfileController {
  getCustomerProfile = asyncHandler(async (req: Request, res: Response) => {
    const profile = await CustomerProfileService.getCustomerProfile(req.userId!);
    sendSuccess(res, successMessage.CUSTOMER_PROFILE_RETRIEVED.message, StatusCodes.OK, profile);
  });

  updateCustomerProfile = asyncHandler(async (req: Request, res: Response) => {
    const profile = await CustomerProfileService.updateCustomerProfile(req.userId!, req.body);
    sendSuccess(res, successMessage.CUSTOMER_PROFILE_UPDATED.message, StatusCodes.OK, profile);
  });

  updateEmail = asyncHandler(async (req: Request, res: Response) => {
    const profile = await CustomerProfileService.updateEmail(req.userId!, req.body);
    sendSuccess(res, successMessage.EMAIL_UPDATED.message, StatusCodes.OK, profile);
  });
}
