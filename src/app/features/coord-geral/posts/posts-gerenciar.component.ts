import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PostService } from '../../../core/services/post.service';
import { UserService } from '../../../core/services/user.service';
import { Post } from '../../../core/models/post.model';
import { User } from '../../../core/models/user.model';
import { ToastService } from '../../../shared/services/toast.service';

type PostPinType = 'Geral' | 'PA' | 'PJ' | null;

@Component({
  selector: 'app-posts-gerenciar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './posts-gerenciar.component.html',
  styleUrl: './posts-gerenciar.component.scss'
})
export class PostsGerenciarComponent implements OnInit {
  private postService = inject(PostService);
  private userService = inject(UserService);
  private toastService = inject(ToastService);

  posts = signal<Post[]>([]);
  filteredPosts = signal<Post[]>([]);
  usuarios = signal<User[]>([]);
  isLoading = signal(true);
  
  searchTerm = signal('');
  selectedUserId = signal<string | null>(null);
  selectedPinType = signal<PostPinType>('Geral');

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    
    Promise.all([
      this.userService.getAll().toPromise(),
      this.postService.getAll().toPromise()
    ]).then(([users, posts]) => {
      this.usuarios.set(users || []);
      this.posts.set(posts || []);
      this.filteredPosts.set(posts || []);
      this.isLoading.set(false);
    }).catch(() => {
      this.toastService.error('Erro ao carregar dados');
      this.isLoading.set(false);
    });
  }

  onSearch(): void {
    this.filterPosts();
  }

  onUserFilter(): void {
    this.filterPosts();
  }

  private filterPosts(): void {
    let filtered = this.posts();

    if (this.selectedUserId()) {
      filtered = filtered.filter(p => p.authorId.toString() === this.selectedUserId());
    }

    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(p =>
        p.content.toLowerCase().includes(search) ||
        p.authorName.toLowerCase().includes(search)
      );
    }

    this.filteredPosts.set(filtered);
  }

  deletePost(postId: string): void {
    if (!confirm('Tem certeza que deseja excluir este post?')) {
      return;
    }

    this.postService.delete(postId.toString()).subscribe({
      next: () => {
        const updated = this.posts().filter(p => p.id !== postId);
        this.posts.set(updated);
        this.filterPosts();
        this.toastService.success('Post excluído com sucesso');
      },
      error: () => {
        this.toastService.error('Erro ao excluir post');
      }
    });
  }

  pinPost(postId: string): void {
    const pinType = this.selectedPinType();
    if (!pinType) {
      this.toastService.error('Selecione um tipo de fixação');
      return;
    }

    this.postService.pin(postId.toString(), pinType).subscribe({
      next: () => {
        const updated = this.posts().map(p => 
          p.id === postId ? { ...p, isPinned: true, pinType } : p
        );
        this.posts.set(updated);
        this.filterPosts();
        this.toastService.success(`Post fixado em ${pinType}`);
      },
      error: () => {
        this.toastService.error('Erro ao fixar post');
      }
    });
  }

  unpinPost(postId: string): void {
    this.postService.unpin(postId.toString()).subscribe({
      next: () => {
        const updated = this.posts().map(p => 
          p.id === postId ? { ...p, isPinned: false, pinType: null } : p
        );
        this.posts.set(updated);
        this.filterPosts();
        this.toastService.success('Post desfixado');
      },
      error: () => {
        this.toastService.error('Erro ao desfixar post');
      }
    });
  }

  getPinBadgeClass(pinType: string | null): string {
    if (!pinType) return '';
    const map: Record<string, string> = {
      'Geral': 'pin-geral',
      'PA': 'pin-pa',
      'PJ': 'pin-pj'
    };
    return map[pinType] || '';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
