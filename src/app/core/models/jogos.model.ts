export enum TipoDeJogo {
  Olimpiadas = 1,
  Guia = 2
}

export enum StatusJogo {
  Planejado = 1,
  Inscricoes = 2,
  EmAndamento = 3,
  Finalizado = 4,
  Cancelado = 5
}

export enum TipoModalidade {
  Individual = 1,
  Equipe = 2,
  Misto = 3
}

export enum GeneroModalidade {
  Masculino = 1,
  Feminino = 2,
  Misto = 3
}

export enum TipoMedalha {
  Ouro = 1,
  Prata = 2,
  Bronze = 3
}

export enum FaseJogo {
  Grupos = 1,
  Oitavas = 2,
  Quartas = 3,
  Semifinal = 4,
  Final = 5
}

export enum SistemaChave {
  MataMata = 1,
  PontosCorridos = 2,
  Suico = 3
}

export interface Jogo {
  id: string;
  nome: string;
  descricao: string;
  tipoDeJogo: TipoDeJogo;
  status: StatusJogo;
  dataInicio: string;
  dataFim: string;
  ano: number;
  tags: string[];
  pastoralId: string;
  pastoralNome?: string;
  criadoPorId: string;
  criadoPorNome?: string;
  genero: GeneroModalidade;
  sistemaChave?: SistemaChave;
  imagemCapaUrl?: string;
  regulamentoUrl?: string;
  permiteInscricao: boolean;
  dataLimiteInscricao?: string;
  observacoesGerais?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Olimpiadas extends Jogo {
  quantidadeFinaisSemana: number;
  finaisSemana: string[];
  pontosOuro: number;
  pontosPrata: number;
  pontosBronze: number;
  pontosParticipacao: number;
  usaFaseGrupos: boolean;
  usaMataMata: boolean;
  quantidadeGruposPorFase?: number;
  quantidadeClassificadosPorGrupo?: number;
  modalidades: Modalidade[];
}

export interface Guia extends Jogo {
  temaPrincipal: string;
  quantidadeProvas: number;
  duracaoEstimadaDias: number;
  requisitoIdadeMinima?: number;
  requisitoIdadeMaxima?: number;
  limiteTotalParticipantes?: number;
  provas: Prova[];
}

export interface Modalidade {
  id: string;
  nome: string;
  descricao?: string;
  tipo: TipoModalidade;
  olimpiadasId: string;
  categoriaGenero: GeneroModalidade;
  pontosVitoria: number;
  pontosEmpate: number;
  pontosDerrota: number;
  pontosOuro: number;
  pontosPrata: number;
  pontosBronze: number;
  usaChaveamento: boolean;
  faseAtual?: FaseJogo;
  dataInicio?: string;
  dataFim?: string;
  localRealizacao?: string;
  numeroMaximoParticipantesPorGrupo?: number;
  numeroMinimoParticipantesPorGrupo?: number;
  finalizada: boolean;
}

export interface Prova {
  id: string;
  nome: string;
  descricao?: string;
  guiaId: string;
  numero: number;
  pontuacaoMaxima: number;
  duracaoEstimadaMinutos?: number;
  localRealizacao?: string;
  dataRealizacao?: string;
  requisitos?: string;
  finalizada: boolean;
}

export interface Medalha {
  id: string;
  tipo: TipoMedalha;
  jogoId: string;
  jogoNome?: string;
  modalidadeId?: string;
  modalidadeNome?: string;
  provaId?: string;
  provaNome?: string;
  grupoId: string;
  grupoNome?: string;
  ano: number;
  dataConquista: string;
  descricao?: string;
  observacoes?: string;
  participantes: UserSimple[];
}

export interface Trofeu {
  id: string;
  nome: string;
  descricao?: string;
  jogoId: string;
  jogoNome?: string;
  grupoId: string;
  grupoNome?: string;
  ano: number;
  dataConquista: string;
  categoria?: string;
  posicao?: number;
  imagemUrl?: string;
  observacoes?: string;
}

export interface GrupoJogo {
  id: string;
  grupoId: string;
  grupoNome?: string;
  grupoSigla?: string;
  grupoLogoUrl?: string;
  jogoId: string;
  dataInscricao: string;
  confirmado: boolean;
  observacoes?: string;
}

export interface UserSimple {
  id: string;
  nome: string;
  email: string;
  imagemPerfilUrl?: string;
}

export interface CreateOlimpiadasDto {
  nome: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  ano: number;
  pastoralId: string;
  quantidadeFinaisSemana: number;
  pontosOuro: number;
  pontosPrata: number;
  pontosBronze: number;
  pontosParticipacao: number;
  usaFaseGrupos: boolean;
  usaMataMata: boolean;
  imagemCapaUrl?: string;
  regulamentoUrl?: string;
  observacoesGerais?: string;
}

export interface CreateGuiaDto {
  nome: string;
  descricao: string;
  temaPrincipal: string;
  dataInicio: string;
  dataFim: string;
  ano: number;
  pastoralId: string;
  quantidadeProvas: number;
  duracaoEstimadaDias: number;
  requisitoIdadeMinima?: number;
  requisitoIdadeMaxima?: number;
  limiteTotalParticipantes?: number;
  imagemCapaUrl?: string;
  regulamentoUrl?: string;
  observacoesGerais?: string;
}

export interface CreateMedalhaDto {
  tipo: TipoMedalha;
  jogoId: string;
  modalidadeId?: string;
  provaId?: string;
  grupoId: string;
  ano: number;
  dataConquista: string;
  descricao?: string;
  observacoes?: string;
  participantesIds: string[];
}

export interface CreateTrofeuDto {
  nome: string;
  descricao?: string;
  jogoId: string;
  grupoId: string;
  ano: number;
  dataConquista: string;
  categoria?: string;
  posicao?: number;
  imagemUrl?: string;
  observacoes?: string;
}

export interface CreateModalidadeDto {
  nome: string;
  descricao?: string;
  tipo: TipoModalidade;
  olimpiadasId: string;
  categoriaGenero: GeneroModalidade;
  pontosVitoria?: number;
  pontosEmpate?: number;
  pontosDerrota?: number;
  pontosOuro?: number;
  pontosPrata?: number;
  pontosBronze?: number;
  localRealizacao?: string;
}

export interface CreateProvaDto {
  nome: string;
  descricao?: string;
  guiaId: string;
  numero: number;
  pontuacaoMaxima: number;
  duracaoEstimadaMinutos?: number;
  localRealizacao?: string;
  dataRealizacao?: string;
  requisitos?: string;
}
