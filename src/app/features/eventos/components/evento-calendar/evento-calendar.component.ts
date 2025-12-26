import { Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Evento } from '../../../../core/models/evento.model';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  eventos: Evento[];
}

@Component({
  selector: 'app-evento-calendar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './evento-calendar.component.html',
  styleUrl: './evento-calendar.component.scss'
})
export class EventoCalendarComponent {
  @Input() set eventos(value: Evento[]) {
    this._eventos.set(value);
  }
  @Output() eventoClick = new EventEmitter<Evento>();

  private _eventos = signal<Evento[]>([]);
  
  currentDate = signal(new Date());
  selectedDate = signal<Date | null>(null);

  weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  currentMonthName = computed(() => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[this.currentDate().getMonth()];
  });

  currentYear = computed(() => this.currentDate().getFullYear());

  calendarDays = computed(() => {
    const year = this.currentDate().getFullYear();
    const month = this.currentDate().getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: CalendarDay[] = [];

    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        dayNumber: date.getDate(),
        isCurrentMonth: false,
        isToday: false,
        eventos: this.getEventosForDate(date)
      });
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);
      
      days.push({
        date,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: dateOnly.getTime() === today.getTime(),
        eventos: this.getEventosForDate(date)
      });
    }

    const remainingDays = 42 - days.length; // 6 semanas * 7 dias
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: false,
        eventos: this.getEventosForDate(date)
      });
    }

    return days;
  });

  selectedDayEventos = computed(() => {
    const selected = this.selectedDate();
    if (!selected) return [];
    return this.getEventosForDate(selected);
  });

  private getEventosForDate(date: Date): Evento[] {
    return this._eventos().filter(evento => {
      const eventoDate = new Date(evento.eventDate);
      return (
        eventoDate.getDate() === date.getDate() &&
        eventoDate.getMonth() === date.getMonth() &&
        eventoDate.getFullYear() === date.getFullYear()
      );
    });
  }

  previousMonth(): void {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
    this.selectedDate.set(null);
  }

  nextMonth(): void {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
    this.selectedDate.set(null);
  }

  goToToday(): void {
    this.currentDate.set(new Date());
    this.selectedDate.set(new Date());
  }

  selectDay(day: CalendarDay): void {
    this.selectedDate.set(day.date);
  }

  isSelected(day: CalendarDay): boolean {
    const selected = this.selectedDate();
    if (!selected) return false;
    return (
      day.date.getDate() === selected.getDate() &&
      day.date.getMonth() === selected.getMonth() &&
      day.date.getFullYear() === selected.getFullYear()
    );
  }

  onEventoClick(evento: Evento): void {
    this.eventoClick.emit(evento);
  }

  formatEventTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  formatSelectedDate(): string {
    const selected = this.selectedDate();
    if (!selected) return '';
    return selected.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  }
}
