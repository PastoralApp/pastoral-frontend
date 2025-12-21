import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Post, CreatePostDto, UpdatePostDto, PostComment, CreateCommentDto } from '../models/post.model';

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

  toggleReaction(postId: string): Observable<{ likesCount: number; userHasReacted: boolean }> {
    return this.http.post<{ likesCount: number; userHasReacted: boolean }>(
      `${this.apiUrl}/${postId}/react`,
      {}
    );
  }

  addComment(postId: string, comment: CreateCommentDto): Observable<PostComment> {
    return this.http.post<PostComment>(`${this.apiUrl}/${postId}/comments`, comment);
  }

  getComments(postId: string): Observable<PostComment[]> {
    return this.http.get<PostComment[]>(`${this.apiUrl}/${postId}/comments`);
  }

  deleteComment(commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/comments/${commentId}`);
  }

  sharePost(postId: string): Observable<{ sharesCount: number }> {
    return this.http.post<{ sharesCount: number }>(`${this.apiUrl}/${postId}/share`, {});
  }

  toggleSave(postId: string): Observable<{ saved: boolean }> {
    return this.http.post<{ saved: boolean }>(`${this.apiUrl}/${postId}/save`, {});
  }

  getSavedPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/saved`);
  }

  fixPost(postId: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${postId}/fixar`, {});
  }

  unfixPost(postId: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${postId}/desfixar`, {});
  }

  activatePost(postId: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${postId}/ativar`, {});
  }

  deactivatePost(postId: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${postId}/desativar`, {});
  }
}
