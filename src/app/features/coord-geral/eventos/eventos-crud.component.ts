import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventoService } from '../../../core/services/evento.service';
import { Evento, CreateEventoDto, UpdateEventoDto, EventoType, EventoTypeLabels } from '../../../core/models/evento.model';
import { ConfirmationService } from '../../../shared/components/confirmation-modal';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-eventos-crud',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './eventos-crud.component.html',
  styleUrl: './eventos-crud.component.scss'
})
export class EventosCrudComponent implements OnInit {
  private eventoService = inject(EventoService);
  private confirmationService = inject(ConfirmationService);
  private toastService = inject(ToastService);

  eventos = signal<Evento[]>([]);
  isLoading = signal(true);
  searchTerm = signal('');
  filterStatus = signal<'all' | 'upcoming' | 'past'>('all');

  isModalOpen = signal(false);
  isEditing = signal(false);
  selectedEvento = signal<Evento | null>(null);
  isSaving = signal(false);

  EventoType = EventoType;
  EventoTypeLabels = EventoTypeLabels;
  eventoTypes: EventoType[] = [
    EventoType.Comum,
    EventoType.Encontro,
    EventoType.Retiro,
    EventoType.Acampamento,
    EventoType.FestaJunina,
    EventoType.Olimpiadas,
    EventoType.Guia
  ];

  formData = signal<CreateEventoDto>({
    title: '',
    description: '',
    eventDate: '',
    location: '',
    imageUrl: '',
    maxParticipants: 0,
    requireInscription: false,
    type: EventoType.Comum
  });

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

  formatDateForInput(date: string): string {
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  }

  isEventPast(dateString: string): boolean {
    return new Date(dateString) < new Date();
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.selectedEvento.set(null);
    this.formData.set({
      title: '',
      description: '',
      eventDate: '',
      location: '',
      imageUrl: '',
      maxParticipants: 0,
      requireInscription: false,
      type: EventoType.Comum
    });
    this.isModalOpen.set(true);
  }

  openEditModal(evento: Evento): void {
    this.isEditing.set(true);
    this.selectedEvento.set(evento);
    this.formData.set({
      title: evento.title,
      description: evento.description,
      eventDate: this.formatDateForInput(evento.eventDate),
      location: evento.location || '',
      imageUrl: evento.imageUrl || '',
      maxParticipants: evento.maxParticipants,
      requireInscription: evento.requireInscription,
      type: evento.type
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedEvento.set(null);
  }

  updateField<K extends keyof CreateEventoDto>(field: K, value: CreateEventoDto[K]): void {
    this.formData.update(f => ({ ...f, [field]: value }));
  }

  async saveEvento(): Promise<void> {
    const data = this.formData();
    
    if (!data.title || !data.description || !data.eventDate) {
      this.toastService.warning('Preencha todos os campos obrigatórios');
      return;
    }

    this.isSaving.set(true);

    try {
      if (this.isEditing() && this.selectedEvento()) {
        const updateData: UpdateEventoDto = {
          title: data.title,
          description: data.description,
          eventDate: new Date(data.eventDate).toISOString(),
          location: data.location || undefined,
          maxParticipants: data.maxParticipants,
          requireInscription: data.requireInscription,
          type: data.type
        };

        await this.eventoService.update(this.selectedEvento()!.id, updateData).toPromise();
        this.toastService.success('Evento atualizado com sucesso!');
        this.loadEventos();
      } else {
        const createData: CreateEventoDto = {
          title: data.title,
          description: data.description,
          eventDate: new Date(data.eventDate).toISOString(),
          location: data.location || undefined,
          imageUrl: data.imageUrl || undefined,
          maxParticipants: data.maxParticipants,
          requireInscription: data.requireInscription,
          type: data.type
        };

        await this.eventoService.create(createData).toPromise();
        this.toastService.success('Evento criado com sucesso!');
        this.loadEventos();
      }

      this.closeModal();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      this.toastService.error('Erro ao salvar evento');
    } finally {
      this.isSaving.set(false);
    }
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
