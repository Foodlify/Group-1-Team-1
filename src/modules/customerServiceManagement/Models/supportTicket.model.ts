import { TicketCategory } from "@prisma/client";

export interface SupportTicketRequest {
  customerId: number;
  category: TicketCategory;
  subject: string;
  description: string;
  orderId?: number;
}
export interface SupportTicketResponse {
  id: number;
  customerId: number;
  orderId?: number;
  category: string;
  status: string;
  subject: string;
  description: string;
  assignedAgentId: number;
  createdAt: Date;
  updatedAt: Date;
  resolution?: string;
  resolvedAt?: Date;
}
