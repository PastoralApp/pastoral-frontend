import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../../../core/services/role.service';
import { CreateRoleDto, RoleType, ROLE_IDS } from '../../../../core/models/role.model';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './role-form.component.html',
  styleUrl: './role-form.component.scss'
})
export class RoleFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private roleService = inject(RoleService);

  isEditMode = signal(false);
  isLoading = signal(false);
  isSaving = signal(false);
  isSystemRole = signal(false);
  errorMessage = signal<string | null>(null);
  
  roleId: string | null = null;
  
  role = {
    name: '',
    type: '',
    description: ''
  };

  tipos = [
    { value: RoleType.Usuario, label: 'Usuário' },
    { value: RoleType.CoordenadorGrupo, label: 'Coordenador de Grupo' },
    { value: RoleType.CoordenadorGeral, label: 'Coordenador Geral' },
    { value: RoleType.Administrador, label: 'Administrador' },
  ];

  ngOnInit(): void {
    this.roleId = this.route.snapshot.paramMap.get('id');
    if (this.roleId) {
      this.isEditMode.set(true);
      this.checkSystemRole(this.roleId);
      this.loadRole(this.roleId);
    }
  }

  checkSystemRole(id: string): void {
    const systemRoles = Object.values(ROLE_IDS);
    this.isSystemRole.set(systemRoles.includes(id as any));
  }

  loadRole(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    
    this.roleService.getById(id).subscribe({
      next: (role) => {
        this.role = {
          name: role.name,
          type: role.type.toString(),
          description: role.description || ''
        };
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar cargo:', error);
        this.errorMessage.set('Erro ao carregar dados do cargo. Tente novamente.');
        this.isLoading.set(false);
      }
    });
  }

  save(): void {
    if (!this.role.name || !this.role.type) {
      this.errorMessage.set('Preencha todos os campos obrigatórios');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const dto: CreateRoleDto = {
      name: this.role.name,
      type: parseInt(this.role.type),
      description: this.role.description
    };

    if (this.isEditMode() && this.roleId) {
      this.roleService.update(this.roleId, dto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/admin/roles']);
        },
        error: (error) => {
          console.error('Erro ao atualizar cargo:', error);
          this.errorMessage.set('Erro ao atualizar cargo. Tente novamente.');
          this.isSaving.set(false);
        }
      });
    } else {
      this.roleService.create(dto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/admin/roles']);
        },
        error: (error) => {
          console.error('Erro ao criar cargo:', error);
          this.errorMessage.set('Erro ao cadastrar cargo. Tente novamente.');
          this.isSaving.set(false);
        }
      });
    }
  }
}
