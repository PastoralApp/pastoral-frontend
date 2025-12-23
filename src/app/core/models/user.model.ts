export interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  birthDate?: string;
  telefone?: string;
  isActive: boolean;
  roleId: string;
  roleName: string;
  grupoId?: string;
  grupoName?: string;
  tags: Tag[];
  createdAt: string;
  updatedAt?: string;
}

export interface UserSimple {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  isActive: boolean;
  roleName?: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  roleId: string;
  grupoId?: string;
}

export interface UpdateUserDto {
  name: string;
  email?: string;
  birthDate?: string;
  photoUrl?: string;
  roleId?: string;
  isActive?: boolean;
}

export interface UpdateProfileDto {
  name: string;
  birthDate?: string;
  photoUrl?: string;
}

export interface UpdateRoleDto {
  roleId: string;
}
