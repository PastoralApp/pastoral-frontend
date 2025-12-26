import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GrupoService } from '../../../../core/services/grupo.service';
import { Grupo } from '../../../../core/models/pastoral.model';
import { ConfirmationService } from '../../../../shared/components/confirmation-modal';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-grupos-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './grupos-list.component.html',
  styleUrl: './grupos-list.component.scss'
})
export class GruposListComponent implements OnInit {
  private grupoService = inject(GrupoService);
  private confirmationService = inject(ConfirmationService);
  private toastService = inject(ToastService);

  grupos = signal<Grupo[]>([]);
  searchTerm = '';
  isLoading = signal(true);

  filteredGrupos = computed(() => {
    const term = this.searchTerm.toLowerCase();
    if (!term) return this.grupos();
    return this.grupos().filter(g => 
      g.name.toLowerCase().includes(term) ||
      g.sigla.toLowerCase().includes(term) ||
      (g.pastoralName?.toLowerCase().includes(term) ?? false)
    );
  });

  ngOnInit(): void {
    this.loadGrupos();
  }

  loadGrupos(): void {
    this.isLoading.set(true);
    
    this.grupoService.getAll(true).subscribe({
      next: (data) => {
        this.grupos.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar grupos:', error);
        this.toastService.error('Erro ao carregar grupos. Tente novamente.');
        this.isLoading.set(false);
      }
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
  }

  async toggleStatus(grupo: Grupo): Promise<void> {
    if (grupo.isActive) {
      const confirmed = await this.confirmationService.confirm({
        title: 'Desativar Grupo',
        message: `Deseja desativar o grupo "${grupo.name}"?`,
        confirmText: 'Sim, desativar',
        cancelText: 'Cancelar',
        type: 'warning'
      });
      if (!confirmed) return;
    }

    const action = grupo.isActive 
      ? this.grupoService.desativar(grupo.id)
      : this.grupoService.ativar(grupo.id);

    action.subscribe({
      next: () => {
        this.grupos.update(list => 
          list.map(g => g.id === grupo.id ? { ...g, isActive: !g.isActive } : g)
        );
        this.toastService.success(grupo.isActive ? 'Grupo desativado' : 'Grupo ativado');
      },
      error: (error) => {
        console.error('Erro ao alterar status do grupo:', error);
        this.toastService.error('Erro ao alterar status do grupo. Tente novamente.');
      }
    });
  }

  async delete(grupo: Grupo): Promise<void> {
    const confirmed = await this.confirmationService.confirmDelete(`o grupo "${grupo.name}"`);
    if (!confirmed) return;

    this.grupoService.delete(grupo.id).subscribe({
      next: () => {
        this.grupos.update(list => list.filter(g => g.id !== grupo.id));
        this.toastService.success('Grupo excluído com sucesso');
      },
      error: (error) => {
        console.error('Erro ao excluir grupo:', error);
        this.toastService.error('Erro ao excluir grupo. Tente novamente.');
      }
    });
  }
}
