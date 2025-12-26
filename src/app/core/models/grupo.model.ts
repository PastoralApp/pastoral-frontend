export interface Grupo {
  id: string;
  name: string;
  sigla: string;
  description: string;
  pastoralId: string;
  pastoralName?: string;
  pastoralSigla?: string;
  igrejaId?: string;
  igrejaNome?: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  icon?: string;
  isActive: boolean;
  membersCount: number;
  coordenadorId?: string;
  coordenadorName?: string;
}

export interface CreateGrupoDto {
  name: string;
  sigla?: string;
  description?: string;
  pastoralId: string;
  igrejaId?: string;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  icon?: string;
  coordenadorId?: string;
}

export interface UpdateGrupoDto {
  name: string;
  sigla?: string;
  description?: string;
  pastoralId: string;
  igrejaId?: string;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  icon?: string;
  coordenadorId?: string;
}
