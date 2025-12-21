import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss'
})
export class AdminUsers implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  searchTerm = '';
  selectedRole = '';
  loading = false;

  roles = [
    { value: 0, label: 'Usuário' },
    { value: 1, label: 'Coordenador de Grupo' },
    { value: 2, label: 'Coordenador Geral' },
    { value: 3, label: 'Administrador' }
  ];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    setTimeout(() => {
      this.users = [
        { id: 1, name: 'Admin', email: 'admin@admin.com', role: { type: 3, name: 'Administrador' }, createdAt: new Date(), status: 'active' },
        { id: 2, name: 'João Silva', email: 'joao@email.com', role: { type: 0, name: 'Usuário' }, createdAt: new Date(), status: 'active' },
        { id: 3, name: 'Maria Santos', email: 'maria@email.com', role: { type: 1, name: 'Coordenador de Grupo' }, createdAt: new Date(), status: 'active' },
        { id: 4, name: 'Pedro Costa', email: 'pedro@email.com', role: { type: 2, name: 'Coordenador Geral' }, createdAt: new Date(), status: 'inactive' }
      ];
      this.filteredUsers = [...this.users];
      this.loading = false;
    }, 500);
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchTerm || 
        user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesRole = !this.selectedRole || 
        user.role.type === parseInt(this.selectedRole);

      return matchesSearch && matchesRole;
    });
  }

  getRoleBadgeClass(roleType: number): string {
    switch (roleType) {
      case 3: return 'bg-danger';
      case 2: return 'bg-warning text-dark';
      case 1: return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  deleteUser(user: any): void {
    if (confirm(`Deseja realmente excluir o usuário ${user.name}?`)) {
      this.users = this.users.filter(u => u.id !== user.id);
      this.applyFilters();
    }
  }

  toggleStatus(user: any): void {
    user.status = user.status === 'active' ? 'inactive' : 'active';
  }
}
