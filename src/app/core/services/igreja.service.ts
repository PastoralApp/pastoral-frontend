import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Igreja, CreateIgrejaDto } from '../models/igreja.model';

@Injectable({
  providedIn: 'root'
})
export class IgrejaService {
  private apiUrl = `${environment.apiUrl}/igrejas`;

  constructor(private http: HttpClient) {}

  getAll(incluirInativas = false): Observable<Igreja[]> {
    return this.http.get<Igreja[]>(this.apiUrl, {
      params: { incluirInativas: incluirInativas.toString() }
    });
  }

  getById(id: string): Observable<Igreja> {
    return this.http.get<Igreja>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateIgrejaDto): Observable<Igreja> {
    return this.http.post<Igreja>(this.apiUrl, dto);
  }

  update(id: string, dto: CreateIgrejaDto): Observable<void> {
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
