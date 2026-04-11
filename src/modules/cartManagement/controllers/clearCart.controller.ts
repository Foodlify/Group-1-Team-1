
import { Request, Response } from 'express';

export const clearCartController = (req: Request, res: Response) => {
  res.status(200).json({
    message: '',
  });
};
