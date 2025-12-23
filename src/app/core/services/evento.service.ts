import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Evento,
  CreateEventoDto,
  UpdateEventoDto,
  EventoSaveResponse
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
}
