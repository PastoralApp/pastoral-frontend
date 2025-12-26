import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { TagService } from '../../../core/services/tag.service';
import { AuthService } from '../../../core/services/auth.service';
import { User, Tag } from '../../../core/models/user.model';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmationService } from '../../../shared/components/confirmation-modal';

@Component({
  selector: 'app-usuarios-grupo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './usuarios-grupo.component.html',
  styleUrl: './usuarios-grupo.component.scss'
})
export class UsuariosGrupoComponent implements OnInit {
  private userService = inject(UserService);
  private tagService = inject(TagService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);

  usuarios = signal<User[]>([]);
  usuariosFiltrados = signal<User[]>([]);
  tags = signal<Tag[]>([]);
  isLoading = signal(true);
  searchTerm = '';
  
  currentUserData = signal<User | null>(null);
  selectedUser = signal<User | null>(null);
  showTagModal = signal(false);
  
  // Coordenador de Grupo só vê usuários dos seus grupos
  meusGruposIds = computed(() => {
    const user = this.currentUserData();
    return user?.grupos.map(g => g.grupoId) || [];
  });

  ngOnInit(): void {
    this.checkAccess();
    this.loadCurrentUser();
    this.loadTags();
    this.loadUsuarios();
  }

  checkAccess(): void {
    const user = this.authService.currentUser();
    const allowedRoles = ['Coordenador de Grupo', 'Administrador'];
    if (!allowedRoles.includes(user?.role || '')) {
      this.toastService.error('Acesso negado');
      this.router.navigate(['/feed']);
    }
  }

  loadCurrentUser(): void {
    this.userService.getMe().subscribe({
      next: (user) => {
        this.currentUserData.set(user);
      },
      error: () => {
        this.toastService.error('Erro ao carregar dados do usuário');
      }
    });
  }

  loadUsuarios(): void {
    this.isLoading.set(true);
    
    this.userService.getAll().subscribe({
      next: (users) => {
        const user = this.authService.currentUser();
        
        let usuariosFiltrados = users;
        if (user?.role === 'Coordenador de Grupo') {
          const meusGrupos = this.meusGruposIds();
          usuariosFiltrados = users.filter(u => 
            u.grupos.some(g => meusGrupos.includes(g.grupoId))
          );
        }
        
        this.usuarios.set(usuariosFiltrados);
        this.usuariosFiltrados.set(usuariosFiltrados);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Erro ao carregar usuários');
        this.isLoading.set(false);
      }
    });
  }

  loadTags(): void {
    this.tagService.getAll().subscribe({
      next: (tags) => {
        this.tags.set(tags);
      },
      error: () => {
        this.toastService.error('Erro ao carregar tags');
      }
    });
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.usuariosFiltrados.set(this.usuarios());
      return;
    }

    const term = this.searchTerm.toLowerCase();
    const filtrados = this.usuarios().filter(u =>
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.roleName.toLowerCase().includes(term)
    );

    this.usuariosFiltrados.set(filtrados);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.usuariosFiltrados.set(this.usuarios());
  }

  openTagModal(user: User): void {
    this.selectedUser.set(user);
    this.showTagModal.set(true);
  }

  closeTagModal(): void {
    this.showTagModal.set(false);
    this.selectedUser.set(null);
  }

  hasTag(user: User, tagId: string): boolean {
    return user.tags.some(t => t.id === tagId);
  }

  async toggleTag(tagId: string): Promise<void> {
    const user = this.selectedUser();
    if (!user) return;

    const hasTag = this.hasTag(user, tagId);
    const tag = this.tags().find(t => t.id === tagId);

    if (!tag) return;

    if (hasTag) {
      await this.removeTag(user, tagId, tag.name);
    } else {
      await this.addTag(user, tagId, tag.name);
    }
  }

  private async addTag(user: User, tagId: string, tagName: string): Promise<void> {
    this.userService.addTag(user.id, tagId).subscribe({
      next: () => {
        this.toastService.success(`Tag "${tagName}" adicionada`);
        this.loadUsuarios();
      },
      error: () => {
        this.toastService.error('Erro ao adicionar tag');
      }
    });
  }

  private async removeTag(user: User, tagId: string, tagName: string): Promise<void> {
    this.userService.removeTag(user.id, tagId).subscribe({
      next: () => {
        this.toastService.success(`Tag "${tagName}" removida`);
        this.loadUsuarios();
      },
      error: () => {
        this.toastService.error('Erro ao remover tag');
      }
    });
  }

  getRoleBadgeClass(roleName: string): string {
    const roleMap: { [key: string]: string } = {
      'Administrador': 'role-admin',
      'Coordenador Geral': 'role-coord-geral',
      'Coordenador de Grupo': 'role-coord-grupo',
      'Usuario': 'role-usuario'
    };
    return roleMap[roleName] || 'role-usuario';
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }

  getGruposText(user: User): string {
    if (!user.grupos || user.grupos.length === 0) return 'Nenhum grupo';
    if (user.grupos.length === 1) return user.grupos[0].grupoName;
    return `${user.grupos.length} grupos`;
  }
}
