import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GrupoService } from '../../core/services/grupo.service';
import { PastoralService } from '../../core/services/pastoral.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { Grupo, CreateGrupoDto, Pastoral } from '../../core/models/pastoral.model';
import { UserGrupoInfo } from '../../core/models/user.model';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmationService } from '../../shared/components/confirmation-modal';

@Component({
  selector: 'app-coordenacao',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './coordenacao.component.html',
  styleUrl: './coordenacao.component.scss'
})
export class CoordenacaoComponent implements OnInit {
  private grupoService = inject(GrupoService);
  private pastoralService = inject(PastoralService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);

  allGrupos = signal<Grupo[]>([]);
  meusGrupos = signal<UserGrupoInfo[]>([]);
  pastorais = signal<Pastoral[]>([]);
  isLoading = signal(true);
  showCreateModal = signal(false);
  isCreating = signal(false);

  grupos = computed(() => {
    const user = this.authService.currentUser();
    if (user?.role === 'Administrador' || user?.role === 'Coordenador Geral') {
      return this.allGrupos();
    }
    const meusGrupoIds = this.meusGrupos().map(g => g.grupoId);
    return this.allGrupos().filter(g => meusGrupoIds.includes(g.id));
  });

  canCreateGrupo = computed(() => {
    const user = this.authService.currentUser();
    return user?.role === 'Administrador' || user?.role === 'Coordenador Geral';
  });

  newGrupo: CreateGrupoDto = {
    name: '',
    sigla: '',
    description: '',
    pastoralId: '',
    primaryColor: '#6366f1',
    secondaryColor: '#818cf8'
  };

  ngOnInit(): void {
    console.log('🔍 CoordenacaoComponent - Iniciando componente');
    console.log('User:', this.authService.currentUser());
    this.loadGrupos();
    this.loadPastorais();
    this.loadMeusGrupos();
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

  loadGrupos(): void {
    this.isLoading.set(true);

    this.grupoService.getAll().subscribe({
      next: (grupos) => {
        this.allGrupos.set(grupos);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Erro ao carregar grupos');
        this.isLoading.set(false);
      }
    });
  }

  loadPastorais(): void {
    this.pastoralService.getAll().subscribe({
      next: (pastorais) => {
        this.pastorais.set(pastorais);
      },
      error: () => {
        this.toastService.error('Erro ao carregar pastorais');
      }
    });
  }

  openCreateModal(): void {
    this.showCreateModal.set(true);
    this.newGrupo = {
      name: '',
      sigla: '',
      description: '',
      pastoralId: this.pastorais().length > 0 ? this.pastorais()[0].id : '',
      primaryColor: '#6366f1',
      secondaryColor: '#818cf8'
    };
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  createGrupo(): void {
    if (!this.newGrupo.name || !this.newGrupo.pastoralId || this.isCreating()) return;

    this.isCreating.set(true);

    this.grupoService.create(this.newGrupo).subscribe({
      next: (grupo) => {
        this.allGrupos.update(list => [...list, grupo]);
        this.closeCreateModal();
        this.isCreating.set(false);
        this.toastService.success('Grupo criado com sucesso!');
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Erro ao criar grupo');
        this.isCreating.set(false);
      }
    });
  }

  async toggleGrupoStatus(grupo: Grupo): Promise<void> {
    if (grupo.isActive) {
      const confirmed = await this.confirmationService.confirm({
        title: 'Desativar Grupo',
        message: `Deseja desativar o grupo "${grupo.name}"?`,
        confirmText: 'Sim, desativar',
        cancelText: 'Cancelar',
        type: 'warning'
      });
      if (!confirmed) return;

      this.grupoService.desativar(grupo.id).subscribe({
        next: () => {
          this.allGrupos.update(list =>
            list.map(g => g.id === grupo.id ? { ...g, isActive: false } : g)
          );
          this.toastService.success('Grupo desativado');
        },
        error: () => {
          this.toastService.error('Erro ao desativar grupo');
        }
      });
    } else {
      this.grupoService.ativar(grupo.id).subscribe({
        next: () => {
          this.allGrupos.update(list =>
            list.map(g => g.id === grupo.id ? { ...g, isActive: true } : g)
          );
          this.toastService.success('Grupo ativado');
        },
        error: () => {
          this.toastService.error('Erro ao ativar grupo');
        }
      });
    }
  }
}
