import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PastoralService } from '../../../../core/services/pastoral.service';
import { Pastoral } from '../../../../core/models/pastoral.model';
import { ConfirmationService } from '../../../../shared/components/confirmation-modal';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-pastorais-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './pastorais-list.component.html',
  styleUrl: './pastorais-list.component.scss'
})
export class PastoraisListComponent implements OnInit {
  private pastoralService = inject(PastoralService);
  private confirmationService = inject(ConfirmationService);
  private toastService = inject(ToastService);

  pastorais = signal<Pastoral[]>([]);
  filteredPastorais = signal<Pastoral[]>([]);
  isLoading = signal(true);
  searchTerm = '';

  ngOnInit(): void {
    this.loadPastorais();
  }

  loadPastorais(): void {
    this.isLoading.set(true);
    this.pastoralService.getAll(true).subscribe({
      next: (pastorais) => {
        this.pastorais.set(pastorais);
        this.filteredPastorais.set(pastorais);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Erro ao carregar pastorais');
        this.isLoading.set(false);
      }
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    const lower = term.toLowerCase();
    if (!lower) {
      this.filteredPastorais.set(this.pastorais());
      return;
    }
    this.filteredPastorais.set(
      this.pastorais().filter(p => p.name.toLowerCase().includes(lower))
    );
  }

  async toggleStatus(pastoral: Pastoral): Promise<void> {
    if (pastoral.isActive) {
      const confirmed = await this.confirmationService.confirm({
        title: 'Desativar Pastoral',
        message: `Deseja desativar "${pastoral.name}"?`,
        confirmText: 'Sim, desativar',
        cancelText: 'Cancelar',
        type: 'warning'
      });
      if (!confirmed) return;

      this.pastoralService.desativar(pastoral.id).subscribe({
        next: () => {
          this.toastService.success('Pastoral desativada');
          this.loadPastorais();
        },
        error: () => {
          this.toastService.error('Erro ao desativar pastoral');
        }
      });
    } else {
      this.pastoralService.ativar(pastoral.id).subscribe({
        next: () => {
          this.toastService.success('Pastoral ativada');
          this.loadPastorais();
        },
        error: () => {
          this.toastService.error('Erro ao ativar pastoral');
        }
      });
    }
  }

  async delete(pastoral: Pastoral): Promise<void> {
    const confirmed = await this.confirmationService.confirmDelete(`a pastoral "${pastoral.name}"`);
    if (!confirmed) return;

    this.pastoralService.delete(pastoral.id).subscribe({
      next: () => {
        this.toastService.success('Pastoral excluída com sucesso');
        this.loadPastorais();
      },
      error: () => {
        this.toastService.error('Erro ao excluir pastoral');
      }
    });
  }
}
