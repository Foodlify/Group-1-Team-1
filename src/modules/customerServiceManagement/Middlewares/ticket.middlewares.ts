import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  createTicketSchema,
  getTicketSchema,
  updateTicketSchema,
  resolveTicketSchema,
} from '../Validations/ticket.validation';

export const validateCreateTicket = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = createTicketSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Validation failed',
      errors: result.error.issues,
    });
  }
  next();
};
export const validateGetTicket = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = req.params.id;
  const result = getTicketSchema.safeParse({ ticketId: id });
  if (!result.success) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Validation failed',
      errors: result.error.issues,
    });
  }
  next();
};
export const validateUpdateTicket = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = req.params.id;
  const result = updateTicketSchema.safeParse({ ...req.body, ticketId: id });
  if (!result.success) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Validation failed',
      errors: result.error.issues,
    });
  }
  next();
};
export const validateResolveTicket = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = req.params.id;
  const result = resolveTicketSchema.safeParse({ ...req.body, ticketId: id });
  if (!result.success) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Validation failed',
      errors: result.error.issues,
    });
  }
  next();
};
