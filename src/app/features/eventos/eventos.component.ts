import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventoService } from '../../core/services/evento.service';
import { Evento } from '../../core/models/evento.model';
import { EventoCardComponent } from './components/evento-card/evento-card.component';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule, RouterLink, EventoCardComponent],
  templateUrl: './eventos.component.html',
  styleUrl: './eventos.component.scss'
})
export class EventosComponent implements OnInit {
  private eventoService = inject(EventoService);

  eventos = signal<Evento[]>([]);
  proximosEventos = signal<Evento[]>([]);
  isLoading = signal(true);
  error = signal('');
  view = signal<'list' | 'calendar'>('list');

  ngOnInit(): void {
    this.loadEventos();
  }

  loadEventos(): void {
    this.isLoading.set(true);
    this.error.set('');

    this.eventoService.getUpcoming().subscribe({
      next: (eventos) => {
        this.proximosEventos.set(eventos);
      }
    });

    this.eventoService.getAll().subscribe({
      next: (eventos) => {
        this.eventos.set(eventos);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar eventos');
        this.isLoading.set(false);
      }
    });
  }

  toggleView(view: 'list' | 'calendar'): void {
    this.view.set(view);
  }

  onParticipacaoChanged(): void {
    this.loadEventos();
  }
}
