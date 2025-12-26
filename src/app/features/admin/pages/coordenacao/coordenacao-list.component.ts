import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-coordenacao-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './coordenacao-list.component.html',
  styleUrl: './coordenacao-list.component.scss'
})
export class CoordenacaoListComponent implements OnInit {
  private userService = inject(UserService);

  allUsers = signal<User[]>([]);
  searchTerm = signal('');
  selectedRole = signal<string>('all');
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  // Filtrar apenas coordenadores
  coordenadores = computed(() => {
    return this.allUsers().filter(user => 
      user.roleName === 'Coordenador de Grupo' || 
      user.roleName === 'Coordenador Geral' ||
      user.roleName === 'Administrador'
    );
  });

  filteredCoordenadores = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const role = this.selectedRole();
    
    let filtered = this.coordenadores();

    if (role !== 'all') {
      filtered = filtered.filter(c => c.roleName === role);
    }

    if (term) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.grupos.some(g => g.grupoName.toLowerCase().includes(term))
      );
    }

    return filtered;
  });

  ngOnInit(): void {
    this.loadCoordenadores();
  }

  loadCoordenadores(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    
    this.userService.getAll().subscribe({
      next: (users) => {
        this.allUsers.set(users);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar coordenadores:', error);
        this.errorMessage.set('Erro ao carregar coordenadores. Tente novamente.');
        this.isLoading.set(false);
      }
    });
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }

  getRoleBadgeClass(role: string): string {
    const roleMap: { [key: string]: string } = {
      'Administrador': 'role-admin',
      'Coordenador Geral': 'role-coord-geral',
      'Coordenador de Grupo': 'role-coord-grupo'
    };
    return roleMap[role] || 'role-default';
  }
}
