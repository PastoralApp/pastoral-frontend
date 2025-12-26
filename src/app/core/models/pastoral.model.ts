import type { Grupo } from './grupo.model';
export { Grupo, CreateGrupoDto, UpdateGrupoDto } from './grupo.model';

export enum TipoPastoral {
  PA = 'PA',
  PJ = 'PJ',
  Geral = 'Geral'
}

export interface Pastoral {
  id: string;
  name: string;
  sigla: string;
  tipoPastoral: string;
  type: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  icon?: string;
  isActive: boolean;
  grupos: Grupo[];
  membrosCount?: number;
  gruposCount?: number;
}

export interface CreatePastoralDto {
  name: string;
  sigla: string;
  tipoPastoral: string;
  type: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  icon?: string;
}

export interface UpdatePastoralDto {
  name: string;
  sigla: string;
  tipoPastoral: string;
  type: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  icon?: string;
}
