export interface Mensaje {
  id: number
  nombre: string
  email: string
  mensaje: string
  leido?: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateMensajeDto {
  nombre: string
  email: string
  mensaje: string
}

export type UpdateMensajeDto = Partial<CreateMensajeDto>
