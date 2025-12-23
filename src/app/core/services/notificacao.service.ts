import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Notificacao,
  NotificacaoNaoLida,
  CreateNotificacaoDto,
  UpdateNotificacaoDto
} from '../models/notificacao.model';

@Injectable({
  providedIn: 'root'
})
export class NotificacaoService {
  private readonly API_URL = `${environment.apiUrl}/notificacoes`;

  constructor(private http: HttpClient) {}

  getMinhas(): Observable<Notificacao[]> {
    return this.http.get<Notificacao[]>(`${this.API_URL}/minhas`);
  }

  getNaoLidas(): Observable<NotificacaoNaoLida[]> {
    return this.http.get<NotificacaoNaoLida[]>(`${this.API_URL}/nao-lidas`);
  }

  marcarLida(id: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${id}/marcar-lida`, {});
  }

  getByGrupo(grupoId: string, incluirInativas: boolean = false): Observable<Notificacao[]> {
    const params = new HttpParams().set('incluirInativas', incluirInativas.toString());
    return this.http.get<Notificacao[]>(`${this.API_URL}/grupo/${grupoId}`, { params });
  }

  getById(id: string): Observable<Notificacao> {
    return this.http.get<Notificacao>(`${this.API_URL}/${id}`);
  }

  create(data: CreateNotificacaoDto): Observable<Notificacao> {
    return this.http.post<Notificacao>(this.API_URL, data);
  }

  update(id: string, data: UpdateNotificacaoDto): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  ativar(id: string): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${id}/ativar`, {});
  }

  desativar(id: string): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${id}/desativar`, {});
  }
}
