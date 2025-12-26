import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './usuarios-list.component.html',
  styleUrl: './usuarios-list.component.scss'
})
export class UsuariosListComponent implements OnInit {
  private userService = inject(UserService);
  private toastService = inject(ToastService);

  usuarios = signal<User[]>([]);
  filteredUsuarios = signal<User[]>([]);
  isLoading = signal(true);
  searchTerm = signal('');
  selectedRole = signal('all');

  ngOnInit(): void {
    this.loadUsuarios();
  }

  loadUsuarios(): void {
    this.isLoading.set(true);
    this.userService.getAll().subscribe({
      next: (users) => {
        this.usuarios.set(users);
        this.filteredUsuarios.set(users);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.toastService.error('Erro ao carregar usuários');
        this.isLoading.set(false);
      }
    });
  }

  onSearch(): void {
    this.filterUsuarios();
  }

  onRoleFilter(): void {
    this.filterUsuarios();
  }

  private filterUsuarios(): void {
    let filtered = this.usuarios();

    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(search) ||
        u.roleName.toLowerCase().includes(search)
      );
    }

    if (this.selectedRole() !== 'all') {
      filtered = filtered.filter(u => u.roleName === this.selectedRole());
    }

    this.filteredUsuarios.set(filtered);
  }

  getRoleClass(roleName: string): string {
    const roleMap: Record<string, string> = {
      'Administrador': 'role-admin',
      'Coordenador Geral': 'role-coord-geral',
      'Coordenador de Grupo': 'role-coord-grupo',
      'Membro': 'role-membro'
    };
    return roleMap[roleName] || 'role-default';
  }

  getUniqueRoles(): string[] {
    const roles = new Set(this.usuarios().map(u => u.roleName));
    return Array.from(roles).sort();
  }
}
