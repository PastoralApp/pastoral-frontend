export interface Evento {
  id?: string;
  titulo: string;
  descricao: string;
  local: string;
  dataInicio: Date;
  dataFim: Date;
  inscricoesAbertas: boolean;
  organizadorId: string;
  pastoralId?: string;
  grupoId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateEventoDto {
  titulo: string;
  descricao: string;
  local: string;
  dataInicio: string;
  dataFim: string;
  inscricoesAbertas: boolean;
}

export interface UpdateEventoDto {
  titulo: string;
  descricao: string;
  local: string;
  dataInicio: string;
  dataFim: string;
  inscricoesAbertas: boolean;
}
