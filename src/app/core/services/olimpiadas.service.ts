import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Olimpiadas, CreateOlimpiadasDto, StatusJogo } from '../models/jogos.model';

@Injectable({
  providedIn: 'root'
})
export class OlimpiadasService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/olimpiadas`;

  getAll(): Observable<Olimpiadas[]> {
    return this.http.get<Olimpiadas[]>(this.apiUrl);
  }

  getById(id: string): Observable<Olimpiadas> {
    return this.http.get<Olimpiadas>(`${this.apiUrl}/${id}`);
  }

  getByPastoral(pastoralId: string): Observable<Olimpiadas[]> {
    return this.http.get<Olimpiadas[]>(`${this.apiUrl}/pastoral/${pastoralId}`);
  }

  getByStatus(status: StatusJogo): Observable<Olimpiadas[]> {
    return this.http.get<Olimpiadas[]>(`${this.apiUrl}/status/${status}`);
  }

  getByAno(ano: number): Observable<Olimpiadas[]> {
    return this.http.get<Olimpiadas[]>(`${this.apiUrl}/ano/${ano}`);
  }

  create(dto: CreateOlimpiadasDto): Observable<Olimpiadas> {
    return this.http.post<Olimpiadas>(this.apiUrl, dto);
  }

  update(id: string, dto: CreateOlimpiadasDto): Observable<Olimpiadas> {
    return this.http.put<Olimpiadas>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateStatus(id: string, status: StatusJogo): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, { status });
  }
}
