import { Request, Response } from 'express';
import { sendError, sendSuccess } from '../../../utils/reponse';
import asyncHandler from '../../../utils/asyncHandler';
import { StatusCodes } from 'http-status-codes';

import { successMessage } from '../../../shared_infrastructure/success/successMessages';
import { profileService } from '../Services/profile.service';
import { ProfileData } from '../../cartManagement/cart.model';


export class ProfileController {
    getProfileInfo = asyncHandler(async(req: Request, res: Response) => {
        const userId = req.userId as number ; 
        try {
            const profile = await profileService.getUserProfile(userId);
            sendSuccess(
                res,
                successMessage.GET_PROFILE_INFO.message, 
                StatusCodes.OK, 
                profile,
            ) ; 
        }catch(err){
         if (err)
         {
            sendError(res,StatusCodes.NOT_FOUND , "User Does Not exist", "Failed" ); 
         }else {
            throw err ;
         }
        }
    }); 

    updateProfile = asyncHandler(async(req: Request, res: Response) => {
     
    const input = req.body as ProfileData;
     try{
      const updatedData = await profileService.updateUserProfile(input); 
      sendSuccess(res, successMessage.RECORD_updated.message, StatusCodes.OK ,updatedData ); 
     }catch(err){
      throw err; 
     }
    }); 

}