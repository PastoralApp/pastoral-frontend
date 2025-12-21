import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Pastoral, CreatePastoralDto } from '../models/pastoral.model';

@Injectable({
  providedIn: 'root'
})
export class PastoralService {
  private apiUrl = `${environment.apiUrl}/pastorais`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Pastoral[]> {
    return this.http.get<Pastoral[]>(this.apiUrl);
  }

  getById(id: string): Observable<Pastoral> {
    return this.http.get<Pastoral>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreatePastoralDto): Observable<Pastoral> {
    return this.http.post<Pastoral>(this.apiUrl, dto);
  }

  update(id: string, dto: CreatePastoralDto): Observable<void> {
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
