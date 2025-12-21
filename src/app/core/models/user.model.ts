export interface User {
  id: string;
  name: string;
  email: string;
  telefone?: string;
  roleId: string;
  grupoId?: string;
  role?: Role;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Role {
  id: string;
  name: string;
  type: number;
  description: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  telefone?: string;
  password: string;
  roleType: number;
}

export interface UpdateUserDto {
  name: string;
  email: string;
  telefone?: string;
  roleType?: number;
}
