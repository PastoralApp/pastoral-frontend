import type { HorarioMissa } from './horario-missa.model';
export { HorarioMissa, DiaSemana, CreateHorarioMissaDto, UpdateHorarioMissaDto } from './horario-missa.model';

export interface Igreja {
  id: string;
  nome: string;
  endereco?: string;
  telefone?: string;
  imagemUrl?: string;
  isAtiva: boolean;
  horariosMissas: HorarioMissa[];
}

export interface CreateIgrejaDto {
  nome: string;
  endereco?: string;
  telefone?: string;
  imagemUrl?: string;
}

export interface UpdateIgrejaDto {
  nome: string;
  endereco?: string;
  telefone?: string;
  imagemUrl?: string;
}
