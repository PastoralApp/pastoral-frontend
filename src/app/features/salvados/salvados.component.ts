import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostService } from '../../core/services/post.service';
import { EventoService } from '../../core/services/evento.service';
import { Post } from '../../core/models/post.model';
import { Evento } from '../../core/models/evento.model';

@Component({
  selector: 'app-salvados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './salvados.component.html',
  styleUrls: ['./salvados.component.scss']
})
export class SalvadosComponent implements OnInit {
  activeTab: 'posts' | 'eventos' = 'posts';
  savedPosts: Post[] = [];
  savedEventos: Evento[] = [];
  loading = false;

  constructor(
    private postService: PostService,
    private eventoService: EventoService
  ) {}

  ngOnInit(): void {
    this.loadSavedPosts();
  }

  switchTab(tab: 'posts' | 'eventos'): void {
    this.activeTab = tab;
    if (tab === 'posts' && this.savedPosts.length === 0) {
      this.loadSavedPosts();
    } else if (tab === 'eventos' && this.savedEventos.length === 0) {
      this.loadSavedEventos();
    }
  }

  loadSavedPosts(): void {
    this.loading = true;
    this.postService.getSavedPosts().subscribe({
      next: (posts: Post[]) => {
        this.savedPosts = posts;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erro ao carregar posts salvos:', err);
        this.loading = false;
      }
    });
  }

  loadSavedEventos(): void {
    this.loading = true;
    this.eventoService.getSavedEventos().subscribe({
      next: (eventos: Evento[]) => {
        this.savedEventos = eventos;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erro ao carregar eventos salvos:', err);
        this.loading = false;
      }
    });
  }

  unsavePost(post: Post): void {
    this.postService.toggleSave(post.id).subscribe({
      next: () => {
        this.savedPosts = this.savedPosts.filter(p => p.id !== post.id);
      },
      error: (err: any) => console.error('Erro ao remover post salvo:', err)
    });
  }

  unsaveEvento(evento: Evento): void {
    this.eventoService.toggleSave(evento.id).subscribe({
      next: () => {
        this.savedEventos = this.savedEventos.filter(e => e.id !== evento.id);
      },
      error: (err: any) => console.error('Erro ao remover evento salvo:', err)
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getPostTypeLabel(type: string): string {
    const types: { [key: string]: string } = {
      'Comum': 'Comum',
      'Oficial': 'Oficial',
      'Fixada': 'Fixada',
      'Anuncio': 'Anúncio'
    };
    return types[type] || type;
  }
}
