// "as const" cria um obheto cujo valores sao tipos literais, e nao string ou number genericos. Assim, podemos usar os valores como tipos em outros lugares do codigo, garantindo que so sejam usados os valores definidos aqui.
//Não é String

export const TicketStatus = {
  OPEN:         'OPEN',
  IN_PROGRESS:  'IN_PROGRESS',
  WAITING_USER: 'WAITING_USER',
  RESOLVED:     'RESOLVED',
  CLOSED:       'CLOSED',
} as const
export type TicketStatus = typeof TicketStatus[keyof typeof TicketStatus]

export const TicketPriority = {
  LOW:      'LOW',
  MEDIUM:   'MEDIUM',
  HIGH:     'HIGH',
  CRITICAL: 'CRITICAL',
} as const
export type TicketPriority = typeof TicketPriority[keyof typeof TicketPriority]

export const UserRole = {
  USER:  'USER',
  AGENT: 'AGENT',
  ADMIN: 'ADMIN',
} as const
export type UserRole = typeof UserRole[keyof typeof UserRole]