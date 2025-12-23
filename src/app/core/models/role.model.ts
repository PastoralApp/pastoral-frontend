export enum RoleType {
  Usuario = 1,
  CoordenadorGrupo = 2,
  CoordenadorGeral = 3,
  Administrador = 5
}

export interface Role {
  id: string;
  name: string;
  type: RoleType;
  description: string;
}

export const ROLE_IDS = {
  USUARIO: '00000000-0000-0000-0000-000000000001',
  COORDENADOR_GRUPO: '00000000-0000-0000-0000-000000000002',
  COORDENADOR_GERAL: '00000000-0000-0000-0000-000000000003',
  ADMINISTRADOR: '00000000-0000-0000-0000-000000000005'
} as const;
