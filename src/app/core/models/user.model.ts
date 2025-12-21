export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  birthDate?: Date;
  isActive?: boolean;
  roleId: string;
  roleName?: string;
  grupoId?: string;
  grupoName?: string;
  role?: Role;
  tags?: Tag[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Role {
  id: string;
  name: string;
  type: number;
  description: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
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
  email: string;
  photoUrl?: string;
  birthDate?: Date;
}
