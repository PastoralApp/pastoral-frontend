import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IgrejaService } from '../../../core/services/igreja.service';
import { Igreja, HorarioMissa, DiaSemana } from '../../../core/models/igreja.model';

@Component({
  selector: 'app-igreja-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './igreja-detail.component.html',
  styleUrl: './igreja-detail.component.scss'
})
export class IgrejaDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private igrejaService = inject(IgrejaService);

  igreja = signal<Igreja | null>(null);
  isLoading = signal(true);
  error = signal('');

  dias = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' }
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadIgreja(id);
    } else {
      this.router.navigate(['/igrejas']);
    }
  }

  loadIgreja(id: string): void {
    this.isLoading.set(true);
    this.error.set('');

    this.igrejaService.getById(id).subscribe({
      next: (igreja) => {
        this.igreja.set(igreja);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Igreja não encontrada');
        this.isLoading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/igrejas']);
  }

  getHorariosByDia(): Map<number, HorarioMissa[]> {
    const map = new Map<number, HorarioMissa[]>();
    const horarios = this.igreja()?.horariosMissas || [];
    
    for (const h of horarios) {
      if (!h.isAtivo) continue;
      if (!map.has(h.diaSemana)) {
        map.set(h.diaSemana, []);
      }
      map.get(h.diaSemana)!.push(h);
    }
        map.forEach((horarios) => {
      horarios.sort((a, b) => a.horario.localeCompare(b.horario));
    });
    
    return map;
  }

  getDiaLabel(dia: number): string {
    return this.dias.find(d => d.value === dia)?.label || '';
  }

  isHoje(dia: number): boolean {
    return dia === new Date().getDay();
  }

  hasHorarios(): boolean {
    const horarios = this.igreja()?.horariosMissas || [];
    return horarios.some(h => h.isAtivo);
  }
}
