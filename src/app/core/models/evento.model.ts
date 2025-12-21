export interface Evento {
  id: string;
  title: string;
  description: string;
  eventDate: Date;
  location?: string;
  imageUrl?: string;
  maxParticipants: number;
  requireInscription: boolean;
  createdByUserId: string;
  createdByName?: string;
  createdAt: Date;
  updatedAt?: Date;
  userHasSaved?: boolean;
}

export interface CreateEventoDto {
  title: string;
  description: string;
  eventDate: Date;
  location?: string;
  imageUrl?: string;
  maxParticipants: number;
  requireInscription: boolean;
}

export interface UpdateEventoDto {
  title: string;
  description: string;
  eventDate: Date;
  location?: string;
}
