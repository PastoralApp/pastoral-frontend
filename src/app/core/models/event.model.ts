export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  pastoral: 'PA' | 'PJ';
  organizer: string;
  participants: string[];
  maxParticipants?: number;
  imageUrl?: string;
}
