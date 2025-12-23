import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IgrejaService } from '../../core/services/igreja.service';
import { Igreja } from '../../core/models/igreja.model';

@Component({
  selector: 'app-igrejas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './igrejas.component.html',
  styleUrl: './igrejas.component.scss'
})
export class IgrejasComponent implements OnInit {
  private igrejaService = inject(IgrejaService);

  igrejas = signal<Igreja[]>([]);
  isLoading = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.loadIgrejas();
  }

  loadIgrejas(): void {
    this.isLoading.set(true);
    this.error.set('');

    this.igrejaService.getAll().subscribe({
      next: (igrejas) => {
        this.igrejas.set(igrejas);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar igrejas');
        this.isLoading.set(false);
      }
    });
  }

  formatEndereco(igreja: Igreja): string {
    return igreja.endereco || '';
  }
}
