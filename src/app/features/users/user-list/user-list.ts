import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
})
export class UserList implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = true;
  searchTerm = '';
  selectedRole: number | null = null;
  currentUser: User | null = null;

  roles = [
    { value: 0, label: 'Usuário' },
    { value: 1, label: 'Coordenador de Grupo' },
    { value: 2, label: 'Coordenador Geral' },
    { value: 3, label: 'Administrador' }
  ];

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAll().subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar usuários:', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.users];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      );
    }

    if (this.selectedRole !== null) {
      filtered = filtered.filter(u => u.role?.type === this.selectedRole);
    }

    this.filteredUsers = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onRoleFilterChange(): void {
    this.applyFilters();
  }

  deleteUser(id: string): void {
    if (id === this.currentUser?.id) {
      alert('Você não pode excluir seu próprio usuário!');
      return;
    }

    if (confirm('Deseja realmente excluir este usuário?')) {
      this.userService.delete(id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== id);
          this.applyFilters();
        },
        error: (error) => console.error('Erro ao excluir usuário:', error)
      });
    }
  }

  getRoleLabel(type: number): string {
    return this.roles.find(r => r.value === type)?.label || 'Desconhecido';
  }

  canDeleteUser(user: User): boolean {
    return this.currentUser?.id !== user.id && this.currentUser?.role?.type! >= 2;
  }
}
