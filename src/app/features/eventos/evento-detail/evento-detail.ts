import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EventoService } from '../../../core/services/evento.service';
import { AuthService } from '../../../core/services/auth.service';
import { Evento } from '../../../core/models/evento.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-evento-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evento-detail.html',
  styleUrl: './evento-detail.scss',
})
export class EventoDetail implements OnInit {
  evento: Evento | null = null;
  loading = true;
  currentUser: User | null = null;
  canEdit = false;
  canDelete = false;
  isRegistered = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventoService: EventoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEvento(id);
    }
  }

  loadEvento(id: string): void {
    this.loading = true;
    this.eventoService.getById(id).subscribe({
      next: (evento) => {
        this.evento = evento;
        this.checkPermissions();
        this.checkRegistration();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar evento:', error);
        this.loading = false;
        this.router.navigate(['/eventos']);
      }
    });
  }

  checkPermissions(): void {
    if (!this.evento || !this.currentUser) return;

    const isOrganizer = this.evento.organizadorId === this.currentUser.id;
    const isAdmin = this.currentUser.role?.type! >= 2;

    this.canEdit = isOrganizer || isAdmin;
    this.canDelete = isOrganizer || isAdmin;
  }

  checkRegistration(): void {
    if (!this.evento || !this.currentUser) return;
    // TODO: Implement inscriptions feature
    this.isRegistered = false;
  }

  registerForEvent(): void {
    if (!this.evento || !this.currentUser) return;

    // Implementar lógica de inscrição
    console.log('Inscrição no evento:', this.evento.id);
    this.isRegistered = true;
  }

  unregisterFromEvent(): void {
    if (!this.evento || !this.currentUser) return;

    if (confirm('Deseja realmente cancelar sua inscrição?')) {
      // Implementar lógica de cancelamento
      console.log('Cancelar inscrição:', this.evento.id);
      this.isRegistered = false;
    }
  }

  deleteEvento(): void {
    if (!this.evento) return;

    if (confirm('Deseja realmente excluir este evento?')) {
      this.eventoService.delete(this.evento.id!).subscribe({
        next: () => {
          this.router.navigate(['/eventos']);
        },
        error: (error) => {
          console.error('Erro ao excluir evento:', error);
          alert('Erro ao excluir evento');
        }
      });
    }
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isPastEvent(): boolean {
    if (!this.evento) return false;
    return new Date(this.evento.dataFim) < new Date();
  }

  canRegister(): boolean {
    return !!this.evento?.inscricoesAbertas && !this.isPastEvent() && !this.isRegistered;
  }

  goBack(): void {
    this.router.navigate(['/eventos']);
  }
}
