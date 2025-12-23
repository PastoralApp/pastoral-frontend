export interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  grupoId?: string;
  grupoNome?: string;
  grupoSigla?: string;
  remetenteId: string;
  remetenteNome: string;
  dataEnvio: string;
  isAtiva: boolean;
  isGeral: boolean;
  lida: boolean;
  dataLeitura?: string;
}

export interface NotificacaoNaoLida {
  id: string;
  titulo: string;
  mensagem: string;
  dataEnvio: string;
  lida: boolean;
}

export interface CreateNotificacaoDto {
  titulo: string;
  mensagem: string;
  remetenteId: string;
  grupoId?: string;
  isGeral: boolean;
}

export interface UpdateNotificacaoDto {
  titulo: string;
  mensagem: string;
}
