import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TagService } from '../../../core/services/tag.service';
import { UserService } from '../../../core/services/user.service';
import { Tag, CreateTagDto, User, UserSimple } from '../../../core/models/user.model';
import { ConfirmationService } from '../../../shared/components/confirmation-modal';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-tags-crud',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './tags-crud.component.html',
  styleUrl: './tags-crud.component.scss'
})
export class TagsCrudComponent implements OnInit {
  private tagService = inject(TagService);
  private userService = inject(UserService);
  private confirmationService = inject(ConfirmationService);
  private toastService = inject(ToastService);

  tags = signal<Tag[]>([]);
  users = signal<User[]>([]);
  isLoading = signal(true);
  searchTerm = signal('');
  
  isModalOpen = signal(false);
  isEditing = signal(false);
  selectedTag = signal<Tag | null>(null);
  
  formData = signal({
    name: '',
    color: '#795548',
    description: ''
  });

  isUserModalOpen = signal(false);
  selectedTagForUsers = signal<Tag | null>(null);
  availableUsers = signal<UserSimple[]>([]);
  tagUsers = signal<UserSimple[]>([]);

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading.set(true);
    try {
      const [tags, users] = await Promise.all([
        this.tagService.getAll().toPromise(),
        this.userService.getAll().toPromise()
      ]);
      this.tags.set(tags || []);
      this.users.set(users || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  get filteredTags(): Tag[] {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.tags();
    
    return this.tags().filter(tag => 
      tag.name.toLowerCase().includes(term) ||
      tag.description?.toLowerCase().includes(term)
    );
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.selectedTag.set(null);
    this.formData.set({
      name: '',
      color: '#795548',
      description: ''
    });
    this.isModalOpen.set(true);
  }

  openEditModal(tag: Tag): void {
    this.isEditing.set(true);
    this.selectedTag.set(tag);
    this.formData.set({
      name: tag.name,
      color: tag.color,
      description: tag.description
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedTag.set(null);
  }

  updateFormName(value: string): void {
    this.formData.update(f => ({ ...f, name: value }));
  }

  updateFormColor(value: string): void {
    this.formData.update(f => ({ ...f, color: value }));
  }

  updateFormDescription(value: string): void {
    this.formData.update(f => ({ ...f, description: value }));
  }

  async saveTag(): Promise<void> {
    const data = this.formData();
    
    if (!data.name.trim()) {
      this.toastService.warning('Nome da tag é obrigatório');
      return;
    }

    try {
      const dto: CreateTagDto = {
        name: data.name.trim(),
        color: data.color,
        description: data.description.trim()
      };

      if (this.isEditing()) {
        const tag = this.selectedTag();
        if (tag) {
          await this.tagService.update(tag.id, dto).toPromise();
          const updatedTags = this.tags().map(t => 
            t.id === tag.id ? { ...t, ...dto } : t
          );
          this.tags.set(updatedTags);
          this.toastService.success('Tag atualizada com sucesso');
        }
      } else {
        const newTag = await this.tagService.create(dto).toPromise();
        if (newTag) {
          this.tags.set([...this.tags(), newTag]);
          this.toastService.success('Tag criada com sucesso');
        }
      }
      
      this.closeModal();
    } catch (error) {
      console.error('Erro ao salvar tag:', error);
      this.toastService.error('Erro ao salvar tag');
    }
  }

  async deleteTag(tag: Tag): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      title: 'Confirmar Exclusão',
      message: `Deseja realmente excluir a tag "${tag.name}"?`,
      confirmText: 'Sim, excluir',
      cancelText: 'Cancelar',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      await this.tagService.delete(tag.id).toPromise();
      this.tags.set(this.tags().filter(t => t.id !== tag.id));
      this.toastService.success('Tag excluída com sucesso');
    } catch (error) {
      console.error('Erro ao excluir tag:', error);
      this.toastService.error('Erro ao excluir tag');
    }
  }

  openUserModal(tag: Tag): void {
    this.selectedTagForUsers.set(tag);
    this.tagUsers.set(tag.users || []);
    
    const tagUserIds = new Set((tag.users || []).map(u => u.id));
    this.availableUsers.set(
      this.users().filter(u => !tagUserIds.has(u.id))
    );
    
    this.isUserModalOpen.set(true);
  }

  closeUserModal(): void {
    this.isUserModalOpen.set(false);
    this.selectedTagForUsers.set(null);
  }

  async addUserToTag(userId: string): Promise<void> {
    const tag = this.selectedTagForUsers();
    if (!tag) return;

    try {
      await this.tagService.addTagToUser(tag.id, userId).toPromise();
      
      const user = this.users().find(u => u.id === userId);
      if (user) {
        this.tagUsers.set([...this.tagUsers(), user]);
        this.availableUsers.set(
          this.availableUsers().filter(u => u.id !== userId)
        );
        
        const updatedTags = this.tags().map(t => 
          t.id === tag.id ? { ...t, users: [...(t.users || []), user] } : t
        );
        this.tags.set(updatedTags);
        this.toastService.success('Usuário adicionado à tag');
      }
    } catch (error) {
      console.error('Erro ao adicionar usuário à tag:', error);
      this.toastService.error('Erro ao adicionar usuário à tag');
    }
  }

  async removeUserFromTag(userId: string): Promise<void> {
    const tag = this.selectedTagForUsers();
    if (!tag) return;

    try {
      await this.tagService.removeTagFromUser(tag.id, userId).toPromise();
      
      const user = this.tagUsers().find(u => u.id === userId);
      if (user) {
        this.tagUsers.set(this.tagUsers().filter(u => u.id !== userId));
        this.availableUsers.set([...this.availableUsers(), user]);
        
        const updatedTags = this.tags().map(t => 
          t.id === tag.id ? { ...t, users: (t.users || []).filter(u => u.id !== userId) } : t
        );
        this.tags.set(updatedTags);
        this.toastService.success('Usuário removido da tag');
      }
    } catch (error) {
      console.error('Erro ao remover usuário da tag:', error);
      this.toastService.error('Erro ao remover usuário da tag');
    }
  }
}
