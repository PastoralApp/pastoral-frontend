import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventoService } from '../../../core/services/evento.service';
import { CreateEventoDto, UpdateEventoDto, Evento } from '../../../core/models/evento.model';

@Component({
  selector: 'app-evento-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evento-form.component.html',
  styleUrl: './evento-form.component.scss'
})
export class EventoFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventoService = inject(EventoService);

  isEditMode = signal(false);
  eventoId = signal<string | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  error = signal('');

  form = signal<CreateEventoDto>({
    title: '',
    description: '',
    eventDate: '',
    location: '',
    imageUrl: '',
    maxParticipants: undefined,
    requireInscription: false
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
          requireInscription: evento.requireInscription
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Erro ao carregar evento');
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
      this.error.set('Preencha todos os campos obrigatórios');
      return;
    }

    this.isSaving.set(true);
    this.error.set('');

    if (this.isEditMode() && this.eventoId()) {
      const updateData: UpdateEventoDto = {
        title: formData.title,
        description: formData.description,
        eventDate: new Date(formData.eventDate).toISOString(),
        location: formData.location || undefined,
        imageUrl: formData.imageUrl || undefined,
        maxParticipants: formData.maxParticipants,
        requireInscription: formData.requireInscription
      };

      this.eventoService.update(this.eventoId()!, updateData).subscribe({
        next: () => {
          this.router.navigate(['/eventos', this.eventoId()]);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Erro ao atualizar evento');
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
        requireInscription: formData.requireInscription
      };

      this.eventoService.create(createData).subscribe({
        next: (evento) => {
          this.router.navigate(['/eventos', evento.id]);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Erro ao criar evento');
          this.isSaving.set(false);
        }
      });
    }
  }

  goBack(): void {
    if (this.isEditMode() && this.eventoId()) {
      this.router.navigate(['/eventos', this.eventoId()]);
    } else {
      this.router.navigate(['/eventos']);
    }
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
