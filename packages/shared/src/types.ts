import type { TicketPriority, TicketStatus, UserRole } from "./enums.js";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdId: string;
  createdById: string;
  assignedToId: string | null; 
  // | null força vc a tratar o caso onde nao há tecnico
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
    id: string;
    name: string;
    description: string;
}

export interface Comment {
    id: string
    ticketId: string
    authorId: string
    body: string
    //Comentario interno
    isInternal: boolean
    createdAt: Date
}