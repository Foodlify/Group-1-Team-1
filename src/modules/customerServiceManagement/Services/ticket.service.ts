import { Prisma, TicketStatus } from '@prisma/client';
import TicketRepository from '../Repositories/ticket.repository';
import prisma from '../../../../lib/prisma';
import { NOT_FOUND } from '../../../shared_infrastructure/error/error.execption';
import { ENTITIES } from '../../../../prisma/entities';
import {
  SupportTicketRequest,
  SupportTicketResponse,
} from '../Models/supportTicket.model';
import { OrderService } from '../../orderManagment/Services/order.service';

class TicketService {
  static async getSupportTicket(
    requestId: string,
    db: Prisma.TransactionClient = prisma,
  ): Promise<SupportTicketResponse> {
    const ticket = await TicketRepository.getSupportTicketById(requestId, db);
    if (!ticket) throw new NOT_FOUND(ENTITIES.SUPPORT_TICKET);
    return ticket;
  }

  static async insertSupportTicket(
    input: SupportTicketRequest,
    db: Prisma.TransactionClient = prisma,
  ) {
    const { customerId, category, subject, description, orderId } = input;
    if (orderId) {
      const Order = await OrderService.getSingleOrder(customerId, orderId);
      if (!Order) throw new NOT_FOUND(ENTITIES.ORDER);
    }
    const { customAlphabet } = await import('nanoid');
    const nanoid = customAlphabet(
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
      10,
    );
    const requestId = `request-${nanoid()}`;

    const ticket = await TicketRepository.insertSupportTicket(
      input,
      requestId,
      db,
    );
    return ticket.requestId;
  }
  static async updateSupportTicketStatus(
    requestId: string,
    status: TicketStatus,
    db: Prisma.TransactionClient = prisma,
  ) {
    const ticket = await TicketService.getSupportTicket(requestId, db);

    return TicketRepository.updateSupportTicketStatus(ticket.id, status, db);
  }
  static async resolveSupportTicket(
    requestId: string,
    resolution: string,
    db: Prisma.TransactionClient = prisma,
  ) {
    const ticket = await TicketService.getSupportTicket(requestId, db);

    return TicketRepository.resolveSupportTicket(ticket.id, resolution, db);
  }
}

export default TicketService;
