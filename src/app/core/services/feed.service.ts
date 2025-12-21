import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Post } from '../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class FeedService {
  private posts = signal<Post[]>([
    {
      id: '1',
      authorId: '1',
      authorName: 'Maria Santos',
      content: 'Que benção participar do encontro de hoje! Deus é maravilhoso! 🙏',
      createdAt: new Date('2024-12-20T10:30:00'),
      likes: 15,
      comments: [],
      pastoral: 'PA'
    },
    {
      id: '2',
      authorId: '2',
      authorName: 'Pedro Costa',
      content: 'Lembrando a todos do encontro de formação amanhã às 19h. Não faltem!',
      createdAt: new Date('2024-12-19T15:20:00'),
      likes: 8,
      comments: [],
      pastoral: 'PJ'
    },
    {
      id: '3',
      authorId: '3',
      authorName: 'Ana Paula',
      content: 'Paz e bem! Alguém pode me ajudar com o material para o próximo encontro?',
      createdAt: new Date('2024-12-18T14:10:00'),
      likes: 5,
      comments: [],
      pastoral: 'PA'
    }
  ]);

  public allPosts = this.posts.asReadonly();

  getPosts(): Observable<Post[]> {
    return of(this.posts()).pipe(delay(500));
  }

  createPost(content: string, authorId: string, authorName: string, pastoral: 'PA' | 'PJ'): Observable<Post> {
    const newPost: Post = {
      id: Date.now().toString(),
      authorId,
      authorName,
      content,
      createdAt: new Date(),
      likes: 0,
      comments: [],
      pastoral
    };

    this.posts.update(posts => [newPost, ...posts]);
    return of(newPost).pipe(delay(300));
  }

  likePost(postId: string): void {
    this.posts.update(posts =>
      posts.map(post =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  }
}
