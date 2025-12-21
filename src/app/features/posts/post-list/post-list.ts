import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../../core/services/post.service';
import { Post, PostType } from '../../../core/models/post.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './post-list.html',
  styleUrl: './post-list.scss',
})
export class PostList implements OnInit {
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  loading = true;
  searchTerm = '';
  selectedType = '';

  typeOptions = [
    { value: 'Comum', label: 'Comum' },
    { value: 'Oficial', label: 'Oficial' },
    { value: 'Fixada', label: 'Fixada' },
    { value: 'Anuncio', label: 'Anúncio' }
  ];

  constructor(
    private postService: PostService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  canCreate(): boolean {
    const user = this.authService.currentUserValue;
    return (user?.role?.type ?? 0) >= 1;
  }

  loadPosts(): void {
    this.loading = true;
    this.postService.getAll().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar posts:', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredPosts = this.posts.filter(post => {
      const matchesSearch = !this.searchTerm || 
        post.content.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesType = !this.selectedType || post.type === this.selectedType;

      return matchesSearch && matchesType;
    });
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
    const found = this.typeOptions.find((t: { value: string; label: string }) => t.value === type);
    return found ? found.label : type;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onTypeFilterChange(type: string | null): void {
    this.applyFilters();
  }

  getPostTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'Comum': 'Comum',
      'Oficial': 'Oficial',
      'Fixada': 'Fixada',
      'Anuncio': 'Anúncio'
    };
    return labels[type] || type;
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  deletePost(id: string): void {
    if (confirm('Tem certeza que deseja excluir este post?')) {
      this.postService.delete(id).subscribe({
        next: () => {
          this.posts = this.posts.filter(p => p.id !== id);
          this.applyFilters();
        },
        error: (error) => console.error('Erro ao excluir post:', error)
      });
    }
  }
}
