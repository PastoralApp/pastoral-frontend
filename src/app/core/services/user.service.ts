import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User,
  UserSimple,
  CreateUserDto,
  UpdateUserDto,
  UpdateProfileDto,
  UpdateRoleDto,
  UpdateUserProfileDto,
  UpdateUserRoleDto,
  UpdateUserAdminDto
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL);
  }

  getById(id: string): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/${id}`);
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/me`);
  }

  getByGrupo(grupoId: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/grupo/${grupoId}`);
  }

  create(data: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.API_URL, data);
  }

  update(id: string, data: UpdateUserDto): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}`, data);
  }

  updateMyProfile(data: UpdateProfileDto): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/me/profile`, data);
  }

  updateUserProfile(userId: string, data: UpdateUserProfileDto): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${userId}/profile`, data);
  }

  updateUserRole(userId: string, data: UpdateUserRoleDto): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${userId}/role`, data);
  }

  updateRole(id: string, data: UpdateRoleDto): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${id}/role`, data);
  }

  ativar(id: string): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${id}/ativar`, {});
  }

  desativar(id: string): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${id}/desativar`, {});
  }

  addToGrupo(userId: string, grupoId: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${userId}/grupos/${grupoId}`, {});
  }

  removeFromGrupo(userId: string, grupoId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${userId}/grupos/${grupoId}`);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  createAdmin(data: CreateUserDto): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/admin`, data);
  }

  updateAdmin(id: string, data: UpdateUserAdminDto): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/admin/${id}`, data);
  }

  addTag(userId: string, tagId: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL.replace('/users', '/tags')}/${tagId}/users/${userId}`, {});
  }

  removeTag(userId: string, tagId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL.replace('/users', '/tags')}/${tagId}/users/${userId}`);
  }
}
