import { Component, inject, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Post, PostComment, PostType, CreateCommentDto, TipoPastoral } from '../../../../core/models/post.model';
import { PostService } from '../../../../core/services/post.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmationService } from '../../../../shared/components/confirmation-modal';
import { ToastService } from '../../../../shared/services/toast.service';

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
  private confirmationService = inject(ConfirmationService);
  private toastService = inject(ToastService);

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
  isPinning = signal(false);

  get currentUserId(): string {
    return this.authService.getCurrentUserId();
  }

  get isAuthor(): boolean {
    return this.post.authorId === this.currentUserId;
  }

  get canPin(): boolean {
    const user = this.authService.currentUser();
    const role = user?.role || '';
    return role === 'Administrador' || role === 'Coordenador Geral' || role === 'Coordenador de Grupo';
  }

  get pinTypeLabel(): string {
    if (!this.post.isPinned || !this.post.pinType) return '';
    const labels: Record<string, string> = {
      'Admin': 'FIXADO ADMIN',
      'Coordenador Geral': 'FIXADO COORD. GERAL',
      'Coordenador de Grupo': 'FIXADO COORD. GRUPO'
    };
    return labels[this.post.pinType] || 'FIXADO';
  }

  get pinTypeBadgeClass(): string {
    if (!this.post.isPinned || !this.post.pinType) return '';
    const classes: Record<string, string> = {
      'Admin': 'pin-badge-admin',
      'Coordenador Geral': 'pin-badge-coord-geral',
      'Coordenador de Grupo': 'pin-badge-coord-grupo'
    };
    return classes[this.post.pinType] || 'pin-badge-default';
  }

  get postTypeLabel(): string {
    const labels: Record<PostType, string> = {
      [PostType.Comum]: 'Comum',
      [PostType.Oficial]: 'Oficial',
      [PostType.Fixada]: 'Fixado',
      [PostType.Anuncio]: 'Anúncio',
      [PostType.Aviso]: 'Aviso'
    };
    return labels[this.post.type] || '';
  }

  get pastoralLabel(): string {
    const labels: Record<TipoPastoral, string> = {
      [TipoPastoral.PA]: 'PA',
      [TipoPastoral.PJ]: 'PJ',
      [TipoPastoral.PJA]: 'PJA',
      [TipoPastoral.PANSA]: 'PANSA',
      [TipoPastoral.OUTRA]: 'OUTRA',
      [TipoPastoral.Geral]: 'GERAL'
    };
    return labels[this.post.tipoPastoral] || '';
  }

  get pastoralFullName(): string {
    const labels: Record<TipoPastoral, string> = {
      [TipoPastoral.PA]: 'Pastoral Adolescentes',
      [TipoPastoral.PJ]: 'Pastoral Jovens',
      [TipoPastoral.PJA]: 'Pastoral Jovem Adulto',
      [TipoPastoral.PANSA]: 'Pansa',
      [TipoPastoral.OUTRA]: 'Outra',
      [TipoPastoral.Geral]: 'Geral'
    };
    return labels[this.post.tipoPastoral] || '';
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
        this.toastService.error('Erro ao carregar comentários');
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
          likesCount: response.likesCount,
          isLiked: response.reacted
        };
        this.updated.emit(this.post);
        this.isReacting.set(false);
      },
      error: () => {
        this.toastService.error('Erro ao reagir ao post');
        this.isReacting.set(false);
      }
    });
  }

  save(): void {
    if (this.isSaving()) return;
    this.isSaving.set(true);

    this.postService.save(this.post.id).subscribe({
      next: () => {
        this.toastService.success('Post salvo!');
        this.updated.emit(this.post);
        this.isSaving.set(false);
      },
      error: () => {
        this.toastService.error('Erro ao salvar post');
        this.isSaving.set(false);
      }
    });
  }

  share(): void {
    const url = `${window.location.origin}/post/${this.post.id}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        this.toastService.success('Link copiado para a área de transferência!');
        
        this.postService.share(this.post.id).subscribe({
          next: () => {
            this.updated.emit(this.post);
          },
          error: () => {
            console.error('Erro ao registrar compartilhamento');
          }
        });
      }).catch(() => {
        this.toastService.error('Erro ao copiar link');
      });
    } else {
      this.toastService.info(`Link: ${url}`);
      this.postService.share(this.post.id).subscribe({
        next: () => {
          this.updated.emit(this.post);
        },
        error: () => {
          this.toastService.error('Erro ao compartilhar post');
        }
      });
    }
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
        this.toastService.error('Erro ao adicionar comentário');
        this.submittingComment.set(false);
      }
    });
  }

  async deleteComment(commentId: string): Promise<void> {
    const confirmed = await this.confirmationService.confirmDelete('este comentário');
    if (!confirmed) return;

    this.postService.deleteComment(commentId).subscribe({
      next: () => {
        this.comments.update(c => c.filter(comment => comment.id !== commentId));
        this.updated.emit(this.post);
        this.toastService.success('Comentário excluído');
      },
      error: () => {
        this.toastService.error('Erro ao excluir comentário');
      }
    });
  }

  async deletePost(): Promise<void> {
    const confirmed = await this.confirmationService.confirmDelete('este post');
    if (!confirmed) return;

    this.postService.delete(this.post.id).subscribe({
      next: () => {
        this.toastService.success('Post excluído');
        this.deleted.emit(this.post.id);
      },
      error: () => {
        this.toastService.error('Erro ao excluir post');
      }
    });
  }

  toggleOptions(): void {
    this.showOptions.update(v => !v);
  }

  togglePin(): void {
    if (this.isPinning()) return;
    this.isPinning.set(true);

    if (this.post.isPinned) {
      this.postService.unpin(this.post.id).subscribe({
        next: () => {
          this.post = { ...this.post, isPinned: false, pinType: undefined };
          this.updated.emit(this.post);
          this.toastService.success('Post desafixado');
          this.isPinning.set(false);
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Erro ao desafixar post');
          this.isPinning.set(false);
        }
      });
    } else {
      this.postService.pin(this.post.id).subscribe({
        next: () => {
          this.toastService.success('Post fixado');
          this.isPinning.set(false);
          window.location.reload();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Erro ao fixar post');
          this.isPinning.set(false);
        }
      });
    }
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
