import { Response } from 'express';

export const sendSuccess = (
  res: Response,
  // DATA IS OPTIONAL MUST ADD AS LAST PARAMETER
  message = 'Success',
  statusCode: number,
  data?: unknown,
) => {
  console.log(data);
  res.status(statusCode).json({ status: 'success', message, data });
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  code: string,
) => {
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
};
