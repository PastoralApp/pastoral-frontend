import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostService } from '../../core/services/post.service';
import { AuthService } from '../../core/services/auth.service';
import { Post } from '../../core/models/post.model';
import { PostCardComponent } from '../feed/components/post-card/post-card.component';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-meus-posts',
  standalone: true,
  imports: [CommonModule, RouterLink, PostCardComponent],
  templateUrl: './meus-posts.component.html',
  styleUrl: './meus-posts.component.scss'
})
export class MeusPostsComponent implements OnInit {
  private postService = inject(PostService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  posts = signal<Post[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadMyPosts();
  }

  loadMyPosts(): void {
    this.isLoading.set(true);

    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      this.toastService.error('Usuário não autenticado');
      this.isLoading.set(false);
      return;
    }

    this.postService.getByUser(currentUser.id).subscribe({
      next: (posts) => {
        this.posts.set(posts);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.toastService.error('Erro ao carregar seus posts');
        this.isLoading.set(false);
      }
    });
  }

  onPostDeleted(postId: string): void {
    this.posts.update(posts => posts.filter(p => p.id !== postId));
  }

  onPostUpdated(updatedPost: Post): void {
    this.posts.update(posts => posts.map(p => p.id === updatedPost.id ? updatedPost : p));
  }

  get totalPosts(): number {
    return this.posts().length;
  }
}
