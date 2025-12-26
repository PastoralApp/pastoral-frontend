import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GrupoService } from '../../../core/services/grupo.service';
import { PastoralService } from '../../../core/services/pastoral.service';
import { UserService } from '../../../core/services/user.service';
import { IgrejaService } from '../../../core/services/igreja.service';
import { CreateGrupoDto, UpdateGrupoDto } from '../../../core/models/grupo.model';
import { Pastoral } from '../../../core/models/pastoral.model';
import { Igreja } from '../../../core/models/igreja.model';
import { User } from '../../../core/models/user.model';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-grupo-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './grupo-form.component.html',
  styleUrl: './grupo-form.component.scss'
})
export class GrupoFormComponent implements OnInit {
  private grupoService = inject(GrupoService);
  private pastoralService = inject(PastoralService);
  private userService = inject(UserService);
  private igrejaService = inject(IgrejaService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  pastorais = signal<Pastoral[]>([]);
  igrejas = signal<Igreja[]>([]);
  coordenadores = signal<User[]>([]);
  isEditing = signal(false);
  isLoading = signal(false);
  grupoId = signal<string | null>(null);

  name = signal('');
  description = signal('');
  pastoralId = signal<string | null>(null);
  igrejaId = signal<string | null>(null);
  coordenadorId = signal<string | null>(null);

  ngOnInit(): void {
    this.loadData();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing.set(true);
      this.grupoId.set(id);
      this.loadGrupo(id);
    }
  }

  loadData(): void {
    Promise.all([
      this.pastoralService.getAll().toPromise(),
      this.userService.getAll().toPromise(),
      this.igrejaService.getAll().toPromise()
    ]).then(([pastorais, usuarios, igrejas]) => {
      this.pastorais.set(pastorais || []);
      this.igrejas.set((igrejas || []).filter(i => i.isAtiva));
      const coords = (usuarios || []).filter(u => 
        u.roleName === 'Coordenador de Grupo' || 
        u.roleName === 'Coordenador Geral' ||
        u.roleName === 'Administrador'
      );
      this.coordenadores.set(coords);
    });
  }

  loadGrupo(id: string): void {
    this.grupoService.getById(id).subscribe({
      next: (grupo) => {
        this.name.set(grupo.name);
        this.description.set(grupo.description || '');
        this.pastoralId.set(grupo.pastoralId);
        this.igrejaId.set(grupo.igrejaId || null);
        this.coordenadorId.set(grupo.coordenadorId || null);
      },
      error: () => {
        this.toastService.error('Erro ao carregar grupo');
        this.voltar();
      }
    });
  }

  salvar(): void {
    if (!this.validarForm()) {
      return;
    }

    this.isLoading.set(true);

    if (this.isEditing()) {
      this.atualizarGrupo();
    } else {
      this.criarGrupo();
    }
  }

  validarForm(): boolean {
    if (!this.name().trim()) {
      this.toastService.error('O nome é obrigatório');
      return false;
    }

    if (!this.pastoralId()) {
      this.toastService.error('Selecione uma pastoral');
      return false;
    }

    return true;
  }

  criarGrupo(): void {
    const dto: CreateGrupoDto = {
      name: this.name(),
      description: this.description() || undefined,
      pastoralId: this.pastoralId()!.toString(),
      igrejaId: this.igrejaId() || undefined,
      coordenadorId: this.coordenadorId()?.toString() || undefined
    };

    this.grupoService.create(dto).subscribe({
      next: () => {
        this.toastService.success('Grupo criado com sucesso!');
        this.voltar();
      },
      error: () => {
        this.toastService.error('Erro ao criar grupo');
        this.isLoading.set(false);
      }
    });
  }

  atualizarGrupo(): void {
    const dto: UpdateGrupoDto = {
      name: this.name(),
      description: this.description() || undefined,
      pastoralId: this.pastoralId()!.toString(),
      igrejaId: this.igrejaId() || undefined,
      coordenadorId: this.coordenadorId()?.toString() || undefined
    };

    this.grupoService.update(this.grupoId()!, dto).subscribe({
      next: () => {
        this.toastService.success('Grupo atualizado com sucesso!');
        this.voltar();
      },
      error: () => {
        this.toastService.error('Erro ao atualizar grupo');
        this.isLoading.set(false);
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/coord-geral/grupos']);
  }
}
