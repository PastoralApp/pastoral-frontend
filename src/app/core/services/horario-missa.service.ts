import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  HorarioMissa,
  CreateHorarioMissaDto,
  UpdateHorarioMissaDto
} from '../models/igreja.model'

@Injectable({
  providedIn: 'root'
})
export class HorarioMissaService {
  private readonly API_URL = `${environment.apiUrl}/horariosmissas`;

  constructor(private http: HttpClient) {}

  getAll(incluirInativos: boolean = false): Observable<HorarioMissa[]> {
    const params = new HttpParams().set('incluirInativos', incluirInativos.toString());
    return this.http.get<HorarioMissa[]>(this.API_URL, { params });
  }

  getByIgreja(igrejaId: string, incluirInativos: boolean = false): Observable<HorarioMissa[]> {
    const params = new HttpParams().set('incluirInativos', incluirInativos.toString());
    return this.http.get<HorarioMissa[]>(`${this.API_URL}/igreja/${igrejaId}`, { params });
  }

  getByDia(diaSemana: number, incluirInativos: boolean = false): Observable<HorarioMissa[]> {
    const params = new HttpParams().set('incluirInativos', incluirInativos.toString());
    return this.http.get<HorarioMissa[]>(`${this.API_URL}/dia/${diaSemana}`, { params });
  }

  create(data: CreateHorarioMissaDto): Observable<HorarioMissa> {
    return this.http.post<HorarioMissa>(this.API_URL, data);
  }

  update(id: string, data: UpdateHorarioMissaDto): Observable<void> {
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
