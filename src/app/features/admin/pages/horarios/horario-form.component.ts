import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HorarioMissaService } from '../../../../core/services/horario-missa.service';
import { IgrejaService } from '../../../../core/services/igreja.service';
import { Igreja, CreateHorarioMissaDto, UpdateHorarioMissaDto } from '../../../../core/models/igreja.model';

@Component({
  selector: 'app-horario-form',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './horario-form.component.html',
  styleUrl: './horario-form.component.scss'
})
export class HorarioFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private horarioService = inject(HorarioMissaService);
  private igrejaService = inject(IgrejaService);

  isEditMode = signal(false);
  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  
  horarioId: string | null = null;
  igrejas = signal<Igreja[]>([]);
  
  horario = {
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

  ngOnInit(): void {
    this.loadIgrejas();
    
    this.horarioId = this.route.snapshot.paramMap.get('id');
    if (this.horarioId) {
      this.isEditMode.set(true);
      this.loadHorario(this.horarioId);
    }
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

  loadHorario(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    
    this.horarioService.getAll(true).subscribe({
      next: (horarios) => {
        const horario = horarios.find(h => h.id === id);
        if (horario) {
          this.horario = {
            igrejaId: horario.igrejaId,
            diaSemana: horario.diaSemana.toString(),
            horario: horario.horario,
            celebrante: horario.celebrante || '',
            observacao: horario.observacao || ''
          };
        } else {
          this.errorMessage.set('Horário não encontrado.');
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar horário:', error);
        this.errorMessage.set('Erro ao carregar dados do horário. Tente novamente.');
        this.isLoading.set(false);
      }
    });
  }

  save(): void {
    if (!this.horario.igrejaId || this.horario.diaSemana === '' || !this.horario.horario) {
      this.errorMessage.set('Preencha todos os campos obrigatórios');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    if (this.isEditMode() && this.horarioId) {
      const updateDto: UpdateHorarioMissaDto = {
        igrejaId: this.horario.igrejaId,
        diaSemana: parseInt(this.horario.diaSemana),
        horario: this.horario.horario,
        celebrante: this.horario.celebrante || undefined,
        observacao: this.horario.observacao || undefined
      };

      this.horarioService.update(this.horarioId, updateDto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/admin/horarios']);
        },
        error: (error) => {
          console.error('Erro ao atualizar horário:', error);
          this.errorMessage.set('Erro ao atualizar horário. Tente novamente.');
          this.isSaving.set(false);
        }
      });
    } else {
      const createDto: CreateHorarioMissaDto = {
        igrejaId: this.horario.igrejaId,
        diaSemana: parseInt(this.horario.diaSemana),
        horario: this.horario.horario,
        celebrante: this.horario.celebrante || undefined,
        observacao: this.horario.observacao || undefined
      };

      this.horarioService.create(createDto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/admin/horarios']);
        },
        error: (error) => {
          console.error('Erro ao criar horário:', error);
          this.errorMessage.set('Erro ao cadastrar horário. Tente novamente.');
          this.isSaving.set(false);
        }
      });
    }
  }
}
