import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Medalha, CreateMedalhaDto, TipoMedalha } from '../models/jogos.model';

@Injectable({
  providedIn: 'root'
})
export class MedalhaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/medalhas`;

  getAll(): Observable<Medalha[]> {
    return this.http.get<Medalha[]>(this.apiUrl);
  }

  getById(id: string): Observable<Medalha> {
    return this.http.get<Medalha>(`${this.apiUrl}/${id}`);
  }

  getByJogo(jogoId: string): Observable<Medalha[]> {
    return this.http.get<Medalha[]>(`${this.apiUrl}/jogo/${jogoId}`);
  }

  getByGrupo(grupoId: string): Observable<Medalha[]> {
    return this.http.get<Medalha[]>(`${this.apiUrl}/grupo/${grupoId}`);
  }

  getByParticipante(participanteId: string): Observable<Medalha[]> {
    return this.http.get<Medalha[]>(`${this.apiUrl}/participante/${participanteId}`);
  }

  getByAno(ano: number): Observable<Medalha[]> {
    return this.http.get<Medalha[]>(`${this.apiUrl}/ano/${ano}`);
  }

  getByTipo(tipo: TipoMedalha): Observable<Medalha[]> {
    return this.http.get<Medalha[]>(`${this.apiUrl}/tipo/${tipo}`);
  }

  create(dto: CreateMedalhaDto): Observable<Medalha> {
    return this.http.post<Medalha>(this.apiUrl, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
