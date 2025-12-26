import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventoService } from '../../core/services/evento.service';
import { Evento } from '../../core/models/evento.model';
import { EventoCardComponent } from './components/evento-card/evento-card.component';
import { EventoCalendarComponent } from './components/evento-calendar/evento-calendar.component';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule, EventoCardComponent, EventoCalendarComponent],
  templateUrl: './eventos.component.html',
  styleUrl: './eventos.component.scss'
})
export class EventosComponent implements OnInit {
  private eventoService = inject(EventoService);
  private toastService = inject(ToastService);

  eventos = signal<Evento[]>([]);
  proximosEventos = signal<Evento[]>([]);
  isLoading = signal(true);
  view = signal<'list' | 'calendar'>('list');

  ngOnInit(): void {
    this.loadEventos();
  }

  loadEventos(): void {
    this.isLoading.set(true);

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
        this.toastService.error('Erro ao carregar eventos');
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
