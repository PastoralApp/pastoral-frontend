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
  showPastEvents = false;
  canCreate = false;

  constructor(
    private eventoService: EventoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    this.canCreate = user?.role?.type! >= 1;
    this.loadEventos();
  }

  loadEventos(): void {
    this.loading = true;
    this.eventoService.getAll().subscribe({
      next: (eventos) => {
        this.eventos = eventos.sort((a, b) => 
          new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime()
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

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(e => 
        e.titulo.toLowerCase().includes(term) ||
        e.descricao.toLowerCase().includes(term) ||
        e.local.toLowerCase().includes(term)
      );
    }

    if (!this.showPastEvents) {
      const now = new Date();
      filtered = filtered.filter(e => new Date(e.dataInicio) >= now);
    }

    this.filteredEventos = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  togglePastEvents(): void {
    this.showPastEvents = !this.showPastEvents;
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
