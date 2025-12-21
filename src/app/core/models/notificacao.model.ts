export interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  grupoId?: string;
  grupoNome?: string;
  grupoSigla?: string;
  remetenteId: string;
  remetenteNome?: string;
  dataEnvio: Date;
  isAtiva: boolean;
  isGeral: boolean;
  lida?: boolean;
  dataLeitura?: Date;
}

export interface CreateNotificacaoDto {
  titulo: string;
  mensagem: string;
  grupoId?: string;
  isGeral: boolean;
}

export interface UpdateNotificacaoDto {
  titulo: string;
  mensagem: string;
}
