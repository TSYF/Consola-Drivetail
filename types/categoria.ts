export interface Categoria {
  id: number
  nombre: string
  description?: string
  slug: string
  orden: number
  activo: boolean
  icono?: string
  created_at?: string
  updated_at?: string
}

export interface CreateCategoriaDto {
  nombre: string
  description?: string
  slug: string
  orden: number
  activo?: boolean
  icono?: string
}

export type UpdateCategoriaDto = Partial<CreateCategoriaDto>
