import { Request, Response } from 'express';

export const addToCartController = (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Item added',
  });
};
