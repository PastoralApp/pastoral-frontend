import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Evento, CreateEventoDto, UpdateEventoDto } from '../models/evento.model';

@Injectable({
  providedIn: 'root'
})
export class EventoService {
  private apiUrl = `${environment.apiUrl}/eventos`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.apiUrl);
  }

  getById(id: string): Observable<Evento> {
    return this.http.get<Evento>(`${this.apiUrl}/${id}`);
  }

  getUpcoming(count: number = 10): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.apiUrl}/upcoming?count=${count}`);
  }

  getPast(count: number = 10): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.apiUrl}/past?count=${count}`);
  }

  create(evento: CreateEventoDto): Observable<Evento> {
    return this.http.post<Evento>(this.apiUrl, evento);
  }

  update(id: string, evento: UpdateEventoDto): Observable<Evento> {
    return this.http.put<Evento>(`${this.apiUrl}/${id}`, evento);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleSave(eventoId: string): Observable<{ saved: boolean }> {
    return this.http.post<{ saved: boolean }>(`${this.apiUrl}/${eventoId}/save`, {});
  }

  getSavedEventos(): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.apiUrl}/saved`);
  }

  activateEvento(eventoId: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${eventoId}/ativar`, {});
  }

  deactivateEvento(eventoId: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${eventoId}/desativar`, {});
  }
}
