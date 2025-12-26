import { UserSimple } from './user.model';

export interface Tag {
  id: string;
  name: string;
  color: string;
  description: string;
  users?: UserSimple[];
  usersCount?: number;
}

export interface CreateTagDto {
  name: string;
  color: string;
  description: string;
}

export interface UpdateTagDto {
  name: string;
  color: string;
  description: string;
}
