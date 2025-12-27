import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GrupoService } from '../../core/services/grupo.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { Grupo } from '../../core/models/pastoral.model';
import { UserSimple, UserGrupoInfo } from '../../core/models/user.model';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmationService } from '../../shared/components/confirmation-modal';

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
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);

  grupo = signal<Grupo | null>(null);
  membros = signal<UserSimple[]>([]);
  meusGrupos = signal<UserGrupoInfo[]>([]);
  isLoading = signal(true);
  isLoadingMembros = signal(true);
  notificacoesAtivas = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadGrupo(id);
      this.loadMembros(id);
      this.loadMeusGrupos();
    } else {
      this.router.navigate(['/pastorais']);
    }
  }

  loadGrupo(id: string): void {
    this.isLoading.set(true);

    this.grupoService.getById(id).subscribe({
      next: (grupo) => {
        this.grupo.set(grupo);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Grupo não encontrado');
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
        this.toastService.error('Erro ao carregar membros do grupo');
        this.isLoadingMembros.set(false);
      }
    });
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

  canEdit(): boolean {
    const user = this.authService.currentUser();
    if (!user) return false;
    
    if (user.role === 'Administrador' || user.role === 'Coordenador Geral') {
      return true;
    }
    
    if (user.role === 'Coordenador de Grupo') {
      const grupo = this.grupo();
      if (!grupo) return false;
      return this.meusGrupos().some(g => g.grupoId === grupo.id);
    }
    
    return false;
  }

  async toggleNotificacoes(): Promise<void> {
    const grupo = this.grupo();
    if (!grupo) return;

    if (this.notificacoesAtivas()) {
      const confirmed = await this.confirmationService.confirm({
        title: 'Silenciar notificações',
        message: 'Você não receberá mais notificações deste grupo',
        confirmText: 'Sim, silenciar',
        cancelText: 'Cancelar',
        type: 'warning'
      });
      if (!confirmed) return;

      this.grupoService.silenciarNotificacoes(grupo.id).subscribe({
        next: () => {
          this.notificacoesAtivas.set(false);
          this.toastService.success('Notificações silenciadas');
        },
        error: () => {
          this.toastService.error('Erro ao silenciar notificações');
        }
      });
    } else {
      this.grupoService.ativarNotificacoes(grupo.id).subscribe({
        next: () => {
          this.notificacoesAtivas.set(true);
          this.toastService.success('Notificações ativadas');
        },
        error: () => {
          this.toastService.error('Erro ao ativar notificações');
        }
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
