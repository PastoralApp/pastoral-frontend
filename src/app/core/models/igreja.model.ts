export interface Igreja {
  id: string;
  nome: string;
  endereco?: string;
  telefone?: string;
  imagemUrl?: string;
  isAtiva: boolean;
  horariosMissas?: HorarioMissa[];
}

export interface HorarioMissa {
  id: string;
  igrejaId: string;
  igrejaNome?: string;
  diaSemana: number;
  diaSemanaTexto: string;
  horario: string;
  horarioTexto: string;
  celebrante?: string;
  observacao?: string;
  isAtivo: boolean;
}

export interface CreateIgrejaDto {
  nome: string;
  endereco?: string;
  telefone?: string;
  imagemUrl?: string;
}

export interface CreateHorarioMissaDto {
  igrejaId: string;
  diaSemana: number;
  horario: string;
  celebrante?: string;
  observacao?: string;
}
