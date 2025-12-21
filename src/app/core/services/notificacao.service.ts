import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Notificacao, CreateNotificacaoDto, UpdateNotificacaoDto } from '../models/notificacao.model';

@Injectable({
  providedIn: 'root'
})
export class NotificacaoService {
  private apiUrl = `${environment.apiUrl}/notificacoes`;

  constructor(private http: HttpClient) {}

  getMinhasNotificacoes(): Observable<Notificacao[]> {
    return this.http.get<Notificacao[]>(`${this.apiUrl}/minhas`);
  }

  getNaoLidas(): Observable<Notificacao[]> {
    return this.http.get<Notificacao[]>(`${this.apiUrl}/nao-lidas`);
  }

  marcarComoLida(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/marcar-lida`, {});
  }

  getByGrupo(grupoId: string, incluirInativas = false): Observable<Notificacao[]> {
    return this.http.get<Notificacao[]>(`${this.apiUrl}/grupo/${grupoId}`, {
      params: { incluirInativas: incluirInativas.toString() }
    });
  }

  create(dto: CreateNotificacaoDto): Observable<Notificacao> {
    return this.http.post<Notificacao>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdateNotificacaoDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  ativar(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/ativar`, {});
  }

  desativar(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/desativar`, {});
  }
}
