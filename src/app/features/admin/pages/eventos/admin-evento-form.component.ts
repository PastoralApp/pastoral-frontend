import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventoService } from '../../../../core/services/evento.service';
import { CreateEventoDto, UpdateEventoDto, EventoType, EventoTypeLabels } from '../../../../core/models/evento.model';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-admin-evento-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-evento-form.component.html',
  styleUrl: './admin-evento-form.component.scss'
})
export class AdminEventoFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventoService = inject(EventoService);
  private toastService = inject(ToastService);

  isEditMode = signal(false);
  eventoId = signal<string | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);

  EventoType = EventoType;
  EventoTypeLabels = EventoTypeLabels;

  form = signal<CreateEventoDto>({
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
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.eventoId.set(id);
      this.loadEvento(id);
    }
  }

  loadEvento(id: string): void {
    this.isLoading.set(true);
    this.eventoService.getById(id).subscribe({
      next: (evento) => {
        this.form.set({
          title: evento.title,
          description: evento.description,
          eventDate: this.formatDateForInput(evento.eventDate),
          location: evento.location || '',
          imageUrl: evento.imageUrl || '',
          maxParticipants: evento.maxParticipants,
          requireInscription: evento.requireInscription,
          type: evento.type
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Erro ao carregar evento');
        this.isLoading.set(false);
      }
    });
  }

  formatDateForInput(date: string): string {
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  }

  updateField<K extends keyof CreateEventoDto>(field: K, value: CreateEventoDto[K]): void {
    this.form.update(f => ({ ...f, [field]: value }));
  }

  onSubmit(): void {
    if (this.isSaving()) return;

    const formData = this.form();
    if (!formData.title || !formData.description || !formData.eventDate) {
      this.toastService.warning('Preencha todos os campos obrigatórios');
      return;
    }

    this.isSaving.set(true);

    if (this.isEditMode() && this.eventoId()) {
      const updateData: UpdateEventoDto = {
        title: formData.title,
        description: formData.description,
        eventDate: new Date(formData.eventDate).toISOString(),
        location: formData.location || undefined,
        maxParticipants: formData.maxParticipants,
        requireInscription: formData.requireInscription,
        type: formData.type
      };

      this.eventoService.update(this.eventoId()!, updateData).subscribe({
        next: () => {
          this.toastService.success('Evento atualizado com sucesso!');
          this.router.navigate(['/admin/eventos']);
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Erro ao atualizar evento');
          this.isSaving.set(false);
        }
      });
    } else {
      const createData: CreateEventoDto = {
        title: formData.title,
        description: formData.description,
        eventDate: new Date(formData.eventDate).toISOString(),
        location: formData.location || undefined,
        imageUrl: formData.imageUrl || undefined,
        maxParticipants: formData.maxParticipants,
        requireInscription: formData.requireInscription,
        type: formData.type
      };

      this.eventoService.create(createData).subscribe({
        next: () => {
          this.toastService.success('Evento criado com sucesso!');
          this.router.navigate(['/admin/eventos']);
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Erro ao criar evento');
          this.isSaving.set(false);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/eventos']);
  }

  get pageTitle(): string {
    return this.isEditMode() ? 'Editar Evento' : 'Novo Evento';
  }

  get submitButtonText(): string {
    if (this.isSaving()) {
      return this.isEditMode() ? 'Salvando...' : 'Criando...';
    }
    return this.isEditMode() ? 'Salvar Alterações' : 'Criar Evento';
  }
}
