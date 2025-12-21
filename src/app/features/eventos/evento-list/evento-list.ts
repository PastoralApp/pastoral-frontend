import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventoService } from '../../../core/services/evento.service';
import { Evento } from '../../../core/models/evento.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-evento-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './evento-list.html',
  styleUrl: './evento-list.scss',
})
export class EventoList implements OnInit {
  eventos: Evento[] = [];
  filteredEventos: Evento[] = [];
  loading = true;
  searchTerm = '';
  filterStatus = '';

  constructor(
    private eventoService: EventoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadEventos();
  }

  canCreate(): boolean {
    const user = this.authService.currentUserValue;
    return (user?.role?.type ?? 0) >= 1;
  }

  loadEventos(): void {
    this.loading = true;
    this.eventoService.getAll().subscribe({
      next: (eventos) => {
        this.eventos = eventos.sort((a, b) => 
          new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
        );
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar eventos:', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.eventos];
    const now = new Date();

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(term) ||
        e.description.toLowerCase().includes(term) ||
        (e.location?.toLowerCase().includes(term) ?? false)
      );
    }

    if (this.filterStatus === 'upcoming') {
      filtered = filtered.filter(e => new Date(e.eventDate) >= now);
    } else if (this.filterStatus === 'past') {
      filtered = filtered.filter(e => new Date(e.eventDate) < now);
    } else if (this.filterStatus === 'open') {
      filtered = filtered.filter(e => e.requireInscription && new Date(e.eventDate) >= now);
    }

    this.filteredEventos = filtered;
  }

  getStatusBadge(evento: Evento): { label: string; class: string } {
    const now = new Date();
    const eventDate = new Date(evento.eventDate);

    if (eventDate < now) {
      return { label: 'Encerrado', class: 'bg-secondary' };
    } else if (evento.requireInscription) {
      return { label: 'Inscrições Abertas', class: 'bg-success' };
    } else {
      return { label: 'Evento Aberto', class: 'bg-primary' };
    }
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  deleteEvento(id: string): void {
    if (confirm('Deseja realmente excluir este evento?')) {
      this.eventoService.delete(id).subscribe({
        next: () => {
          this.eventos = this.eventos.filter(e => e.id !== id);
          this.applyFilters();
        },
        error: (error) => console.error('Erro ao excluir evento:', error)
      });
    }
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isPastEvent(date: Date | string): boolean {
    return new Date(date) < new Date();
  }
}
