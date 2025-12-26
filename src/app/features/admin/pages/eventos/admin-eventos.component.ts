import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EventoService } from '../../../../core/services/evento.service';
import { Evento } from '../../../../core/models/evento.model';
import { ConfirmationService } from '../../../../shared/components/confirmation-modal';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-admin-eventos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-eventos.component.html',
  styleUrl: './admin-eventos.component.scss'
})
export class AdminEventosComponent implements OnInit {
  private eventoService = inject(EventoService);
  private confirmationService = inject(ConfirmationService);
  private toastService = inject(ToastService);

  eventos = signal<Evento[]>([]);
  isLoading = signal(true);
  searchTerm = signal('');
  filterStatus = signal<'all' | 'upcoming' | 'past'>('all');

  ngOnInit(): void {
    this.loadEventos();
  }

  async loadEventos(): Promise<void> {
    this.isLoading.set(true);
    try {
      const eventos = await this.eventoService.getAll().toPromise();
      this.eventos.set(eventos || []);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      this.toastService.error('Erro ao carregar eventos');
    } finally {
      this.isLoading.set(false);
    }
  }

  get filteredEventos(): Evento[] {
    let result = this.eventos();
    const now = new Date();
    
    const status = this.filterStatus();
    if (status === 'upcoming') {
      result = result.filter(e => new Date(e.eventDate) >= now);
    } else if (status === 'past') {
      result = result.filter(e => new Date(e.eventDate) < now);
    }
    
    const term = this.searchTerm().toLowerCase();
    if (term) {
      result = result.filter(e => 
        e.title.toLowerCase().includes(term) ||
        e.description?.toLowerCase().includes(term) ||
        e.location?.toLowerCase().includes(term)
      );
    }

    return result.sort((a, b) => 
      new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
    );
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isEventPast(dateString: string): boolean {
    return new Date(dateString) < new Date();
  }

  async deleteEvento(evento: Evento): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      title: 'Excluir Evento',
      message: `Tem certeza que deseja excluir o evento "${evento.title}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      await this.eventoService.delete(evento.id).toPromise();
      this.toastService.success('Evento excluído com sucesso');
      this.loadEventos();
    } catch (error) {
      this.toastService.error('Erro ao excluir evento');
    }
  }

  getParticipantsInfo(evento: Evento): string {
    if (evento.maxParticipants > 0) {
      return `0/${evento.maxParticipants}`;
    }
    return 'Sem limite';
  }
}
