export interface Vehiculo {
  id: number
  marca: string
  modelo: string
  anio: string
  trim: string
  created_at?: string
  updated_at?: string
}

export interface CreateVehiculoDto {
  marca: string
  modelo: string
  anio: string
  trim: string
}

export type UpdateVehiculoDto = Partial<CreateVehiculoDto>
