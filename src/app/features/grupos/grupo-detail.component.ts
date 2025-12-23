import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GrupoService } from '../../core/services/grupo.service';
import { AuthService } from '../../core/services/auth.service';
import { Grupo } from '../../core/models/pastoral.model';
import { UserSimple } from '../../core/models/user.model';

@Component({
  selector: 'app-grupo-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './grupo-detail.component.html',
  styleUrl: './grupo-detail.component.scss'
})
export class GrupoDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private grupoService = inject(GrupoService);
  private authService = inject(AuthService);

  grupo = signal<Grupo | null>(null);
  membros = signal<UserSimple[]>([]);
  isLoading = signal(true);
  isLoadingMembros = signal(true);
  error = signal('');
  notificacoesAtivas = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadGrupo(id);
      this.loadMembros(id);
    } else {
      this.router.navigate(['/pastorais']);
    }
  }

  loadGrupo(id: string): void {
    this.isLoading.set(true);
    this.error.set('');

    this.grupoService.getById(id).subscribe({
      next: (grupo) => {
        this.grupo.set(grupo);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Grupo não encontrado');
        this.isLoading.set(false);
      }
    });
  }

  loadMembros(grupoId: string): void {
    this.isLoadingMembros.set(true);
    this.grupoService.getMembros(grupoId).subscribe({
      next: (membros) => {
        this.membros.set(membros);
        this.isLoadingMembros.set(false);
      },
      error: () => {
        this.isLoadingMembros.set(false);
      }
    });
  }

  canEdit(): boolean {
    const user = this.authService.currentUser();
    if (!user) return false;
    return user.role === 'Administrador' || user.role === 'Coordenador Geral' || user.role === 'Coordenador de Grupo';
  }

  toggleNotificacoes(): void {
    const grupo = this.grupo();
    if (!grupo) return;

    if (this.notificacoesAtivas()) {
      this.grupoService.silenciarNotificacoes(grupo.id).subscribe({
        next: () => this.notificacoesAtivas.set(false)
      });
    } else {
      this.grupoService.ativarNotificacoes(grupo.id).subscribe({
        next: () => this.notificacoesAtivas.set(true)
      });
    }
  }

  goBack(): void {
    const grupo = this.grupo();
    if (grupo?.pastoralId) {
      this.router.navigate(['/pastorais', grupo.pastoralId]);
    } else {
      this.router.navigate(['/pastorais']);
    }
  }

  getMemberInitial(name: string): string {
    return name?.charAt(0).toUpperCase() || '?';
  }
}
