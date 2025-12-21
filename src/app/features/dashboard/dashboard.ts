import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostService } from '../../core/services/post.service';
import { EventoService } from '../../core/services/evento.service';
import { AuthService } from '../../core/services/auth.service';
import { Post } from '../../core/models/post.model';
import { Evento } from '../../core/models/evento.model';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  canManageUsers(): boolean {
    return false;
  }
  currentUser: User | null = null;
  recentPosts: Post[] = [];
  upcomingEvents: Evento[] = [];
  loading = true;
  stats = {
    totalPosts: 0,
    totalEvents: 0,
    activeGroups: 0
  };

  constructor(
    private postService: PostService,
    private eventoService: EventoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    // Carregar posts recentes
    this.postService.getAll().subscribe({
      next: (posts) => {
        this.recentPosts = posts.slice(0, 5);
        this.stats.totalPosts = posts.length;
      },
      error: (error) => console.error('Erro ao carregar posts:', error)
    });

    // Carregar próximos eventos
    this.eventoService.getAll().subscribe({
      next: (eventos) => {
        const now = new Date();
        this.upcomingEvents = eventos
          .filter(e => new Date(e.dataInicio) > now)
          .sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime())
          .slice(0, 5);
        this.stats.totalEvents = eventos.length;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar eventos:', error);
        this.loading = false;
      }
    });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getPostTypeLabel(type: number): string {
    const types = ['Aviso', 'Evento', 'Reflexão', 'Comunicado'];
    return types[type] || 'Post';
  }
}
