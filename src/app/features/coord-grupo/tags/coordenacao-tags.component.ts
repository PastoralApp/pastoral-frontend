import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TagService } from '../../../core/services/tag.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { Tag, CreateTagDto, User } from '../../../core/models/user.model';
import { ConfirmationService } from '../../../shared/components/confirmation-modal';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-coordenacao-tags',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './coordenacao-tags.component.html',
  styleUrl: './coordenacao-tags.component.scss'
})
export class CoordenacaoTagsComponent implements OnInit {
  private tagService = inject(TagService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private confirmationService = inject(ConfirmationService);
  private toastService = inject(ToastService);

  tags = signal<Tag[]>([]);
  users = signal<User[]>([]);
  isLoading = signal(true);
  
  showCreateModal = signal(false);
  showEditModal = signal(false);
  showAssignModal = signal(false);
  selectedTag = signal<Tag | null>(null);
  selectedUser = signal<User | null>(null);

  tagForm = signal<CreateTagDto>({
    name: '',
    color: '#3B82F6',
    description: ''
  });

  currentUserGrupoId = signal<string | null>(null);

  ngOnInit(): void {
    this.loadCurrentUserGroups();
  }

  loadCurrentUserGroups(): void {
    this.userService.getMe().subscribe({
      next: (user) => {
        // Pegar o primeiro grupo ativo do coordenador
        const grupo = user.grupos?.find(g => g);
        if (grupo) {
          this.currentUserGrupoId.set(grupo.grupoId);
          this.loadData(grupo.grupoId);
        } else {
          this.toastService.error('Você não está associado a nenhum grupo');
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.toastService.error('Erro ao carregar informações do usuário');
        this.isLoading.set(false);
      }
    });
  }

  loadData(grupoId: string): void {
    this.isLoading.set(true);
    
    Promise.all([
      this.tagService.getAll().toPromise(),
      this.userService.getByGrupo(grupoId).toPromise()
    ]).then(([tags, users]) => {
      this.tags.set(tags || []);
      this.users.set(users || []);
      this.isLoading.set(false);
    }).catch(() => {
      this.toastService.error('Erro ao carregar dados');
      this.isLoading.set(false);
    });
  }

  openCreateModal(): void {
    this.tagForm.set({
      name: '',
      color: '#3B82F6',
      description: ''
    });
    this.showCreateModal.set(true);
  }

  openEditModal(tag: Tag): void {
    this.selectedTag.set(tag);
    this.tagForm.set({
      name: tag.name,
      color: tag.color,
      description: tag.description
    });
    this.showEditModal.set(true);
  }

  openAssignModal(tag: Tag): void {
    this.selectedTag.set(tag);
    this.showAssignModal.set(true);
  }

  closeModals(): void {
    this.showCreateModal.set(false);
    this.showEditModal.set(false);
    this.showAssignModal.set(false);
    this.selectedTag.set(null);
    this.selectedUser.set(null);
  }

  createTag(): void {
    const form = this.tagForm();
    if (!form.name.trim()) return;

    this.tagService.create(form).subscribe({
      next: () => {
        this.toastService.success('Tag criada com sucesso!');
        this.closeModals();
        if (this.currentUserGrupoId()) {
          this.loadData(this.currentUserGrupoId()!);
        }
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Erro ao criar tag');
      }
    });
  }

  updateTag(): void {
    const tag = this.selectedTag();
    const form = this.tagForm();
    if (!tag || !form.name.trim()) return;

    this.tagService.update(tag.id, form).subscribe({
      next: () => {
        this.toastService.success('Tag atualizada com sucesso!');
        this.closeModals();
        if (this.currentUserGrupoId()) {
          this.loadData(this.currentUserGrupoId()!);
        }
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Erro ao atualizar tag');
      }
    });
  }

  async deleteTag(tag: Tag): Promise<void> {
    const confirmed = await this.confirmationService.confirmDelete('esta tag');
    if (!confirmed) return;

    this.tagService.delete(tag.id).subscribe({
      next: () => {
        this.toastService.success('Tag excluída com sucesso!');
        if (this.currentUserGrupoId()) {
          this.loadData(this.currentUserGrupoId()!);
        }
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Erro ao excluir tag');
      }
    });
  }

  toggleUserTag(user: User, tag: Tag): void {
    const hasTag = this.hasTag(user, tag);

    if (hasTag) {
      this.tagService.removeTagFromUser(tag.id, user.id).subscribe({
        next: () => {
          this.toastService.success('Tag removida do usuário');
          if (this.currentUserGrupoId()) {
            this.loadData(this.currentUserGrupoId()!);
          }
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Erro ao remover tag');
        }
      });
    } else {
      this.tagService.addTagToUser(tag.id, user.id).subscribe({
        next: () => {
          this.toastService.success('Tag adicionada ao usuário');
          if (this.currentUserGrupoId()) {
            this.loadData(this.currentUserGrupoId()!);
          }
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Erro ao adicionar tag');
        }
      });
    }
  }

  hasTag(user: User, tag: Tag): boolean {
    return user.tags?.some(t => t.id === tag.id) || false;
  }

  getUsersWithTag(tag: Tag): User[] {
    return this.users().filter(u => u.tags?.some(t => t.id === tag.id));
  }

  updateFormField(field: keyof CreateTagDto, value: string): void {
    this.tagForm.update(form => ({
      ...form,
      [field]: value
    }));
  }
}
