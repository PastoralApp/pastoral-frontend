export interface Evento {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  location?: string;
  imageUrl?: string;
  maxParticipants: number;
  requireInscription: boolean;
  createdByUserId: string;
  createdByName: string;
  createdAt: string;
}

export interface CreateEventoDto {
  title: string;
  description: string;
  eventDate: string;
  location?: string;
  imageUrl?: string;
  maxParticipants?: number;
  requireInscription?: boolean;
}

export interface UpdateEventoDto {
  title: string;
  description: string;
  eventDate: string;
  location?: string;
  imageUrl?: string;
  maxParticipants?: number;
  requireInscription?: boolean;
}

export interface EventoSaveResponse {
  saved: boolean;
}
