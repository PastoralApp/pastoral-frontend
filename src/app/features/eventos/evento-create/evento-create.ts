import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { EventoService } from '../../../core/services/evento.service';

@Component({
  selector: 'app-evento-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './evento-create.html',
  styleUrl: './evento-create.scss',
})
export class EventoCreate implements OnInit {
  eventoForm!: FormGroup;
  loading = false;
  errorMessage = '';
  isEditMode = false;
  eventoId: string | null = null;
  minDate: string;

  constructor(
    private fb: FormBuilder,
    private eventoService: EventoService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const now = new Date();
    this.minDate = now.toISOString().slice(0, 16);
  }

  ngOnInit(): void {
    this.eventoId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.eventoId;

    this.eventoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      location: [''],
      eventDate: ['', Validators.required],
      maxParticipants: [0],
      requireInscription: [false]
    });

    if (this.isEditMode && this.eventoId) {
      this.loadEvento(this.eventoId);
    }
  }

  loadEvento(id: string): void {
    this.loading = true;
    this.eventoService.getById(id).subscribe({
      next: (evento) => {
        this.eventoForm.patchValue({
          title: evento.title,
          description: evento.description,
          location: evento.location,
          eventDate: new Date(evento.eventDate).toISOString().slice(0, 16),
          maxParticipants: evento.maxParticipants,
          requireInscription: evento.requireInscription
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar evento:', error);
        this.errorMessage = 'Erro ao carregar evento';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.eventoForm.invalid) {
      this.eventoForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const formData = {
      ...this.eventoForm.value,
      eventDate: new Date(this.eventoForm.value.eventDate).toISOString()
    };

    const request = this.isEditMode && this.eventoId
      ? this.eventoService.update(this.eventoId, formData)
      : this.eventoService.create(formData);

    request.subscribe({
      next: () => {
        this.router.navigate(['/eventos']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Erro ao salvar evento';
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/eventos']);
  }
}
