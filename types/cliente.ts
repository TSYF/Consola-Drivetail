export interface Cliente {
  id: number
  nombre: string
  email: string
  telefono: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateClienteDto {
  nombre: string
  email: string
  telefono: string
}

export interface UpdateClienteDto {
  nombre?: string
  email?: string
  telefono?: string
}
