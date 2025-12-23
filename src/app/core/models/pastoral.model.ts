export enum TipoPastoral {
  PA = 'PA',
  PJ = 'PJ',
  Geral = 'Geral'
}

export enum PastoralType {
  PA = 'PA',
  PJ = 'PJ'
}

export interface Grupo {
  id: string;
  name: string;
  sigla: string;
  description: string;
  pastoralId: string;
  pastoralName?: string;
  pastoralSigla?: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  icon?: string;
  isActive: boolean;
  membersCount: number;
}

export interface CreateGrupoDto {
  name: string;
  sigla: string;
  description: string;
  pastoralId: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  icon?: string;
}

export interface UpdateGrupoDto {
  name: string;
  sigla: string;
  description: string;
  pastoralId: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  icon?: string;
}

export interface Pastoral {
  id: string;
  name: string;
  sigla: string;
  tipoPastoral: TipoPastoral;
  type: PastoralType;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  icon?: string;
  isActive: boolean;
  grupos: Grupo[];
}

export interface CreatePastoralDto {
  name: string;
  sigla: string;
  tipoPastoral: TipoPastoral;
  type: PastoralType;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  icon?: string;
}

export interface UpdatePastoralDto {
  name: string;
  sigla: string;
  tipoPastoral: TipoPastoral;
  type: PastoralType;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  icon?: string;
}
