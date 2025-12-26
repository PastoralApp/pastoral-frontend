import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { RoleService } from '../../../../core/services/role.service';
import { TagService } from '../../../../core/services/tag.service';
import { GrupoService } from '../../../../core/services/grupo.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { Role } from '../../../../core/models/role.model';
import { User, Tag } from '../../../../core/models/user.model';
import { Grupo } from '../../../../core/models/pastoral.model';
import { ConfirmationService } from '../../../../shared/components/confirmation-modal';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit {
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private tagService = inject(TagService);
  private grupoService = inject(GrupoService);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = signal(false);
  isSubmitting = signal(false);
  isDeleting = signal(false);
  isAddingGrupo = signal(false);
  roles = signal<Role[]>([]);
  currentUser = signal<User | null>(null);
  allTags = signal<Tag[]>([]);
  allGrupos = signal<Grupo[]>([]);
  
  availableTags = computed(() => {
    const user = this.currentUser();
    if (!user) return this.allTags();
    const userTagIds = user.tags.map(t => t.id);
    return this.allTags().filter(t => !userTagIds.includes(t.id));
  });

  availableGrupos = computed(() => {
    const user = this.currentUser();
    if (!user) return this.allGrupos();
    const userGrupoIds = user.grupos.map(g => g.grupoId);
    return this.allGrupos().filter(g => !userGrupoIds.includes(g.id));
  });

  userId: string | null = null;

  formData = {
    name: '',
    email: '',
    password: '',
    roleId: '',
    telefone: '',
    birthDate: ''
  };

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEditMode.set(!!this.userId);

    this.roleService.getAll().subscribe({
      next: (roles) => this.roles.set(roles)
    });

    this.tagService.getAll().subscribe({
      next: (tags) => this.allTags.set(tags)
    });

    this.grupoService.getAll().subscribe({
      next: (grupos) => this.allGrupos.set(grupos)
    });

    if (this.isEditMode() && this.userId) {
      this.loadUser();
    }
  }

  private loadUser(): void {
    if (!this.userId) return;
    
    this.userService.getById(this.userId).subscribe({
      next: (user) => {
        this.currentUser.set(user);
        this.formData = {
          name: user.name,
          email: user.email,
          password: '',
          roleId: user.roleId,
          telefone: user.telefone || '',
          birthDate: user.birthDate || ''
        };
      }
    });
  }

  async deleteUser(): Promise<void> {
    if (!this.userId) return;

    const user = this.currentUser();
    const confirmed = await this.confirmationService.confirm({
      title: 'Excluir Usuário',
      message: `Deseja realmente excluir o usuário "${user?.name}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Sim, excluir',
      cancelText: 'Cancelar',
      type: 'danger'
    });

    if (!confirmed) return;

    this.isDeleting.set(true);
    this.userService.delete(this.userId).subscribe({
      next: () => {
        this.toastService.success('Usuário excluído com sucesso');
        this.router.navigate(['/admin/users']);
      },
      error: (err) => {
        console.error('Erro ao excluir usuário:', err);
        this.toastService.error(err.error?.message || 'Erro ao excluir usuário');
        this.isDeleting.set(false);
      }
    });
  }

  addTagToUser(tagId: string): void {
    if (!this.userId || !tagId) return;

    this.userService.addTag(this.userId, tagId).subscribe({
      next: () => {
        this.toastService.success('Tag adicionada com sucesso');
        this.loadUser();
      },
      error: (err) => {
        console.error('Erro ao adicionar tag:', err);
        this.toastService.error(err.error?.message || 'Erro ao adicionar tag ao usuário');
      }
    });
  }

  async removeTagFromUser(tagId: string, tagName: string): Promise<void> {
    if (!this.userId) return;

    const confirmed = await this.confirmationService.confirm({
      title: 'Remover Tag',
      message: `Deseja remover a tag "${tagName}" deste usuário?`,
      confirmText: 'Sim, remover',
      cancelText: 'Cancelar',
      type: 'warning'
    });

    if (!confirmed) return;

    this.userService.removeTag(this.userId, tagId).subscribe({
      next: () => {
        this.toastService.success('Tag removida com sucesso');
        this.loadUser();
      },
      error: (err) => {
        console.error('Erro ao remover tag:', err);
        this.toastService.error(err.error?.message || 'Erro ao remover tag do usuário');
      }
    });
  }

  // Grupos
  addGrupoToUser(grupoId: string): void {
    if (!this.userId || !grupoId) return;

    this.isAddingGrupo.set(true);
    this.userService.addToGrupo(this.userId, grupoId).subscribe({
      next: () => {
        this.toastService.success('Usuário adicionado ao grupo');
        this.isAddingGrupo.set(false);
        this.loadUser();
      },
      error: (err) => {
        console.error('Erro ao adicionar ao grupo:', err);
        this.toastService.error(err.error?.message || 'Erro ao adicionar usuário ao grupo');
        this.isAddingGrupo.set(false);
      }
    });
  }

  async removeGrupoFromUser(grupoId: string, grupoName: string): Promise<void> {
    if (!this.userId) return;

    const confirmed = await this.confirmationService.confirm({
      title: 'Remover do Grupo',
      message: `Deseja remover o usuário do grupo "${grupoName}"?`,
      confirmText: 'Sim, remover',
      cancelText: 'Cancelar',
      type: 'warning'
    });

    if (!confirmed) return;

    this.userService.removeFromGrupo(this.userId, grupoId).subscribe({
      next: () => {
        this.toastService.success('Usuário removido do grupo');
        this.loadUser();
      },
      error: (err) => {
        console.error('Erro ao remover do grupo:', err);
        this.toastService.error(err.error?.message || 'Erro ao remover usuário do grupo');
      }
    });
  }

  save(): void {
    this.isSubmitting.set(true);

    if (this.isEditMode() && this.userId) {
      const updateData = {
        name: this.formData.name,
        telefone: this.formData.telefone,
        birthDate: this.formData.birthDate,
        roleId: this.formData.roleId
      };

      this.userService.updateAdmin(this.userId, updateData).subscribe({
        next: () => {
          this.toastService.success('Usuário atualizado com sucesso');
          this.router.navigate(['/admin/users']);
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Erro ao atualizar usuário');
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.userService.createAdmin(this.formData).subscribe({
        next: () => {
          this.toastService.success('Usuário criado com sucesso');
          this.router.navigate(['/admin/users']);
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Erro ao criar usuário');
          this.isSubmitting.set(false);
        }
      });
    }
  }
}
