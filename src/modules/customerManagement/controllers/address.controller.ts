import { Request, Response } from 'express';
//import { AddressService } from '../Services/customer.service';
import { AddressService } from '../Services/address.service';
import { StatusCodes } from 'http-status-codes';
import { InvalidCredentials } from '../customer.execption';
import { sendSuccess , sendError} from '../../../utils/reponse';
import asyncHandler from '../../../utils/asyncHandler';
import { successMessage } from '../../../shared_infrastructure/success/successMessages';
import {
  BAD_REQUEST,
  NOT_FOUND,
} from '../../../shared_infrastructure/error/error.execption';
import { createAddressData } from '../Repositories/address.repository';

export class AddressController{

  addAddress = asyncHandler(async(req: Request , res: Response ) => {
   const customerId = req.customerId!;
    const { country, city, street, postalCode } = req.body;
    
    try{
        const addressData = await AddressService.createAddressByCustomerId(
            customerId, 
            { country, city, street, postalCode }
        ); 
      //  return sendSuccess(res, successMessage.ADDRESS_CREATED, addressData) 
        return sendSuccess(res, `Address created Successfully` ,StatusCodes.CREATED , addressData);
    }catch(err){
 if (err instanceof NOT_FOUND) {
         sendError(res, err.statusCode, err.code, err.message);
       } else {
         throw err;
       }
    }
  }) ;
}