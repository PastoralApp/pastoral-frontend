import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Evento,
  CreateEventoDto,
  UpdateEventoDto,
  EventoSaveResponse,
  EventoParticiparResponse,
  EventoParticipante,
  EventoType
} from '../models/evento.model';

@Injectable({
  providedIn: 'root'
})
export class EventoService {
  private readonly API_URL = `${environment.apiUrl}/eventos`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.API_URL);
  }

  getUpcoming(): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.API_URL}/upcoming`);
  }

  getPast(): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.API_URL}/past`);
  }

  getByType(type: EventoType): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.API_URL}/type/${type}`);
  }

  getEventoTypes(): Observable<{ value: number; name: string }[]> {
    return this.http.get<{ value: number; name: string }[]>(`${this.API_URL}/types`);
  }

  getByGrupo(grupoId: string): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.API_URL}/grupo/${grupoId}`);
  }

  getByPastoral(pastoralId: string): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.API_URL}/pastoral/${pastoralId}`);
  }

  getById(id: string): Observable<Evento> {
    return this.http.get<Evento>(`${this.API_URL}/${id}`);
  }

  create(data: CreateEventoDto): Observable<Evento> {
    return this.http.post<Evento>(this.API_URL, data);
  }

  update(id: string, data: UpdateEventoDto): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  save(id: string): Observable<EventoSaveResponse> {
    return this.http.post<EventoSaveResponse>(`${this.API_URL}/${id}/save`, {});
  }

  getSaved(): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.API_URL}/saved`);
  }

  participar(id: string): Observable<EventoParticiparResponse> {
    return this.http.post<EventoParticiparResponse>(`${this.API_URL}/${id}/participar`, {});
  }

  cancelarParticipacao(id: string): Observable<EventoParticiparResponse> {
    return this.http.delete<EventoParticiparResponse>(`${this.API_URL}/${id}/participar`);
  }

  getParticipantes(id: string): Observable<EventoParticipante[]> {
    return this.http.get<EventoParticipante[]>(`${this.API_URL}/${id}/participantes`);
  }
}
