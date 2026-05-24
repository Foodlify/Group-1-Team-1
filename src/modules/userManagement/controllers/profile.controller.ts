import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ProfileService } from '../services/profile.service';
import { sendSuccess } from '../../../utils/reponse';
import asyncHandler from '../../../utils/asyncHandler';

export class ProfileController {
  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const profile = await ProfileService.getProfile(req.userId!);
    sendSuccess(res, 'Profile retrieved successfully', StatusCodes.OK, profile);
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const profile = await ProfileService.updateProfile(req.userId!, req.body);
    sendSuccess(res, 'Profile updated successfully', StatusCodes.OK, profile);
  });
}
