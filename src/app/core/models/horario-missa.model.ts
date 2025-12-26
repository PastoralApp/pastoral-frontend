export enum DiaSemana {
  Domingo = 0,
  Segunda = 1,
  Terca = 2,
  Quarta = 3,
  Quinta = 4,
  Sexta = 5,
  Sabado = 6
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

export interface CreateHorarioMissaDto {
  igrejaId: string;
  diaSemana: number;
  horario: string;
  celebrante?: string;
  observacao?: string;
}

export interface UpdateHorarioMissaDto {
  igrejaId: string;
  diaSemana: number;
  horario: string;
  celebrante?: string;
  observacao?: string;
}
