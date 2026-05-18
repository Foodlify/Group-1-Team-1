import prisma from '../../../../lib/prisma';
import { Prisma, TicketStatus } from '@prisma/client';
import { SupportTicketRequest } from '../Models/supportTicket.model';
class TicketRepository {
  static async insertSupportTicket(
    input: SupportTicketRequest,
    requestId: string,
    db: Prisma.TransactionClient = prisma,
  ): Promise<any> {
    const { customerId, category, subject, description, orderId} =
      input;

    let assignedAgentId = await db.customerServiceEmployee.findFirst({
      where: {
        section: category,
      },
      orderBy: {
        assignedTickets: 'asc',
      },
      select: {
        id: true,
      },
    });

    if (!assignedAgentId || assignedAgentId === null) {
      assignedAgentId = { id: 1 };
    }
    return await db.supportTicket.create({
      data: {
        customerId,
        orderId,
        requestId,
        category,
        subject,
        description,
        assignedAgentId: assignedAgentId.id,
      },
    });
  }

  static async getSupportTicketById(
    requestId: string,
    db: Prisma.TransactionClient = prisma,
  ): Promise<any> {
    return await db.supportTicket.findUnique({
      where: {
        requestId,
      },
    });
  }
  static async updateSupportTicketStatus(
    ticketId: number,
    status: TicketStatus,
    db: Prisma.TransactionClient = prisma,
  ): Promise<any> {
    return await db.supportTicket.update({
      where: { id: ticketId },
      data: {
        status,
        updatedAt: new Date(),
      },
    });
  }
  static async resolveSupportTicket(
    ticketId: number,
    resolution: string,
    db: Prisma.TransactionClient = prisma,
  ): Promise<any> {
    return await db.supportTicket.update({
      where: { id: ticketId },
      data: {
        resolution,
        status: TicketStatus.RESOLVED,
        resolvedAt: new Date(),
      },
    });
  }
}

export default TicketRepository;
