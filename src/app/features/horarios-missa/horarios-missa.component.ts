import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HorarioMissaService } from '../../core/services/horario-missa.service';
import { HorarioMissa, DiaSemana } from '../../core/models/igreja.model';
import { IgrejaService } from '../../core/services/igreja.service';
import { Igreja } from '../../core/models/igreja.model';

@Component({
  selector: 'app-horarios-missa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './horarios-missa.component.html',
  styleUrl: './horarios-missa.component.scss'
})
export class HorariosMissaComponent implements OnInit {
  private horarioMissaService = inject(HorarioMissaService);
  private igrejaService = inject(IgrejaService);

  horarios = signal<HorarioMissa[]>([]);
  igrejas = signal<Igreja[]>([]);
  isLoading = signal(true);
  error = signal('');
  diaAtual = signal(this.getHoje());
  showCalendar = signal(false);
  selectedDate = signal(new Date());
  currentMonth = signal(new Date());
  showIgrejaInfo = signal<Map<string, boolean>>(new Map());

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
    this.loadIgrejas();
  }

  loadIgrejas(): void {
    this.igrejaService.getAll().subscribe({
      next: (igrejas) => {
        this.igrejas.set(igrejas.filter(i => i.isAtiva));
      },
      error: () => {
        console.error('Erro ao carregar igrejas');
      }
    });
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
    map.forEach((horarios, igreja) => {
      horarios.sort((a, b) => a.horario.localeCompare(b.horario));
    });
    return map;
  }

  getIgrejaDetails(igrejaNome: string): Igreja | undefined {
    return this.igrejas().find(i => i.nome === igrejaNome);
  }

  toggleIgrejaInfo(igrejaNome: string): void {
    const map = new Map(this.showIgrejaInfo());
    map.set(igrejaNome, !map.get(igrejaNome));
    this.showIgrejaInfo.set(map);
  }

  isIgrejaInfoVisible(igrejaNome: string): boolean {
    return this.showIgrejaInfo().get(igrejaNome) || false;
  }

  openCalendar(): void {
    this.showCalendar.set(true);
  }

  closeCalendar(): void {
    this.showCalendar.set(false);
  }

  getCalendarDays(): Date[] {
    const year = this.currentMonth().getFullYear();
    const month = this.currentMonth().getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push(date);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    const remainingDays = 42 - days.length; 
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  }

  selectDateFromCalendar(date: Date): void {
    this.selectedDate.set(date);
    const dia = date.getDay();
    this.loadHorarios(dia);
    this.closeCalendar();
  }

  isSelectedDate(date: Date): boolean {
    const selected = this.selectedDate();
    return date.getDate() === selected.getDate() &&
           date.getMonth() === selected.getMonth() &&
           date.getFullYear() === selected.getFullYear();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentMonth().getMonth();
  }

  previousMonth(): void {
    const current = this.currentMonth();
    this.currentMonth.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const current = this.currentMonth();
    this.currentMonth.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  getMonthYearText(): string {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const date = this.currentMonth();
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  getFormattedSelectedDate(): string {
    const date = this.selectedDate();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
