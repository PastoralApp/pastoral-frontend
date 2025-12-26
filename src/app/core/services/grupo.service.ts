import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Grupo,
  CreateGrupoDto,
  UpdateGrupoDto
} from '../models/pastoral.model';
import { UserSimple } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class GrupoService {
  private readonly API_URL = `${environment.apiUrl}/grupos`;

  constructor(private http: HttpClient) {}

  getAll(incluirInativos: boolean = false): Observable<Grupo[]> {
    const params = new HttpParams().set('incluirInativos', incluirInativos.toString());
    return this.http.get<Grupo[]>(this.API_URL, { params });
  }

  getById(id: string): Observable<Grupo> {
    return this.http.get<Grupo>(`${this.API_URL}/${id}`);
  }

  getByPastoral(pastoralId: string, incluirInativos: boolean = false): Observable<Grupo[]> {
    const params = new HttpParams().set('incluirInativos', incluirInativos.toString());
    return this.http.get<Grupo[]>(`${this.API_URL}/pastoral/${pastoralId}`, { params });
  }

  create(data: CreateGrupoDto): Observable<Grupo> {
    return this.http.post<Grupo>(this.API_URL, data);
  }

  update(id: string, data: UpdateGrupoDto): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}`, data);
  }

  getMembros(id: string): Observable<UserSimple[]> {
    return this.http.get<UserSimple[]>(`${this.API_URL}/${id}/membros`);
  }

  addMembro(grupoId: string, userId: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${grupoId}/membros/${userId}`, {});
  }

  removeMembro(grupoId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${grupoId}/membros/${userId}`);
  }

  silenciarNotificacoes(grupoId: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${grupoId}/silenciar-notificacoes`, {});
  }

  ativarNotificacoes(grupoId: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${grupoId}/ativar-notificacoes`, {});
  }

  entrarNoGrupo(grupoId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/${grupoId}/entrar`, {});
  }

  sairDoGrupo(grupoId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/${grupoId}/sair`, {});
  }

  ativar(id: string): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${id}/ativar`, {});
  }

  desativar(id: string): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${id}/desativar`, {});
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
