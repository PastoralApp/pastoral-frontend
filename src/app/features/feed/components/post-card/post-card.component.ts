import { Component, inject, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Post, PostComment, PostType, CreateCommentDto } from '../../../../core/models/post.model';
import { PostService } from '../../../../core/services/post.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.scss'
})
export class PostCardComponent {
  private postService = inject(PostService);
  private authService = inject(AuthService);

  @Input({ required: true }) post!: Post;
  @Input() isPinned = false;
  @Output() deleted = new EventEmitter<string>();
  @Output() updated = new EventEmitter<Post>();

  showComments = signal(false);
  comments = signal<PostComment[]>([]);
  loadingComments = signal(false);
  newComment = signal('');
  submittingComment = signal(false);
  showOptions = signal(false);
  isReacting = signal(false);
  isSaving = signal(false);

  get currentUserId(): string {
    return this.authService.getCurrentUserId();
  }

  get isAuthor(): boolean {
    return this.post.authorId === this.currentUserId;
  }

  get postTypeLabel(): string {
    const labels: Record<PostType, string> = {
      [PostType.Comum]: 'Comum',
      [PostType.Oficial]: 'Oficial',
      [PostType.Fixada]: 'Fixado',
      [PostType.Anuncio]: 'Anúncio'
    };
    return labels[this.post.type] || '';
  }

  toggleComments(): void {
    this.showComments.update(v => !v);
    if (this.showComments() && this.comments().length === 0) {
      this.loadComments();
    }
  }

  loadComments(): void {
    this.loadingComments.set(true);
    this.postService.getComments(this.post.id).subscribe({
      next: (comments) => {
        this.comments.set(comments);
        this.loadingComments.set(false);
      },
      error: () => {
        this.loadingComments.set(false);
      }
    });
  }

  react(): void {
    if (this.isReacting()) return;
    this.isReacting.set(true);

    this.postService.react(this.post.id).subscribe({
      next: (response) => {
        this.post = {
          ...this.post,
          likesCount: response.likesCount
        };
        this.updated.emit(this.post);
        this.isReacting.set(false);
      },
      error: () => {
        this.isReacting.set(false);
      }
    });
  }

  save(): void {
    if (this.isSaving()) return;
    this.isSaving.set(true);

    this.postService.save(this.post.id).subscribe({
      next: () => {
        this.updated.emit(this.post);
        this.isSaving.set(false);
      },
      error: () => {
        this.isSaving.set(false);
      }
    });
  }

  share(): void {
    this.postService.share(this.post.id).subscribe({
      next: () => {
        this.updated.emit(this.post);
      }
    });
  }

  submitComment(): void {
    const content = this.newComment().trim();
    if (!content || this.submittingComment()) return;

    this.submittingComment.set(true);
    const dto: CreateCommentDto = { conteudo: content };
    this.postService.addComment(this.post.id, dto).subscribe({
      next: (comment) => {
        this.comments.update(c => [...c, comment]);
        this.updated.emit(this.post);
        this.newComment.set('');
        this.submittingComment.set(false);
      },
      error: () => {
        this.submittingComment.set(false);
      }
    });
  }

  deleteComment(commentId: string): void {
    this.postService.deleteComment(commentId).subscribe({
      next: () => {
        this.comments.update(c => c.filter(comment => comment.id !== commentId));
        this.updated.emit(this.post);
      }
    });
  }

  deletePost(): void {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;

    this.postService.delete(this.post.id).subscribe({
      next: () => {
        this.deleted.emit(this.post.id);
      }
    });
  }

  toggleOptions(): void {
    this.showOptions.update(v => !v);
  }

  formatDate(date: string): string {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return d.toLocaleDateString('pt-BR');
  }
}
