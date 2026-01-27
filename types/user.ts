export interface User {
  id: string
  email: string
  name: string
  role: string | null
  emailVerified: boolean
  banned: boolean
  banReason: string | null
  banExpires: number | null
  createdAt: string
  updatedAt: string
  image?: string
}

export interface CreateUserDto {
  email: string
  password: string
  name: string
  role?: string | null
}

export interface UpdateUserDto {
  userId: string
  data: {
    email?: string
    name?: string
    role?: string | null
  }
}

export interface SetRoleDto {
  userId: string
  role: string | null
}

export interface SetPasswordDto {
  userId: string
  password: string
}

export interface BanUserDto {
  userId: string
  banReason?: string
  banExpiresIn?: number
}

export interface RemoveUserDto {
  userId: string
}

export interface ListUsersResponse {
  users: User[]
  total: number
  limit?: number
  offset?: number
}
