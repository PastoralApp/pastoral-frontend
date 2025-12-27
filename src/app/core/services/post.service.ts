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
  CreateCommentDto,
  TipoPastoral,
  ChangePostTypeDto,
  PostDetailDto
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

  getByTipoPastoral(tipoPastoral: TipoPastoral): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.API_URL}/tipo-pastoral/${tipoPastoral}`);
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

  getPostDetail(id: string): Observable<PostDetailDto> {
    return this.http.get<PostDetailDto>(`${this.API_URL}/${id}/detail`);
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

  pin(id: string, pinType: string = 'Geral'): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${id}/pin`, { pinType });
  }

  unpin(id: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${id}/unpin`, {});
  }

  react(id: string): Observable<ReactResponse> {
    return this.http.post<ReactResponse>(`${this.API_URL}/${id}/react`, {});
  }

  reactToPost(id: string): Observable<ReactResponse> {
    return this.react(id);
  }

  getComments(id: string): Observable<PostComment[]> {
    return this.http.get<PostComment[]>(`${this.API_URL}/${id}/comments`);
  }

  addComment(id: string, data: CreateCommentDto): Observable<PostComment>;
  addComment(id: string, content: string): Observable<PostComment>;
  addComment(id: string, dataOrContent: CreateCommentDto | string): Observable<PostComment> {
    const data = typeof dataOrContent === 'string' 
      ? { conteudo: dataOrContent } 
      : dataOrContent;
    return this.http.post<PostComment>(`${this.API_URL}/${id}/comments`, data);
  }

  deleteComment(commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/comments/${commentId}`);
  }

  share(id: string): Observable<ShareResponse> {
    return this.http.post<ShareResponse>(`${this.API_URL}/${id}/share`, {});
  }

  sharePost(id: string): Observable<ShareResponse> {
    return this.share(id);
  }

  save(id: string): Observable<SaveResponse> {
    return this.http.post<SaveResponse>(`${this.API_URL}/${id}/save`, {});
  }

  savePost(id: string): Observable<SaveResponse> {
    return this.save(id);
  }

  getSaved(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.API_URL}/saved`);
  }

  getAnuncios(count: number = 10): Observable<Post[]> {
    const params = new HttpParams().set('count', count.toString());
    return this.http.get<Post[]>(`${this.API_URL}/anuncios`, { params });
  }

  getAvisos(count: number = 10): Observable<Post[]> {
    const params = new HttpParams().set('count', count.toString());
    return this.http.get<Post[]>(`${this.API_URL}/avisos`, { params });
  }

  getAllAdmin(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.API_URL}/admin/all`);
  }

  getByUserAdmin(userId: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.API_URL}/admin/user/${userId}`);
  }

  deleteAdmin(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/admin/${id}`);
  }

  changePostType(id: string, data: ChangePostTypeDto): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/admin/${id}/type`, data);
  }
}
