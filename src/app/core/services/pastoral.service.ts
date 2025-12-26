import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Pastoral,
  CreatePastoralDto,
  UpdatePastoralDto
} from '../models/pastoral.model';

@Injectable({
  providedIn: 'root'
})
export class PastoralService {
  private readonly API_URL = `${environment.apiUrl}/pastorais`;

  private selectedPastoralSignal = signal<Pastoral | null>(null);
  public selectedPastoral = this.selectedPastoralSignal.asReadonly();

  constructor(private http: HttpClient) {}

  getAll(incluirInativas: boolean = false): Observable<Pastoral[]> {
    const params = new HttpParams().set('incluirInativas', incluirInativas.toString());
    return this.http.get<Pastoral[]>(this.API_URL, { params });
  }

  getById(id: string): Observable<Pastoral> {
    return this.http.get<Pastoral>(`${this.API_URL}/${id}`);
  }

  create(data: CreatePastoralDto): Observable<Pastoral> {
    return this.http.post<Pastoral>(this.API_URL, data);
  }

  update(id: string, data: UpdatePastoralDto): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}`, data);
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

  updateColor(id: string, color: string): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${id}/cor`, { cor: color });
  }

  selectPastoral(pastoral: Pastoral | null): void {
    this.selectedPastoralSignal.set(pastoral);
  }
}
