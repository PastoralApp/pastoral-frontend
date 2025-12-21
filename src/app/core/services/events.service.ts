import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Event } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private events = signal<Event[]>([
    {
      id: '1',
      title: 'Encontro de Formação',
      description: 'Encontro mensal de formação com tema sobre vocação',
      date: new Date('2024-12-25T19:00:00'),
      location: 'Salão Paroquial',
      pastoral: 'PA',
      organizer: 'Coordenação PA',
      participants: ['1', '2', '3'],
      maxParticipants: 30
    },
    {
      id: '2',
      title: 'Retiro de Jovens',
      description: 'Retiro de final de semana para aprofundamento espiritual',
      date: new Date('2025-01-10T08:00:00'),
      location: 'Casa de Retiros São Francisco',
      pastoral: 'PJ',
      organizer: 'Coordenação PJ',
      participants: ['4', '5'],
      maxParticipants: 25
    },
    {
      id: '3',
      title: 'Missa da Pastoral',
      description: 'Celebração especial com toda a comunidade pastoral',
      date: new Date('2024-12-28T18:00:00'),
      location: 'Igreja Matriz',
      pastoral: 'PA',
      organizer: 'Pe. João',
      participants: ['1', '2', '3', '4', '5', '6']
    }
  ]);

  public allEvents = this.events.asReadonly();

  getEvents(): Observable<Event[]> {
    return of(this.events()).pipe(delay(500));
  }

  subscribeToEvent(eventId: string, userId: string): Observable<boolean> {
    this.events.update(events =>
      events.map(event =>
        event.id === eventId
          ? { ...event, participants: [...event.participants, userId] }
          : event
      )
    );
    return of(true).pipe(delay(300));
  }

  unsubscribeFromEvent(eventId: string, userId: string): Observable<boolean> {
    this.events.update(events =>
      events.map(event =>
        event.id === eventId
          ? { ...event, participants: event.participants.filter(p => p !== userId) }
          : event
      )
    );
    return of(true).pipe(delay(300));
  }
}
