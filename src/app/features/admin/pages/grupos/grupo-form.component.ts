import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GrupoService } from '../../../../core/services/grupo.service';
import { PastoralService } from '../../../../core/services/pastoral.service';
import { Grupo, CreateGrupoDto, UpdateGrupoDto, Pastoral } from '../../../../core/models/pastoral.model';

@Component({
  selector: 'app-grupo-form',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './grupo-form.component.html',
  styleUrl: './grupo-form.component.scss'
})
export class GrupoFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private grupoService = inject(GrupoService);
  private pastoralService = inject(PastoralService);

  isEditMode = signal(false);
  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  
  grupoId: string | null = null;
  pastorais = signal<Pastoral[]>([]);
  
  grupo = {
    name: '',
    sigla: '',
    pastoralId: '',
    description: '',
    primaryColor: '#4CAF50',
    secondaryColor: '#81C784',
    logoUrl: '',
    icon: ''
  };

  ngOnInit(): void {
    this.loadPastorais();
    
    this.grupoId = this.route.snapshot.paramMap.get('id');
    if (this.grupoId) {
      this.isEditMode.set(true);
      this.loadGrupo(this.grupoId);
    }
  }

  loadPastorais(): void {
    this.pastoralService.getAll(false).subscribe({
      next: (data) => {
        this.pastorais.set(data);
      },
      error: (error) => {
        console.error('Erro ao carregar pastorais:', error);
      }
    });
  }

  loadGrupo(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    
    this.grupoService.getById(id).subscribe({
      next: (grupo) => {
        this.grupo = {
          name: grupo.name,
          sigla: grupo.sigla,
          pastoralId: grupo.pastoralId,
          description: grupo.description,
          primaryColor: grupo.primaryColor,
          secondaryColor: grupo.secondaryColor,
          logoUrl: grupo.logoUrl || '',
          icon: grupo.icon || ''
        };
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar grupo:', error);
        this.errorMessage.set('Erro ao carregar dados do grupo. Tente novamente.');
        this.isLoading.set(false);
      }
    });
  }

  save(): void {
    if (!this.grupo.name || !this.grupo.pastoralId) {
      this.errorMessage.set('Preencha todos os campos obrigatórios');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    if (this.isEditMode() && this.grupoId) {
      const updateDto: UpdateGrupoDto = {
        name: this.grupo.name,
        sigla: this.grupo.sigla,
        description: this.grupo.description,
        pastoralId: this.grupo.pastoralId,
        primaryColor: this.grupo.primaryColor,
        secondaryColor: this.grupo.secondaryColor,
        logoUrl: this.grupo.logoUrl || undefined,
        icon: this.grupo.icon || undefined
      };

      this.grupoService.update(this.grupoId, updateDto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/admin/grupos']);
        },
        error: (error) => {
          console.error('Erro ao atualizar grupo:', error);
          this.errorMessage.set('Erro ao atualizar grupo. Tente novamente.');
          this.isSaving.set(false);
        }
      });
    } else {
      const createDto: CreateGrupoDto = {
        name: this.grupo.name,
        sigla: this.grupo.sigla,
        description: this.grupo.description,
        pastoralId: this.grupo.pastoralId,
        primaryColor: this.grupo.primaryColor,
        secondaryColor: this.grupo.secondaryColor,
        logoUrl: this.grupo.logoUrl || undefined,
        icon: this.grupo.icon || undefined
      };

      this.grupoService.create(createDto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/admin/grupos']);
        },
        error: (error) => {
          console.error('Erro ao criar grupo:', error);
          this.errorMessage.set('Erro ao cadastrar grupo. Tente novamente.');
          this.isSaving.set(false);
        }
      });
    }
  }
}
