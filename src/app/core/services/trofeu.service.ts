import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Trofeu, CreateTrofeuDto } from '../models/jogos.model';

@Injectable({
  providedIn: 'root'
})
export class TrofeuService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/trofeus`;

  getAll(): Observable<Trofeu[]> {
    return this.http.get<Trofeu[]>(this.apiUrl);
  }

  getById(id: string): Observable<Trofeu> {
    return this.http.get<Trofeu>(`${this.apiUrl}/${id}`);
  }

  getByJogo(jogoId: string): Observable<Trofeu[]> {
    return this.http.get<Trofeu[]>(`${this.apiUrl}/jogo/${jogoId}`);
  }

  getByGrupo(grupoId: string): Observable<Trofeu[]> {
    return this.http.get<Trofeu[]>(`${this.apiUrl}/grupo/${grupoId}`);
  }

  getByAno(ano: number): Observable<Trofeu[]> {
    return this.http.get<Trofeu[]>(`${this.apiUrl}/ano/${ano}`);
  }

  create(dto: CreateTrofeuDto): Observable<Trofeu> {
    return this.http.post<Trofeu>(this.apiUrl, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
