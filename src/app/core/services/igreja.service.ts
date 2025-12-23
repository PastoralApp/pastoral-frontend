import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Igreja,
  CreateIgrejaDto,
  UpdateIgrejaDto
} from  '../models/igreja.model';

@Injectable({
  providedIn: 'root'
})
export class IgrejaService {
  private readonly API_URL = `${environment.apiUrl}/igrejas`;

  constructor(private http: HttpClient) {}

  getAll(incluirInativas: boolean = false): Observable<Igreja[]> {
    const params = new HttpParams().set('incluirInativas', incluirInativas.toString());
    return this.http.get<Igreja[]>(this.API_URL, { params });
  }

  getById(id: string): Observable<Igreja> {
    return this.http.get<Igreja>(`${this.API_URL}/${id}`);
  }

  create(data: CreateIgrejaDto): Observable<Igreja> {
    return this.http.post<Igreja>(this.API_URL, data);
  }

  update(id: string, data: UpdateIgrejaDto): Observable<void> {
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
