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
  selectedType: PostType | null = null;
  postTypes = PostType;
  canCreate = false;

  constructor(
    private postService: PostService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    this.canCreate = user?.role?.type! >= 1; // CoordenadorGrupo ou superior
    this.loadPosts();
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
        post.titulo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        post.conteudo.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesType = this.selectedType === null || post.tipo === this.selectedType;
      
      return matchesSearch && matchesType;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onTypeFilterChange(type: PostType | null): void {
    this.selectedType = type;
    this.applyFilters();
  }

  getPostTypeLabel(type: PostType): string {
    const labels: { [key in PostType]: string } = {
      [PostType.Aviso]: 'Aviso',
      [PostType.Evento]: 'Evento',
      [PostType.Reflexao]: 'Reflexão',
      [PostType.Comunicado]: 'Comunicado'
    };
    return labels[type];
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
