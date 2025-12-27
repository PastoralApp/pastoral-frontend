import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GrupoService } from '../../core/services/grupo.service';
import { UserService } from '../../core/services/user.service';
import { Grupo } from '../../core/models/pastoral.model';
import { UserGrupoInfo } from '../../core/models/user.model';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmationService } from '../../shared/components/confirmation-modal';

@Component({
  selector: 'app-grupos-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './grupos-list.component.html',
  styleUrl: './grupos-list.component.scss'
})
export class GruposListComponent implements OnInit {
  private grupoService = inject(GrupoService);
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);

  grupos = signal<Grupo[]>([]);
  meusGrupos = signal<UserGrupoInfo[]>([]);
  isLoading = signal(true);
  isLoadingAction = signal<string | null>(null);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);

    Promise.all([
      new Promise<Grupo[]>((resolve, reject) => {
        this.grupoService.getAll().subscribe({
          next: (grupos) => resolve(grupos),
          error: (err) => reject(err)
        });
      }),
      new Promise<UserGrupoInfo[]>((resolve, reject) => {
        this.userService.getMe().subscribe({
          next: (user) => resolve(user.grupos || []),
          error: (err) => reject(err)
        });
      })
    ]).then(([grupos, meusGrupos]) => {
      this.grupos.set(grupos.filter(g => g.isActive));
      this.meusGrupos.set(meusGrupos);
      this.isLoading.set(false);
    }).catch(() => {
      this.toastService.error('Erro ao carregar grupos');
      this.isLoading.set(false);
    });
  }

  isUserInGroup(grupoId: string): boolean {
    return this.meusGrupos().some(g => g.grupoId === grupoId);
  }

  canJoinMoreGroups(): boolean {
    return this.meusGrupos().length < 4;
  }

  entrarNoGrupo(grupoId: string): void {
    if (this.isLoadingAction()) return;
    
    this.isLoadingAction.set(grupoId);

    this.grupoService.entrarNoGrupo(grupoId).subscribe({
      next: (response) => {
        this.toastService.success(response.message || 'Você entrou no grupo!');
        this.loadData();
        this.isLoadingAction.set(null);
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Erro ao entrar no grupo');
        this.isLoadingAction.set(null);
      }
    });
  }

  async sairDoGrupo(grupoId: string): Promise<void> {
    if (this.isLoadingAction()) return;

    const confirmed = await this.confirmationService.confirm({
      title: 'Sair do grupo',
      message: 'Tem certeza que deseja sair deste grupo?',
      confirmText: 'Sim, sair',
      cancelText: 'Cancelar',
      type: 'warning'
    });
    if (!confirmed) return;

    this.isLoadingAction.set(grupoId);

    this.grupoService.sairDoGrupo(grupoId).subscribe({
      next: (response) => {
        this.toastService.success(response.message || 'Você saiu do grupo');
        this.loadData();
        this.isLoadingAction.set(null);
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Erro ao sair do grupo');
        this.isLoadingAction.set(null);
      }
    });
  }

  getGrupoInitial(grupo: Grupo): string {
    return grupo.sigla?.charAt(0).toUpperCase() || grupo.name?.charAt(0).toUpperCase() || 'G';
  }
}
