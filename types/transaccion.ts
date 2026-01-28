export interface MedioPago {
  id: number
  nombre: string
}

export interface Moneda {
  id: number
  codigo: string
  nombre: string
}

export interface EstadoPago {
  id: number
  nombre: string
}

export interface Transaccion {
  id: number
  monto: number
  idMoneda: number
  webpayToken: string
  fechaPago: string
  idMedioPago: number
  idEstadoPago: number
  created_at?: string
  updated_at?: string
  // Nested relations
  moneda?: Moneda
  medioPago?: MedioPago
  estadoPago?: EstadoPago
  facturas?: Factura[]
  reservas?: {
    id: number
    patenteVehiculo: string
  }[]
}

export interface CreateTransaccionDto {
  monto: number
  idMoneda: number
  webpayToken: string
  fechaPago: string
  idMedioPago: number
  idEstadoPago: number
}

export type UpdateTransaccionDto = Partial<CreateTransaccionDto>
