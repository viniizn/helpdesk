import { TicketStatus } from "./enums.js";

// Record<A, B> = objeto onde toda chave é do tipo A e todo valor é do tipo B.
// Aqui: para cada status, uma lista de status permitidos como próximo.
// Fica no shared porque frontend pode usar para desabilitar botões inválidos.
export const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  [TicketStatus.OPEN]:         [TicketStatus.IN_PROGRESS],
  [TicketStatus.IN_PROGRESS]:  [TicketStatus.WAITING_USER, TicketStatus.RESOLVED],
  [TicketStatus.WAITING_USER]: [TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED],
  [TicketStatus.RESOLVED]:     [TicketStatus.CLOSED, TicketStatus.OPEN],
  [TicketStatus.CLOSED]:       [],
}

export function isValidTransition(from: TicketStatus, to: TicketStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to)
}