export enum EventoType {
  Comum = 0,
  Encontro = 1,
  Retiro = 2,
  Acampamento = 3,
  FestaJunina = 4,
  Olimpiadas = 5,
  Guia = 6
}

export const EventoTypeLabels: Record<EventoType, string> = {
  [EventoType.Comum]: 'Comum',
  [EventoType.Encontro]: 'Encontro',
  [EventoType.Retiro]: 'Retiro',
  [EventoType.Acampamento]: 'Acampamento',
  [EventoType.FestaJunina]: 'Festa Junina',
  [EventoType.Olimpiadas]: 'Olimpíadas',
  [EventoType.Guia]: 'Guia'
};

export interface Evento {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  eventEndDate?: string;
  location?: string;
  imageUrl?: string;
  bannerUrl?: string;
  maxParticipants: number;
  requireInscription: boolean;
  type: EventoType;
  typeName: string;
  createdByUserId: string;
  createdByName: string;
  createdAt: string;
  updatedAt?: string;
  
  grupoId?: string;
  grupoNome?: string;
  responsavelUserId?: string;
  responsavelUserName?: string;
  
  cor?: string;
  
  linkInscricao?: string;
  preco?: number;
  dataLimiteInscricao?: string;
  
  totalParticipantes: number;
  vagasDisponiveis: boolean;
  usuarioParticipando: boolean;
}

export interface CreateEventoDto {
  title: string;
  description: string;
  eventDate: string;
  eventEndDate?: string;
  location?: string;
  imageUrl?: string;
  bannerUrl?: string;
  maxParticipants: number;
  requireInscription: boolean;
  type: EventoType;
  
  linkInscricao?: string;
  preco?: number;
  dataLimiteInscricao?: string;
  
  grupoId?: string;
  responsavelUserId?: string;
  
  cor?: string;
}

export interface UpdateEventoDto {
  title: string;
  description: string;
  eventDate: string;
  eventEndDate?: string;
  location?: string;
  imageUrl?: string;
  bannerUrl?: string;
  maxParticipants: number;
  requireInscription: boolean;
  type: EventoType;
  
  linkInscricao?: string;
  preco?: number;
  dataLimiteInscricao?: string;
  
  grupoId?: string;
  responsavelUserId?: string;
  
  cor?: string;
}

export interface EventoSaveResponse {
  saved: boolean;
}

export interface EventoParticiparResponse {
  participando: boolean;
}

export interface EventoParticipante {
  id: string;
  eventoId: string;
  userId: string;
  userName: string;
  userPhotoUrl?: string;
  confirmado: boolean;
  dataConfirmacao?: string;
}
