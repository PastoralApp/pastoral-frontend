import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Guia, CreateGuiaDto, StatusJogo } from '../models/jogos.model';

@Injectable({
  providedIn: 'root'
})
export class GuiaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/guia`;

  getAll(): Observable<Guia[]> {
    return this.http.get<Guia[]>(this.apiUrl);
  }

  getById(id: string): Observable<Guia> {
    return this.http.get<Guia>(`${this.apiUrl}/${id}`);
  }

  getByPastoral(pastoralId: string): Observable<Guia[]> {
    return this.http.get<Guia[]>(`${this.apiUrl}/pastoral/${pastoralId}`);
  }

  getByStatus(status: StatusJogo): Observable<Guia[]> {
    return this.http.get<Guia[]>(`${this.apiUrl}/status/${status}`);
  }

  getByAno(ano: number): Observable<Guia[]> {
    return this.http.get<Guia[]>(`${this.apiUrl}/ano/${ano}`);
  }

  create(dto: CreateGuiaDto): Observable<Guia> {
    return this.http.post<Guia>(this.apiUrl, dto);
  }

  update(id: string, dto: CreateGuiaDto): Observable<Guia> {
    return this.http.put<Guia>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateStatus(id: string, status: StatusJogo): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, { status });
  }
}
