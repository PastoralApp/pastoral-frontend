import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventoService } from '../../../core/services/evento.service';
import { AuthService } from '../../../core/services/auth.service';
import { Evento } from '../../../core/models/evento.model';

@Component({
  selector: 'app-evento-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './evento-detail.component.html',
  styleUrl: './evento-detail.component.scss'
})
export class EventoDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventoService = inject(EventoService);
  private authService = inject(AuthService);

  evento = signal<Evento | null>(null);
  isLoading = signal(true);
  error = signal('');
  isSaved = signal(false);
  isSaving = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEvento(id);
    } else {
      this.router.navigate(['/eventos']);
    }
  }

  loadEvento(id: string): void {
    this.isLoading.set(true);
    this.error.set('');

    this.eventoService.getById(id).subscribe({
      next: (evento) => {
        this.evento.set(evento);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Evento não encontrado');
        this.isLoading.set(false);
      }
    });
  }

  toggleSave(): void {
    const evento = this.evento();
    if (!evento || this.isSaving()) return;

    this.isSaving.set(true);
    this.eventoService.save(evento.id).subscribe({
      next: (response) => {
        this.isSaved.set(response.saved);
        this.isSaving.set(false);
      },
      error: () => {
        this.isSaving.set(false);
      }
    });
  }

  canEdit(): boolean {
    const evento = this.evento();
    const user = this.authService.currentUser();
    if (!evento || !user) return false;
    return user.role === 'Administrador' || user.role === 'Coordenador Geral';
  }

  goBack(): void {
    this.router.navigate(['/eventos']);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  formatTime(date: string): string {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
