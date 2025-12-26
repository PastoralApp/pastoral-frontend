import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Tag, CreateTagDto } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private readonly API_URL = `${environment.apiUrl}/tags`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Tag[]> {
    return this.http.get<Tag[]>(this.API_URL);
  }

  getById(id: string): Observable<Tag> {
    return this.http.get<Tag>(`${this.API_URL}/${id}`);
  }

  create(data: CreateTagDto): Observable<Tag> {
    return this.http.post<Tag>(this.API_URL, data);
  }

  update(id: string, data: CreateTagDto): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  addTagToUser(tagId: string, userId: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${tagId}/users/${userId}`, {});
  }

  removeTagFromUser(tagId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${tagId}/users/${userId}`);
  }
}
