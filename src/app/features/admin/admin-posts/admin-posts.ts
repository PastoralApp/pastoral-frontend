import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-posts',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-posts.html',
  styleUrl: './admin-posts.scss'
})
export class AdminPosts implements OnInit {
  posts: any[] = [];
  filteredPosts: any[] = [];
  searchTerm = '';
  selectedTipo = '';
  loading = false;

  tipos = [
    { value: 'Comum', label: 'Comum' },
    { value: 'Oficial', label: 'Oficial' },
    { value: 'Fixada', label: 'Fixada' },
    { value: 'Anuncio', label: 'Anúncio' }
  ];

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    setTimeout(() => {
      this.posts = [
        { id: 1, content: 'Grande evento da juventude...', type: 'Oficial', createdAt: new Date(), authorName: 'Admin' },
        { id: 2, content: 'Informamos a todos...', type: 'Anuncio', createdAt: new Date(), authorName: 'João Silva' },
        { id: 3, content: 'Hoje refletimos sobre...', type: 'Comum', createdAt: new Date(), authorName: 'Maria Santos' },
        { id: 4, content: 'A coordenação informa...', type: 'Comum', createdAt: new Date(), authorName: 'Pedro Costa' }
      ];
      this.filteredPosts = [...this.posts];
      this.loading = false;
    }, 500);
  }

  applyFilters(): void {
    this.filteredPosts = this.posts.filter(post => {
      const matchesSearch = !this.searchTerm || 
        post.content.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesTipo = !this.selectedTipo || 
        post.type === this.selectedTipo;

      return matchesSearch && matchesTipo;
    });
  }

  getTipoBadgeClass(type: string): string {
    switch (type) {
      case 'Comum': return 'bg-info';
      case 'Oficial': return 'bg-success';
      case 'Fixada': return 'bg-warning text-dark';
      case 'Anuncio': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  }

  getTipoLabel(type: string): string {
    const found = this.tipos.find((t: { value: string; label: string }) => t.value === type);
    return found ? found.label : type;
  }

  deletePost(post: any): void {
    if (confirm(`Deseja realmente excluir este post?`)) {
      this.posts = this.posts.filter(p => p.id !== post.id);
      this.applyFilters();
    }
  }
}
