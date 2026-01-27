export interface Servicio {
  id: number
  nombre: string
  descripcion: string
  precio_min: number
  precio_max?: number
  duracion_minutos: number
  requiere_reserva: boolean
  activo: boolean
  imagen?: string
  id_categoria: number
  created_at?: string
  updated_at?: string
}

export interface CreateServicioDto {
  nombre: string
  descripcion: string
  precio_min: number
  precio_max?: number
  duracion_minutos?: number
  requiere_reserva: boolean
  activo: boolean
  imagen?: string
  id_categoria: number
}

export type UpdateServicioDto = Partial<CreateServicioDto>
