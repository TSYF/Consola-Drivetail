export interface Slot {
  id: number
  inicio: string // ISO 8601 datetime
  fin: string // ISO 8601 datetime
  ocupado: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateSlotDto {
  inicio: string // ISO 8601 datetime
  fin: string // ISO 8601 datetime
}

export interface CreateSlotBatchDto {
  inicio: string // ISO 8601 datetime - start time
  fin: string // ISO 8601 datetime - end time
  minutes: number // duration of each slot in minutes
}

export interface EstadoReserva {
  id: number
  nombre: string
}

export interface Reserva {
  id: number
  patenteVehiculo: string
  notasCliente: string
  recordatorio: boolean
  idEstado: number
  idServicio: number
  idCliente: number
  idSlot: number
  created_at?: string
  updated_at?: string
  // Nested relations
  slot?: Slot
  estado?: EstadoReserva
  servicio?: {
    id: number
    nombre: string
  }
  cliente?: {
    id: number
    nombre: string
    email: string
  }
}

export interface CreateReservaDto {
  patenteVehiculo: string
  notasCliente: string
  recordatorio: boolean
  idEstado: number
  idServicio: number
  idCliente: number
  idSlot: number
}

export type UpdateReservaDto = Partial<CreateReservaDto>
