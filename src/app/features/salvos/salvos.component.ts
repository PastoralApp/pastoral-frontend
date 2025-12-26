import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostService } from '../../core/services/post.service';
import { Post } from '../../core/models/post.model';
import { PostCardComponent } from '../feed/components/post-card/post-card.component';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-salvos',
  standalone: true,
  imports: [CommonModule, PostCardComponent],
  templateUrl: './salvos.component.html',
  styleUrl: './salvos.component.scss'
})
export class SalvosComponent implements OnInit {
  private postService = inject(PostService);
  private toastService = inject(ToastService);

  posts = signal<Post[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadSalvos();
  }

  loadSalvos(): void {
    this.isLoading.set(true);

    this.postService.getSaved().subscribe({
      next: (posts) => {
        this.posts.set(posts);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.toastService.error('Erro ao carregar posts salvos');
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
}
