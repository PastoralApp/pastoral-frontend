import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EventoService } from '../../../core/services/evento.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { Evento } from '../../../core/models/evento.model';
import { UserGrupoInfo } from '../../../core/models/user.model';
import { ConfirmationService } from '../../../shared/components/confirmation-modal';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-coordenacao-eventos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './coordenacao-eventos.component.html',
  styleUrl: './coordenacao-eventos.component.scss'
})
export class CoordenacaoEventosComponent implements OnInit {
  private eventoService = inject(EventoService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private confirmationService = inject(ConfirmationService);
  private toastService = inject(ToastService);

  allEventos = signal<Evento[]>([]);
  meusGrupos = signal<UserGrupoInfo[]>([]);
  selectedGrupoId = signal<string>('all');
  isLoading = signal(true);
  searchTerm = signal('');
  filterStatus = signal<'all' | 'upcoming' | 'past'>('all');

  isFullAccess = computed(() => {
    const user = this.authService.currentUser();
    return user?.role === 'Administrador' || user?.role === 'Coordenador Geral';
  });

  eventos = computed(() => {
    if (this.isFullAccess()) {
      return this.allEventos();
    }
    const meusGrupoIds = this.meusGrupos().map(g => g.grupoId);
    const userId = this.authService.currentUser()?.id;
    return this.allEventos().filter(e => e.createdByUserId === userId);
  });

  ngOnInit(): void {
    this.loadMeusGrupos();
    this.loadEventos();
  }

  loadMeusGrupos(): void {
    this.userService.getMe().subscribe({
      next: (user) => {
        this.meusGrupos.set(user.grupos || []);
      },
      error: () => {
        this.meusGrupos.set([]);
      }
    });
  }

  async loadEventos(): Promise<void> {
    this.isLoading.set(true);
    try {
      const eventos = await this.eventoService.getAll().toPromise();
      this.allEventos.set(eventos || []);
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
    
    // Filter by status
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
