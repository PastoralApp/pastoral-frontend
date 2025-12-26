import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HorarioMissaService } from '../../../../core/services/horario-missa.service';
import { IgrejaService } from '../../../../core/services/igreja.service';
import { HorarioMissa, Igreja } from '../../../../core/models/igreja.model';

@Component({
  selector: 'app-horarios-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './horarios-list.component.html',
  styleUrl: './horarios-list.component.scss'
})
export class HorariosListComponent implements OnInit {
  private horarioService = inject(HorarioMissaService);
  private igrejaService = inject(IgrejaService);

  horarios = signal<HorarioMissa[]>([]);
  igrejas = signal<Igreja[]>([]);
  searchTerm = '';
  filterIgreja = '';
  filterDia = '';
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

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

  applyFilters(): void {
  }

  getDiaSemanaLabel(dia: number): string {
    return this.diasSemana.find(d => d.value === dia)?.label || '';
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
      },
      error: (error) => {
        console.error('Erro ao alterar status do horário:', error);
        this.errorMessage.set('Erro ao alterar status do horário. Tente novamente.');
      }
    });
  }

  delete(horario: HorarioMissa): void {
    if (confirm(`Deseja realmente excluir este horário?`)) {
      this.horarioService.delete(horario.id).subscribe({
        next: () => {
          this.horarios.update(list => list.filter(h => h.id !== horario.id));
        },
        error: (error) => {
          console.error('Erro ao excluir horário:', error);
          this.errorMessage.set('Erro ao excluir horário. Tente novamente.');
        }
      });
    }
  }
}
