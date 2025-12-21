import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Grupo, CreateGrupoDto } from '../models/pastoral.model';

@Injectable({
  providedIn: 'root'
})
export class GrupoService {
  private apiUrl = `${environment.apiUrl}/grupos`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Grupo[]> {
    return this.http.get<Grupo[]>(this.apiUrl);
  }

  getById(id: string): Observable<Grupo> {
    return this.http.get<Grupo>(`${this.apiUrl}/${id}`);
  }

  getByPastoral(pastoralId: string): Observable<Grupo[]> {
    return this.http.get<Grupo[]>(`${this.apiUrl}/pastoral/${pastoralId}`);
  }

  create(dto: CreateGrupoDto): Observable<Grupo> {
    return this.http.post<Grupo>(this.apiUrl, dto);
  }

  update(id: string, dto: CreateGrupoDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getMembros(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/membros`);
  }

  addMembro(grupoId: string, userId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${grupoId}/membros/${userId}`, {});
  }

  removeMembro(grupoId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${grupoId}/membros/${userId}`);
  }

  silenciarNotificacoes(grupoId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${grupoId}/silenciar-notificacoes`, {});
  }

  ativarNotificacoes(grupoId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${grupoId}/ativar-notificacoes`, {});
  }

  ativar(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/ativar`, {});
  }

  desativar(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/desativar`, {});
  }
}
