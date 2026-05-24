import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserService } from '../services/user.service';
import { sendSuccess } from '../../../utils/reponse';
import asyncHandler from '../../../utils/asyncHandler';

export class UserController {
  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const users = await UserService.getAllUsers();
    sendSuccess(res, 'Users retrieved successfully', StatusCodes.OK, users);
  });

  getOne = asyncHandler(async (req: Request, res: Response) => {
    const user = await UserService.getUser(Number(req.params.id));
    sendSuccess(res, 'User retrieved successfully', StatusCodes.OK, user);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const user = await UserService.createUser(req.body);
    sendSuccess(res, 'User created successfully', StatusCodes.CREATED, user);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const user = await UserService.updateUser(Number(req.params.id), req.body);
    sendSuccess(res, 'User updated successfully', StatusCodes.OK, user);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await UserService.deleteUser(Number(req.params.id));
    sendSuccess(res, 'User deleted successfully', StatusCodes.OK);
  });
}
