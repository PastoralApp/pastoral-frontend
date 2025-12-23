import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Post,
  CreatePostDto,
  UpdatePostDto,
  ReactResponse,
  ShareResponse,
  SaveResponse,
  PostComment,
  CreateCommentDto
} from '../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private readonly API_URL = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Post[]> {
    return this.http.get<Post[]>(this.API_URL);
  }

  getRecent(count: number = 50): Observable<Post[]> {
    const params = new HttpParams().set('count', count.toString());
    return this.http.get<Post[]>(`${this.API_URL}/recent`, { params });
  }

  getPinned(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.API_URL}/pinned`);
  }

  getByPastoral(pastoralId: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.API_URL}/pastoral/${pastoralId}`);
  }

  getByGrupo(grupoId: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.API_URL}/grupo/${grupoId}`);
  }

  getByUser(userId: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.API_URL}/user/${userId}`);
  }

  getById(id: string): Observable<Post> {
    return this.http.get<Post>(`${this.API_URL}/${id}`);
  }

  create(data: CreatePostDto): Observable<Post> {
    return this.http.post<Post>(this.API_URL, data);
  }

  update(id: string, data: UpdatePostDto): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  pin(id: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${id}/pin`, {});
  }

  unpin(id: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${id}/unpin`, {});
  }

  react(id: string): Observable<ReactResponse> {
    return this.http.post<ReactResponse>(`${this.API_URL}/${id}/react`, {});
  }

  getComments(id: string): Observable<PostComment[]> {
    return this.http.get<PostComment[]>(`${this.API_URL}/${id}/comments`);
  }

  addComment(id: string, data: CreateCommentDto): Observable<PostComment> {
    return this.http.post<PostComment>(`${this.API_URL}/${id}/comments`, data);
  }

  deleteComment(commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/comments/${commentId}`);
  }

  share(id: string): Observable<ShareResponse> {
    return this.http.post<ShareResponse>(`${this.API_URL}/${id}/share`, {});
  }

  save(id: string): Observable<SaveResponse> {
    return this.http.post<SaveResponse>(`${this.API_URL}/${id}/save`, {});
  }

  getSaved(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.API_URL}/saved`);
  }
}
