import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PostService } from '../../../core/services/post.service';
import { AuthService } from '../../../core/services/auth.service';
import { Post, PostType } from '../../../core/models/post.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.scss',
})
export class PostDetail implements OnInit {
  post: Post | null = null;
  loading = true;
  errorMessage = '';
  currentUser: User | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPost(id);
    }
  }

  loadPost(id: string): void {
    this.loading = true;
    this.postService.getById(id).subscribe({
      next: (post) => {
        this.post = post;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar post:', error);
        this.errorMessage = 'Post não encontrado';
        this.loading = false;
      }
    });
  }

  canEdit(): boolean {
    if (!this.post || !this.currentUser) return false;
    const isAuthor = this.post.authorId === this.currentUser.id;
    const isAdmin = (this.currentUser.role?.type ?? 0) >= 2;
    return isAuthor || isAdmin;
  }

  getTypeBadgeClass(type: string): string {
    switch (type) {
      case 'Comum': return 'bg-info';
      case 'Oficial': return 'bg-success';
      case 'Fixada': return 'bg-warning text-dark';
      case 'Anuncio': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'Comum': return 'Comum';
      case 'Oficial': return 'Oficial';
      case 'Fixada': return 'Fixada';
      case 'Anuncio': return 'Anúncio';
      default: return type;
    }
  }

  deletePost(): void {
    if (!this.post) return;

    if (confirm('Deseja realmente excluir este post?')) {
      this.postService.delete(this.post.id!).subscribe({
        next: () => {
          this.router.navigate(['/posts']);
        },
        error: (error) => {
          console.error('Erro ao excluir post:', error);
          alert('Erro ao excluir post');
        }
      });
    }
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getPostTypeLabel(type: number): string {
    const types = ['Aviso', 'Evento', 'Reflex\u00e3o', 'Comunicado'];
    return types[type] || 'Post';
  }

  goBack(): void {
    this.router.navigate(['/posts']);
  }
}
