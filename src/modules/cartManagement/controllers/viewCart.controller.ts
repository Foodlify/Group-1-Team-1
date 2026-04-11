import { Request, Response } from 'express';

export const viewCartController = (req: Request, res: Response) => {
  res.status(200).json({
    message: '',
  });
};
