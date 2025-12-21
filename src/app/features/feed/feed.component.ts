import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeedService } from '../../core/services/feed.service';
import { AuthService } from '../../core/services/auth.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { Post } from '../../core/models/post.model';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent],
  template: `
    <div class="feed-container">
      <app-card [elevated]="true" class="create-post">
        <form (ngSubmit)="createPost()" class="post-form">
          <textarea
            [(ngModel)]="newPostContent"
            name="content"
            placeholder="Compartilhe algo com a comunidade..."
            rows="3"
          ></textarea>
          <button type="submit" [disabled]="!newPostContent.trim()">
            Publicar
          </button>
        </form>
      </app-card>

      <div class="posts-list">
        @for (post of posts(); track post.id) {
          <app-card [elevated]="true" class="post-card">
            <div class="post-header">
              <div class="post-author">
                <div class="author-avatar">
                  {{ post.authorName.charAt(0) }}
                </div>
                <div class="author-info">
                  <h3 class="author-name">{{ post.authorName }}</h3>
                  <span class="post-date">{{ formatDate(post.createdAt) }}</span>
                </div>
              </div>
              <span class="pastoral-badge" [attr.data-pastoral]="post.pastoral">
                {{ post.pastoral }}
              </span>
            </div>

            <p class="post-content">{{ post.content }}</p>

            <div class="post-actions">
              <button class="action-btn" (click)="likePost(post.id)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{{ post.likes }}</span>
              </button>

              <button class="action-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{{ post.comments.length }}</span>
              </button>
            </div>
          </app-card>
        }
      </div>
    </div>
  `,
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit {
  private feedService = inject(FeedService);
  private authService = inject(AuthService);

  posts = signal<Post[]>([]);
  newPostContent = '';

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.feedService.getPosts().subscribe(posts => {
      this.posts.set(posts);
    });
  }

  createPost(): void {
    const user = this.authService.user();
    if (!user || !this.newPostContent.trim()) return;

    this.feedService.createPost(
      this.newPostContent,
      user.id,
      user.name,
      user.pastoral
    ).subscribe(() => {
      this.newPostContent = '';
      this.loadPosts();
    });
  }

  likePost(postId: string): void {
    this.feedService.likePost(postId);
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Agora';
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d atrás`;
    return new Date(date).toLocaleDateString('pt-BR');
  }
}
