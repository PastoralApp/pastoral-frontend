import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { GrupoService } from '../../../core/services/grupo.service';
import { Grupo } from '../../../core/models/grupo.model';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-grupos-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './grupos-list.component.html',
  styleUrl: './grupos-list.component.scss'
})
export class GruposListComponent implements OnInit {
  private grupoService = inject(GrupoService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  grupos = signal<Grupo[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadGrupos();
  }

  loadGrupos(): void {
    this.isLoading.set(true);
    this.grupoService.getAll().subscribe({
      next: (grupos) => {
        this.grupos.set(grupos);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Erro ao carregar grupos');
        this.isLoading.set(false);
      }
    });
  }

  novoGrupo(): void {
    this.router.navigate(['/coord-geral/grupos/novo']);
  }

  editarGrupo(id: string | number): void {
    this.router.navigate([`/coord-geral/grupos/${id}/editar`]);
  }

  excluirGrupo(id: string | number, nome: string): void {
    if (!confirm(`Tem certeza que deseja excluir o grupo "${nome}"?`)) {
      return;
    }

    this.grupoService.delete(id.toString()).subscribe({
      next: () => {
        const updated = this.grupos().filter(g => g.id !== id);
        this.grupos.set(updated);
        this.toastService.success('Grupo excluído com sucesso');
      },
      error: () => {
        this.toastService.error('Erro ao excluir grupo');
      }
    });
  }
}
