import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GrupoService } from '../../core/services/grupo.service';
import { AuthService } from '../../core/services/auth.service';
import { Grupo, CreateGrupoDto } from '../../core/models/pastoral.model';

@Component({
  selector: 'app-coordenacao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './coordenacao.component.html',
  styleUrl: './coordenacao.component.scss'
})
export class CoordenacaoComponent implements OnInit {
  private grupoService = inject(GrupoService);
  private authService = inject(AuthService);

  grupos = signal<Grupo[]>([]);
  isLoading = signal(true);
  showCreateModal = signal(false);
  isCreating = signal(false);

  newGrupo: CreateGrupoDto = {
    name: '',
    sigla: '',
    description: '',
    pastoralId: '',
    primaryColor: '#6366f1',
    secondaryColor: '#818cf8'
  };

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
        this.isLoading.set(false);
      }
    });
  }

  openCreateModal(): void {
    this.showCreateModal.set(true);
    this.newGrupo = {
      name: '',
      sigla: '',
      description: '',
      pastoralId: '',
      primaryColor: '#6366f1',
      secondaryColor: '#818cf8'
    };
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  createGrupo(): void {
    if (!this.newGrupo.name || this.isCreating()) return;

    this.isCreating.set(true);

    this.grupoService.create(this.newGrupo).subscribe({
      next: (grupo) => {
        this.grupos.update(list => [...list, grupo]);
        this.closeCreateModal();
        this.isCreating.set(false);
      },
      error: () => {
        this.isCreating.set(false);
      }
    });
  }

  toggleGrupoStatus(grupo: Grupo): void {
    if (grupo.isActive) {
      this.grupoService.desativar(grupo.id).subscribe({
        next: () => {
          this.grupos.update(list =>
            list.map(g => g.id === grupo.id ? { ...g, isActive: false } : g)
          );
        }
      });
    } else {
      this.grupoService.ativar(grupo.id).subscribe({
        next: () => {
          this.grupos.update(list =>
            list.map(g => g.id === grupo.id ? { ...g, isActive: true } : g)
          );
        }
      });
    }
  }
}
