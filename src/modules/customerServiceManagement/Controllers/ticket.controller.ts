import asyncHandler from '../../../utils/asyncHandler';
import { NextFunction, Request, Response } from 'express';

import { sendSuccess, sendError } from '../../../utils/reponse';
import TicketService from '../Services/ticket.service';
import { successMessage } from '../../../shared_infrastructure/success/successMessages';
import { ENTITIES } from '../../../../prisma/entities';
import { StatusCodes } from 'http-status-codes';
import { NOT_FOUND } from '../../../shared_infrastructure/error/error.execption';
export class TicketController {
  static createSupportTicket = asyncHandler(
    async (req: Request, res: Response) => {
      const customerId = req.customerId!;
      const { category, subject, description, orderId } = req.body;
      try {
        const requestId = await TicketService.insertSupportTicket({
          customerId,
          category,
          subject,
          description,
          orderId,
        });
        sendSuccess(
          res,
          `${ENTITIES.SUPPORT_TICKET} ${successMessage.RECORD_ADDED.message}`,
          StatusCodes.CREATED,
          requestId,
        );
      } catch (err) {
        if (err instanceof NOT_FOUND) {
          sendError(res, err.statusCode, err.code, err.message);
        } else {
          throw err;
        }
      }
    },
  );
  static getSupportTicket = asyncHandler(
    async (req: Request, res: Response) => {
      const requestId = req.params.id as string;
      try {
        const ticket = await TicketService.getSupportTicket(requestId);
        sendSuccess(
          res,
          `${ENTITIES.SUPPORT_TICKET} ${successMessage.RECORD_GET.message}`,
          StatusCodes.OK,
          ticket,
        );
      } catch (err) {
        if (err instanceof NOT_FOUND) {
          sendError(res, err.statusCode, err.code, err.message);
        } else {
          throw err;
        }
      }
    },
  );
  static updateSupportTicketStatus = asyncHandler(
    async (req: Request, res: Response) => {
      const requestId = req.params.id as string;
      const { status } = req.body;
      try {
        const ticket = await TicketService.updateSupportTicketStatus(
          requestId,
          status,
        );
        sendSuccess(
          res,
          `${ENTITIES.SUPPORT_TICKET} ${successMessage.RECORD_updated.message}`,
          StatusCodes.OK,
        );
      } catch (err) {
        if (err instanceof NOT_FOUND) {
          sendError(res, err.statusCode, err.code, err.message);
        } else {
          throw err;
        }
      }
    },
  );
  static resolveSupportTicket = asyncHandler(
    async (req: Request, res: Response) => {
      const requestId = req.params.id as string;
      const { resolution } = req.body;
      try {
        const ticket = await TicketService.resolveSupportTicket(
          requestId,
          resolution,
        );
        sendSuccess(
          res,
          `${ENTITIES.SUPPORT_TICKET} ${successMessage.RECORD_updated.message}`,
          StatusCodes.OK,
        );
      } catch (err) {
        if (err instanceof NOT_FOUND) {
          sendError(res, err.statusCode, err.code, err.message);
        } else {
          throw err;
        }
      }
    },
  );
}
