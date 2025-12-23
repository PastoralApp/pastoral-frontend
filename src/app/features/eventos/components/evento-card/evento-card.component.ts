import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Evento } from '../../../../core/models/evento.model';

@Component({
  selector: 'app-evento-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './evento-card.component.html',
  styleUrl: './evento-card.component.scss'
})
export class EventoCardComponent {
  @Input({ required: true }) evento!: Evento;

  formatDate(date: string): string {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  }

  formatTime(date: string): string {
    const d = new Date(date);
    return d.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get isUpcoming(): boolean {
    return new Date(this.evento.eventDate) > new Date();
  }

  get dayNumber(): string {
    return new Date(this.evento.eventDate).getDate().toString().padStart(2, '0');
  }

  get monthShort(): string {
    return new Date(this.evento.eventDate).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
  }
}
