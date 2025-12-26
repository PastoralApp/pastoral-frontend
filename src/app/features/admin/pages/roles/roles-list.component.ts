import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../../../core/services/role.service';
import { Role, RoleType, ROLE_IDS } from '../../../../core/models/role.model';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './roles-list.component.html',
  styleUrl: './roles-list.component.scss'
})
export class RolesListComponent implements OnInit {
  private roleService = inject(RoleService);

  roles = signal<Role[]>([]);
  searchTerm = '';
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  filteredRoles = computed(() => {
    const term = this.searchTerm.toLowerCase();
    if (!term) return this.roles();
    return this.roles().filter(r => 
      r.name.toLowerCase().includes(term) ||
      r.description?.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    
    this.roleService.getAll().subscribe({
      next: (data) => {
        this.roles.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar cargos:', error);
        this.errorMessage.set('Erro ao carregar cargos. Tente novamente.');
        this.isLoading.set(false);
      }
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
  }

  getRoleIcon(type: RoleType): string {
    const icons: Record<RoleType, string> = {
      [RoleType.Administrador]: 'shield',
      [RoleType.CoordenadorGeral]: 'supervisor_account',
      [RoleType.CoordenadorGrupo]: 'star',
      [RoleType.Usuario]: 'person'
    };
    return icons[type] || 'person';
  }

  getRoleColor(type: RoleType): string {
    const colors: Record<RoleType, string> = {
      [RoleType.Administrador]: '#e91e63',
      [RoleType.CoordenadorGeral]: '#9c27b0',
      [RoleType.CoordenadorGrupo]: '#ff9800',
      [RoleType.Usuario]: '#4CAF50'
    };
    return colors[type] || '#666';
  }

  getRoleTypeLabel(type: RoleType): string {
    const labels: Record<RoleType, string> = {
      [RoleType.Administrador]: 'Administrador',
      [RoleType.CoordenadorGeral]: 'Coordenador Geral',
      [RoleType.CoordenadorGrupo]: 'Coordenador de Grupo',
      [RoleType.Usuario]: 'Usuário'
    };
    return labels[type] || 'Desconhecido';
  }

  isSystemRole(role: Role): boolean {
    return role.id === ROLE_IDS.ADMINISTRADOR || 
           role.id === ROLE_IDS.COORDENADOR_GERAL ||
           role.id === ROLE_IDS.COORDENADOR_GRUPO ||
           role.id === ROLE_IDS.USUARIO;
  }

  delete(role: Role): void {
    if (this.isSystemRole(role)) {
      this.errorMessage.set('Não é possível excluir cargos padrão do sistema.');
      return;
    }
    
    if (confirm(`Deseja realmente excluir o cargo "${role.name}"?`)) {
      this.roleService.delete(role.id).subscribe({
        next: () => {
          this.roles.update(list => list.filter(r => r.id !== role.id));
        },
        error: (error) => {
          console.error('Erro ao excluir cargo:', error);
          this.errorMessage.set('Erro ao excluir cargo. Tente novamente.');
        }
      });
    }
  }
}
