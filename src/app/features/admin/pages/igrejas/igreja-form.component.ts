import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IgrejaService } from '../../../../core/services/igreja.service';
import { Igreja, CreateIgrejaDto, UpdateIgrejaDto } from '../../../../core/models/igreja.model';

@Component({
  selector: 'app-igreja-form',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './igreja-form.component.html',
  styleUrl: './igreja-form.component.scss'
})
export class IgrejaFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private igrejaService = inject(IgrejaService);

  isEditMode = signal(false);
  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  
  igrejaId: string | null = null;
  
  igreja = {
    nome: '',
    endereco: '',
    telefone: '',
    imagemUrl: ''
  };

  ngOnInit(): void {
    this.igrejaId = this.route.snapshot.paramMap.get('id');
    if (this.igrejaId) {
      this.isEditMode.set(true);
      this.loadIgreja(this.igrejaId);
    }
  }

  loadIgreja(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    
    this.igrejaService.getById(id).subscribe({
      next: (igreja) => {
        this.igreja = {
          nome: igreja.nome,
          endereco: igreja.endereco || '',
          telefone: igreja.telefone || '',
          imagemUrl: igreja.imagemUrl || ''
        };
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar igreja:', error);
        this.errorMessage.set('Erro ao carregar dados da igreja. Tente novamente.');
        this.isLoading.set(false);
      }
    });
  }

  save(): void {
    if (!this.igreja.nome) {
      this.errorMessage.set('O nome da igreja é obrigatório');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    if (this.isEditMode() && this.igrejaId) {
      const updateDto: UpdateIgrejaDto = {
        nome: this.igreja.nome,
        endereco: this.igreja.endereco || undefined,
        telefone: this.igreja.telefone || undefined,
        imagemUrl: this.igreja.imagemUrl || undefined
      };

      this.igrejaService.update(this.igrejaId, updateDto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/admin/igrejas']);
        },
        error: (error) => {
          console.error('Erro ao atualizar igreja:', error);
          this.errorMessage.set('Erro ao atualizar igreja. Tente novamente.');
          this.isSaving.set(false);
        }
      });
    } else {
      const createDto: CreateIgrejaDto = {
        nome: this.igreja.nome,
        endereco: this.igreja.endereco || undefined,
        telefone: this.igreja.telefone || undefined,
        imagemUrl: this.igreja.imagemUrl || undefined
      };

      this.igrejaService.create(createDto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/admin/igrejas']);
        },
        error: (error) => {
          console.error('Erro ao criar igreja:', error);
          this.errorMessage.set('Erro ao cadastrar igreja. Tente novamente.');
          this.isSaving.set(false);
        }
      });
    }
  }
}
