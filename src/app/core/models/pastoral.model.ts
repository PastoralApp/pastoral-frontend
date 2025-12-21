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
  isActive: boolean;
  membersCount?: number;
}

export interface CreateGrupoDto {
  name: string;
  sigla: string;
  description: string;
  pastoralId: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
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
  isActive: boolean;
  grupos?: Grupo[];
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
}
