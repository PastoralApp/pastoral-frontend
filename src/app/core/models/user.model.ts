import type { Tag } from './tag.model';
export { Tag, CreateTagDto } from './tag.model';

export interface UserGrupoInfo {
  id: string;
  grupoId: string;
  grupoName: string;
  grupoSigla: string;
  grupoLogoUrl?: string;
  primaryColor: string;
  pastoralName?: string;
  dataEntrada: string;
  silenciarNotificacoes: boolean;
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
  igrejaId?: string;
  igrejaNome?: string;
  grupoId?: string;
  grupoName?: string;
  tags: Tag[];
  grupos: UserGrupoInfo[];
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
  telefone?: string;
  birthDate?: string;
}

export interface UpdateUserDto {
  name: string;
  email: string;
  birthDate?: string;
  photoUrl?: string;
  telefone?: string;
  roleId: string;
  isActive: boolean;
}

export interface UpdateUserProfileDto {
  name: string;
  birthDate?: string;
  photoUrl?: string;
  telefone?: string;
}

export interface UpdateUserRoleDto {
  roleId: string;
}

export interface UpdateUserAdminDto {
  name: string;
  telefone?: string;
  birthDate?: string;
  roleId: string;
}

export interface UpdateProfileDto {
  name: string;
  birthDate?: string;
  photoUrl?: string;
}

export interface UpdateRoleDto {
  roleId: string;
}

export interface AddTagToUserDto {
  tagId: string;
}

export interface RemoveTagFromUserDto {
  tagId: string;
}
