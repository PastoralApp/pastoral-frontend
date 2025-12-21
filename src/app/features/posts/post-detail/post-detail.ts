import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../../../core/services/post.service';
import { AuthService } from '../../../core/services/auth.service';
import { Post } from '../../../core/models/post.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.scss',
})
export class PostDetail implements OnInit {
  post: Post | null = null;
  loading = true;
  currentUser: User | null = null;
  canEdit = false;
  canDelete = false;

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
        this.checkPermissions();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar post:', error);
        this.loading = false;
        this.router.navigate(['/posts']);
      }
    });
  }

  checkPermissions(): void {
    if (!this.post || !this.currentUser) return;

    const isAuthor = this.post.autorId === this.currentUser.id;
    const isAdmin = this.currentUser.role?.type! >= 2;

    this.canEdit = isAuthor || isAdmin;
    this.canDelete = isAuthor || isAdmin;
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
