export interface EstadoTicket {
  id: number
  nombre: string
}

export interface ImportanciaTicket {
  id: number
  nombre: string
}

export interface UrgenciaTicket {
  id: number
  nombre: string
}

export interface Ticket {
  id: number
  nombre: string
  description?: string
  desde?: string
  hasta?: string
  created_at: string
  updated_at: string
  id_servicio: number
  id_user?: string
  id_estado: number
  id_importancia?: number
  id_urgencia?: number
  estado: EstadoTicket
  importancia?: ImportanciaTicket
  urgencia?: UrgenciaTicket
  servicio?: {
    id: number
    nombre: string
  }
  user?: {
    id: string
    name: string
    email: string
  }
}

export interface CreateTicketDto {
  nombre: string
  description?: string
  desde?: string
  hasta?: string
  id_servicio: number
  id_user?: string
  id_estado: number
  id_importancia?: number
  id_urgencia?: number
}

export interface UpdateTicketDto extends Partial<CreateTicketDto> {}

export interface TicketFilters {
  search?: string
  status?: number[]
  importance?: number[]
  urgency?: number[]
  service?: number[]
  user?: string[]
  dateFrom?: string
  dateTo?: string
}
