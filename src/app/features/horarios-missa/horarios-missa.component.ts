import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HorarioMissaService } from '../../core/services/horario-missa.service';
import { HorarioMissa, DiaSemana } from '../../core/models/igreja.model';

@Component({
  selector: 'app-horarios-missa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './horarios-missa.component.html',
  styleUrl: './horarios-missa.component.scss'
})
export class HorariosMissaComponent implements OnInit {
  private horarioMissaService = inject(HorarioMissaService);

  horarios = signal<HorarioMissa[]>([]);
  isLoading = signal(true);
  error = signal('');
  diaAtual = signal(this.getHoje());

  dias = [
    { value: 0, label: 'Domingo', short: 'Dom' },
    { value: 1, label: 'Segunda', short: 'Seg' },
    { value: 2, label: 'Terça', short: 'Ter' },
    { value: 3, label: 'Quarta', short: 'Qua' },
    { value: 4, label: 'Quinta', short: 'Qui' },
    { value: 5, label: 'Sexta', short: 'Sex' },
    { value: 6, label: 'Sábado', short: 'Sab' }
  ];

  ngOnInit(): void {
    this.loadHorarios(this.diaAtual());
  }

  getHoje(): number {
    return new Date().getDay();
  }

  loadHorarios(dia: number): void {
    this.isLoading.set(true);
    this.error.set('');
    this.diaAtual.set(dia);

    this.horarioMissaService.getByDia(dia).subscribe({
      next: (horarios) => {
        this.horarios.set(horarios);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Erro ao carregar horários');
        this.isLoading.set(false);
      }
    });
  }

  selectDia(dia: number): void {
    if (dia !== this.diaAtual()) {
      this.loadHorarios(dia);
    }
  }

  getDiaLabel(dia: number): string {
    return this.dias.find(d => d.value === dia)?.label || '';
  }

  isHoje(dia: number): boolean {
    return dia === this.getHoje();
  }

  getHorariosByIgreja(): Map<string, HorarioMissa[]> {
    const map = new Map<string, HorarioMissa[]>();
    for (const h of this.horarios()) {
      const igreja = h.igrejaNome || 'Igreja não especificada';
      if (!map.has(igreja)) {
        map.set(igreja, []);
      }
      map.get(igreja)!.push(h);
    }
    // Sort by time within each church
    map.forEach((horarios, igreja) => {
      horarios.sort((a, b) => a.horario.localeCompare(b.horario));
    });
    return map;
  }
}
