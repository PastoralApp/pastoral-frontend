import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HorarioMissaService } from '../../../core/services/horario-missa.service';
import { IgrejaService } from '../../../core/services/igreja.service';
import { HorarioMissa, Igreja, CreateHorarioMissaDto, UpdateHorarioMissaDto } from '../../../core/models/igreja.model';
import { ConfirmationService } from '../../../shared/components/confirmation-modal';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-missas-crud',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './missas-crud.component.html',
  styleUrl: './missas-crud.component.scss'
})
export class MissasCrudComponent implements OnInit {
  private horarioService = inject(HorarioMissaService);
  private igrejaService = inject(IgrejaService);
  private confirmationService = inject(ConfirmationService);
  private toastService = inject(ToastService);

  horarios = signal<HorarioMissa[]>([]);
  igrejas = signal<Igreja[]>([]);
  searchTerm = '';
  filterIgreja = '';
  filterDia = '';
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  isModalOpen = signal(false);
  isEditing = signal(false);
  selectedHorario = signal<HorarioMissa | null>(null);
  isSaving = signal(false);

  formData = {
    igrejaId: '',
    diaSemana: '',
    horario: '',
    celebrante: '',
    observacao: ''
  };

  diasSemana = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' },
  ];

  filteredHorarios = computed(() => {
    let result = this.horarios();
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(h => 
        h.igrejaNome?.toLowerCase().includes(term) ||
        h.celebrante?.toLowerCase().includes(term)
      );
    }
    
    if (this.filterIgreja) {
      result = result.filter(h => h.igrejaId === this.filterIgreja);
    }
    
    if (this.filterDia !== '') {
      result = result.filter(h => h.diaSemana === +this.filterDia);
    }
    
    return result;
  });

  ngOnInit(): void {
    this.loadIgrejas();
    this.loadHorarios();
  }

  loadIgrejas(): void {
    this.igrejaService.getAll(false).subscribe({
      next: (data) => {
        this.igrejas.set(data);
      },
      error: (error) => {
        console.error('Erro ao carregar igrejas:', error);
      }
    });
  }

  loadHorarios(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.horarioService.getAll(true).subscribe({
      next: (data) => {
        this.horarios.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar horários:', error);
        this.errorMessage.set('Erro ao carregar horários. Tente novamente.');
        this.isLoading.set(false);
      }
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
  }

  getDiaSemanaLabel(dia: number): string {
    return this.diasSemana.find(d => d.value === dia)?.label || '';
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.selectedHorario.set(null);
    this.formData = {
      igrejaId: '',
      diaSemana: '',
      horario: '',
      celebrante: '',
      observacao: ''
    };
    this.isModalOpen.set(true);
  }

  openEditModal(horario: HorarioMissa): void {
    this.isEditing.set(true);
    this.selectedHorario.set(horario);
    this.formData = {
      igrejaId: horario.igrejaId,
      diaSemana: horario.diaSemana.toString(),
      horario: horario.horario,
      celebrante: horario.celebrante || '',
      observacao: horario.observacao || ''
    };
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedHorario.set(null);
  }

  async saveHorario(): Promise<void> {
    if (!this.formData.igrejaId || this.formData.diaSemana === '' || !this.formData.horario) {
      this.toastService.warning('Preencha todos os campos obrigatórios');
      return;
    }

    this.isSaving.set(true);

    try {
      if (this.isEditing() && this.selectedHorario()) {
        const updateDto: UpdateHorarioMissaDto = {
          igrejaId: this.formData.igrejaId,
          diaSemana: parseInt(this.formData.diaSemana),
          horario: this.formData.horario,
          celebrante: this.formData.celebrante || undefined,
          observacao: this.formData.observacao || undefined
        };

        await this.horarioService.update(this.selectedHorario()!.id, updateDto).toPromise();
        this.toastService.success('Horário atualizado com sucesso');
        this.loadHorarios();
      } else {
        const createDto: CreateHorarioMissaDto = {
          igrejaId: this.formData.igrejaId,
          diaSemana: parseInt(this.formData.diaSemana),
          horario: this.formData.horario,
          celebrante: this.formData.celebrante || undefined,
          observacao: this.formData.observacao || undefined
        };

        await this.horarioService.create(createDto).toPromise();
        this.toastService.success('Horário criado com sucesso');
        this.loadHorarios();
      }

      this.closeModal();
    } catch (error) {
      console.error('Erro ao salvar horário:', error);
      this.toastService.error('Erro ao salvar horário');
    } finally {
      this.isSaving.set(false);
    }
  }

  toggleStatus(horario: HorarioMissa): void {
    const action = horario.isAtivo 
      ? this.horarioService.desativar(horario.id)
      : this.horarioService.ativar(horario.id);

    action.subscribe({
      next: () => {
        this.horarios.update(list => 
          list.map(h => h.id === horario.id ? { ...h, isAtivo: !h.isAtivo } : h)
        );
        this.toastService.success(horario.isAtivo ? 'Horário desativado' : 'Horário ativado');
      },
      error: (error) => {
        console.error('Erro ao alterar status do horário:', error);
        this.toastService.error('Erro ao alterar status do horário');
      }
    });
  }

  async delete(horario: HorarioMissa): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      title: 'Excluir Horário',
      message: `Deseja realmente excluir este horário de missa?`,
      confirmText: 'Sim, excluir',
      cancelText: 'Cancelar',
      type: 'danger'
    });

    if (!confirmed) return;

    this.horarioService.delete(horario.id).subscribe({
      next: () => {
        this.horarios.update(list => list.filter(h => h.id !== horario.id));
        this.toastService.success('Horário excluído com sucesso');
      },
      error: (error) => {
        console.error('Erro ao excluir horário:', error);
        this.toastService.error('Erro ao excluir horário');
      }
    });
  }
}
