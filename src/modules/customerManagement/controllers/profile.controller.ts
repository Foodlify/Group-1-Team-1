import { Request, Response } from 'express';
import { sendError, sendSuccess } from '../../../utils/reponse';
import asyncHandler from '../../../utils/asyncHandler';
import { StatusCodes } from 'http-status-codes';

import { successMessage } from '../../../shared_infrastructure/success/successMessages';
import { CustomerProfileService } from '../Services/customer.profile.service';
//import { ProfileData } from '../../cartManagement/cart.model'; 
//{ ProfileData } from '../../cartManagement/cart.model';


export class ProfileController {
    getProfileInfo = asyncHandler(async(req: Request, res: Response) => {
        const userId = req.userId as number ; 
        try {
            const profile = await CustomerProfileService.getCustomerProfile(userId);
            sendSuccess(
                res,
                successMessage.CUSTOMER_PROFILE_RETRIEVED.message, 
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
     const userId = req.userId as number;
    const input = req.body ;
     try{
      const updatedData = await CustomerProfileService.updateCustomerProfile(userId,input); 
      sendSuccess(res, successMessage.RECORD_updated.message, StatusCodes.OK ,updatedData ); 
     }catch(err){
      throw err; 
     }
    }); 

}