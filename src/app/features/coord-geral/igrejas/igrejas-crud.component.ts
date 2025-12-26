import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IgrejaService } from '../../../core/services/igreja.service';
import { Igreja, CreateIgrejaDto, UpdateIgrejaDto } from '../../../core/models/igreja.model';
import { ConfirmationService } from '../../../shared/components/confirmation-modal';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-igrejas-crud',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './igrejas-crud.component.html',
  styleUrl: './igrejas-crud.component.scss'
})
export class IgrejasCrudComponent implements OnInit {
  private igrejaService = inject(IgrejaService);
  private confirmationService = inject(ConfirmationService);
  private toastService = inject(ToastService);

  igrejas = signal<Igreja[]>([]);
  searchTerm = '';
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  isModalOpen = signal(false);
  isEditing = signal(false);
  selectedIgreja = signal<Igreja | null>(null);
  isSaving = signal(false);

  formData = {
    nome: '',
    endereco: '',
    telefone: '',
    imagemUrl: ''
  };

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

  openCreateModal(): void {
    this.isEditing.set(false);
    this.selectedIgreja.set(null);
    this.formData = {
      nome: '',
      endereco: '',
      telefone: '',
      imagemUrl: ''
    };
    this.isModalOpen.set(true);
  }

  openEditModal(igreja: Igreja): void {
    this.isEditing.set(true);
    this.selectedIgreja.set(igreja);
    this.formData = {
      nome: igreja.nome,
      endereco: igreja.endereco || '',
      telefone: igreja.telefone || '',
      imagemUrl: igreja.imagemUrl || ''
    };
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedIgreja.set(null);
  }

  async saveIgreja(): Promise<void> {
    if (!this.formData.nome.trim()) {
      this.toastService.warning('Nome da igreja é obrigatório');
      return;
    }

    this.isSaving.set(true);

    try {
      if (this.isEditing() && this.selectedIgreja()) {
        const updateDto: UpdateIgrejaDto = {
          nome: this.formData.nome.trim(),
          endereco: this.formData.endereco.trim() || undefined,
          telefone: this.formData.telefone.trim() || undefined,
          imagemUrl: this.formData.imagemUrl.trim() || undefined
        };

        await this.igrejaService.update(this.selectedIgreja()!.id, updateDto).toPromise();
        
        this.igrejas.update(list =>
          list.map(i => i.id === this.selectedIgreja()!.id 
            ? { ...i, ...updateDto } 
            : i
          )
        );
        this.toastService.success('Igreja atualizada com sucesso');
      } else {
        const createDto: CreateIgrejaDto = {
          nome: this.formData.nome.trim(),
          endereco: this.formData.endereco.trim() || undefined,
          telefone: this.formData.telefone.trim() || undefined,
          imagemUrl: this.formData.imagemUrl.trim() || undefined
        };

        const newIgreja = await this.igrejaService.create(createDto).toPromise();
        if (newIgreja) {
          this.igrejas.update(list => [...list, newIgreja]);
          this.toastService.success('Igreja criada com sucesso');
        }
      }

      this.closeModal();
    } catch (error) {
      console.error('Erro ao salvar igreja:', error);
      this.toastService.error('Erro ao salvar igreja');
    } finally {
      this.isSaving.set(false);
    }
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
