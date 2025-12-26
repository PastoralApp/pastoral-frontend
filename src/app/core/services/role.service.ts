import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role, CreateRoleDto } from '../models/role.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly API_URL = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Role[]> {
    return this.http.get<Role[]>(this.API_URL);
  }

  getById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.API_URL}/${id}`);
  }

  create(dto: CreateRoleDto): Observable<Role> {
    return this.http.post<Role>(this.API_URL, dto);
  }

  update(id: string, dto: CreateRoleDto): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
