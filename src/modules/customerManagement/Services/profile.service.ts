import prisma from "../../../../lib/prisma";
import { CustomerRepository } from "../Repositories/customer.repository";
import { BAD_REQUEST, NOT_FOUND } from "../../../shared_infrastructure/error/error.execption";
import { Prisma } from "@prisma/client";
import loggerService from "../../../shared_infrastructure/logger/logger";
import { ProfileData } from "../../cartManagement/cart.model";
import { sendSuccess } from "../../../utils/reponse";

export class profileService{
static async getUserProfile(
     userId: number ,
      db: Prisma.TransactionClient = prisma,
    ){
     const user = await CustomerRepository.findUserById(userId, db); 
     if (user){
     loggerService.info('User profile data : ', user); 
     return user.email  , user.name ;
     }
     else {
        loggerService.warn('User not found '); 
     }
}
static async updateUserProfile(
   input: ProfileData,
   db: Prisma.TransactionClient = prisma, 
){
    const {userId , name , password } = input; 
const user = await CustomerRepository.findUserById(userId, db); 
if (user){
    if (password){
        const newPassword = CustomerRepository.updateUserPassword(userId, password); 
        return newPassword ; 
    }
    if (name){
        const newName = CustomerRepository.updateUserName(userId, name); 
        return newName ; 
    } 
}else {
    loggerService.warn('Unable to update your data'); 
}
}
}