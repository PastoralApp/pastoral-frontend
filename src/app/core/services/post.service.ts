import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Post, CreatePostDto, UpdatePostDto } from '../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl);
  }

  getById(id: string): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${id}`);
  }

  getRecent(count: number = 10): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/recent?count=${count}`);
  }

  getPinned(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/pinned`);
  }

  create(post: CreatePostDto): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, post);
  }

  update(id: string, post: UpdatePostDto): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/${id}`, post);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  togglePin(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/pin`, {});
  }
}
