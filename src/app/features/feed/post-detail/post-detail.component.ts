import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../../core/services/post.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';
import { PostDetailDto } from '../../../core/models/post.model';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss']
})
export class PostDetailComponent implements OnInit {
  post = signal<PostDetailDto | null>(null);
  loading = signal(true);
  newComment = signal('');
  currentUserId = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUserId.set(user.id);
    }
  }

  ngOnInit(): void {
    const postId = this.route.snapshot.paramMap.get('id');
    if (postId) {
      this.loadPost(postId);
    } else {
      this.toastService.error('Post não encontrado');
      this.router.navigate(['/feed']);
    }
  }

  private loadPost(postId: string): void {
    this.loading.set(true);
    this.postService.getPostDetail(postId).subscribe({
      next: (post) => {
        this.post.set(post);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar post:', error);
        this.toastService.error('Erro ao carregar post');
        this.router.navigate(['/feed']);
        this.loading.set(false);
      }
    });
  }

  onLike(): void {
    const postData = this.post();
    if (!postData) return;

    this.postService.reactToPost(postData.id).subscribe({
      next: (response) => {
        this.post.update(p => p ? {
          ...p,
          isLiked: response.reacted,
          likesCount: response.likesCount
        } : null);
      },
      error: (error) => {
        console.error('Erro ao reagir ao post:', error);
        this.toastService.error('Erro ao reagir ao post');
      }
    });
  }

  onSave(): void {
    const postData = this.post();
    if (!postData) return;

    this.postService.savePost(postData.id).subscribe({
      next: (response) => {
        this.post.update(p => p ? {
          ...p,
          isSaved: response.saved
        } : null);
        this.toastService.success(response.saved ? 'Post salvo' : 'Post removido dos salvos');
      },
      error: (error) => {
        console.error('Erro ao salvar post:', error);
        this.toastService.error('Erro ao salvar post');
      }
    });
  }

  onComment(): void {
    const postData = this.post();
    const commentText = this.newComment().trim();
    
    if (!postData || !commentText) return;

    this.postService.addComment(postData.id, commentText).subscribe({
      next: (comment) => {
        this.post.update(p => {
          if (!p) return null;
          return {
            ...p,
            comments: [...p.comments, comment],
            commentsCount: p.commentsCount + 1
          };
        });
        this.newComment.set('');
        this.toastService.success('Comentário adicionado');
      },
      error: (error) => {
        console.error('Erro ao adicionar comentário:', error);
        this.toastService.error('Erro ao adicionar comentário');
      }
    });
  }

  onDeleteComment(commentId: string): void {
    if (!confirm('Deseja realmente excluir este comentário?')) return;

    this.postService.deleteComment(commentId).subscribe({
      next: () => {
        this.post.update(p => {
          if (!p) return null;
          return {
            ...p,
            comments: p.comments.filter(c => c.id !== commentId),
            commentsCount: p.commentsCount - 1
          };
        });
        this.toastService.success('Comentário excluído');
      },
      error: (error) => {
        console.error('Erro ao excluir comentário:', error);
        this.toastService.error('Erro ao excluir comentário');
      }
    });
  }

  onShare(): void {
    const postData = this.post();
    if (!postData) return;

    const url = `${window.location.origin}/post/${postData.id}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        this.toastService.success('Link copiado para a área de transferência!');
        
        // Registra o compartilhamento no backend
        this.postService.sharePost(postData.id).subscribe({
          next: (response) => {
            this.post.update(p => p ? { ...p, sharesCount: response.sharesCount } : null);
          },
          error: (error) => {
            console.error('Erro ao registrar compartilhamento:', error);
          }
        });
      }).catch(err => {
        console.error('Erro ao copiar link:', err);
        this.toastService.error('Erro ao copiar link');
      });
    } else {
      // Fallback para navegadores que não suportam clipboard API
      this.toastService.info(`Link: ${url}`);
    }
  }

  goBack(): void {
    this.router.navigate(['/feed']);
  }

  getTimeDiff(date: Date | string): string {
    const now = new Date();
    const postDate = typeof date === 'string' ? new Date(date) : date;
    const diff = now.getTime() - postDate.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  }

  canDeleteComment(comment: any): boolean {
    const userId = this.currentUserId();
    const postData = this.post();
    return (userId === comment.userId) || (postData !== null && userId === postData.authorId);
  }
}
