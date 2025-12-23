import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PastoralService } from '../../core/services/pastoral.service';
import { Pastoral, TipoPastoral } from '../../core/models/pastoral.model';

@Component({
  selector: 'app-pastorais',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pastorais.component.html',
  styleUrl: './pastorais.component.scss'
})
export class PastoraisComponent implements OnInit {
  private pastoralService = inject(PastoralService);

  pastorais = signal<Pastoral[]>([]);
  isLoading = signal(true);
  error = signal('');
  selectedType = signal<TipoPastoral | null>(null);

  TipoPastoral = TipoPastoral;

  ngOnInit(): void {
    this.loadPastorais();
  }

  loadPastorais(): void {
    this.isLoading.set(true);
    this.error.set('');

    this.pastoralService.getAll().subscribe({
      next: (pastorais) => {
        this.pastorais.set(pastorais);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar pastorais');
        this.isLoading.set(false);
      }
    });
  }

  filterByType(type: TipoPastoral | null): void {
    this.selectedType.set(type);
  }

  get filteredPastorais(): Pastoral[] {
    const type = this.selectedType();
    if (type === null) {
      return this.pastorais();
    }
    return this.pastorais().filter(p => p.tipoPastoral === type);
  }

  getTypeLabel(type: TipoPastoral): string {
    const labels: Record<TipoPastoral, string> = {
      [TipoPastoral.PA]: 'Pastoral de Adultos',
      [TipoPastoral.PJ]: 'Pastoral da Juventude',
      [TipoPastoral.Geral]: 'Geral'
    };
    return labels[type];
  }
}
