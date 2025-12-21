import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PastoralService } from '../../core/services/pastoral.service';
import { GrupoService } from '../../core/services/grupo.service';
import { Pastoral } from '../../core/models/pastoral.model';

@Component({
  selector: 'app-pastorais-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pastorais-gallery.component.html',
  styleUrls: ['./pastorais-gallery.component.scss']
})
export class PastoraisGalleryComponent implements OnInit {
  pastorais: Pastoral[] = [];
  loading = true;
  expandedPastoralId: string | null = null;

  constructor(
    private pastoralService: PastoralService,
    private grupoService: GrupoService
  ) {}

  ngOnInit(): void {
    this.loadPastorais();
  }

  loadPastorais(): void {
    this.loading = true;
    this.pastoralService.getAll().subscribe({
      next: (data) => {
        this.pastorais = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar pastorais:', error);
        this.loading = false;
      }
    });
  }

  togglePastoral(pastoralId: string): void {
    this.expandedPastoralId = this.expandedPastoralId === pastoralId ? null : pastoralId;
  }

  isExpanded(pastoralId: string): boolean {
    return this.expandedPastoralId === pastoralId;
  }

  silenciarGrupo(grupoId: string, event: Event): void {
    event.stopPropagation();
    this.grupoService.silenciarNotificacoes(grupoId).subscribe({
      next: () => console.log('Notificações silenciadas'),
      error: (error) => console.error('Erro ao silenciar:', error)
    });
  }

  ativarNotificacoesGrupo(grupoId: string, event: Event): void {
    event.stopPropagation();
    this.grupoService.ativarNotificacoes(grupoId).subscribe({
      next: () => console.log('Notificações ativadas'),
      error: (error) => console.error('Erro ao ativar:', error)
    });
  }
}
