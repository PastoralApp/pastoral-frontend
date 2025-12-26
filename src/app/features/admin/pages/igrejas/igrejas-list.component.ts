import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IgrejaService } from '../../../../core/services/igreja.service';
import { Igreja } from '../../../../core/models/igreja.model';
import { ConfirmationService } from '../../../../shared/components/confirmation-modal';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-igrejas-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './igrejas-list.component.html',
  styleUrl: './igrejas-list.component.scss'
})
export class IgrejasListComponent implements OnInit {
  private igrejaService = inject(IgrejaService);
  private confirmationService = inject(ConfirmationService);
  private toastService = inject(ToastService);

  igrejas = signal<Igreja[]>([]);
  searchTerm = '';
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  filteredIgrejas = computed(() => {
    const term = this.searchTerm.toLowerCase();
    if (!term) return this.igrejas();
    return this.igrejas().filter(i =>
      i.nome.toLowerCase().includes(term) ||
      (i.endereco?.toLowerCase().includes(term) ?? false)
    );
  });

  ngOnInit(): void {
    this.loadIgrejas();
  }

  loadIgrejas(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.igrejaService.getAll(true).subscribe({
      next: (igrejas) => {
        this.igrejas.set(igrejas);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar igrejas:', error);
        this.errorMessage.set('Erro ao carregar igrejas. Tente novamente.');
        this.isLoading.set(false);
      }
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
  }

  toggleStatus(igreja: Igreja): void {
    const action = igreja.isAtiva
      ? this.igrejaService.desativar(igreja.id)
      : this.igrejaService.ativar(igreja.id);

    action.subscribe({
      next: () => {
        this.igrejas.update(list =>
          list.map(i => i.id === igreja.id ? { ...i, isAtiva: !i.isAtiva } : i)
        );
        this.toastService.success(igreja.isAtiva ? 'Igreja desativada' : 'Igreja ativada');
      },
      error: (error) => {
        console.error('Erro ao alterar status:', error);
        this.toastService.error('Erro ao alterar status da igreja');
      }
    });
  }

  async delete(igreja: Igreja): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      title: 'Excluir Igreja',
      message: `Deseja realmente excluir a igreja "${igreja.nome}"?`,
      confirmText: 'Sim, excluir',
      cancelText: 'Cancelar',
      type: 'danger'
    });

    if (!confirmed) return;

    this.igrejaService.delete(igreja.id).subscribe({
      next: () => {
        this.igrejas.update(list => list.filter(i => i.id !== igreja.id));
        this.toastService.success('Igreja excluída com sucesso');
      },
      error: (error) => {
        console.error('Erro ao excluir igreja:', error);
        this.toastService.error('Erro ao excluir igreja');
      }
    });
  }
}
