export interface Factura {
  id: number
  numero: string
  total: number
  fechaEmision: string
  idTransaccion: number
  created_at?: string
  updated_at?: string
  // Nested relations
  transaccion?: {
    id: number
    monto: number
  }
}

export interface CreateFacturaDto {
  numero: string
  total: number
  fechaEmision: string
  idTransaccion: number
}

export type UpdateFacturaDto = Partial<CreateFacturaDto>
