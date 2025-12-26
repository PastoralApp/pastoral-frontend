import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';import { RouterLink } from '@angular/router';import { PostService } from '../../../../core/services/post.service';
import { UserService } from '../../../../core/services/user.service';
import { Post, PostType, ChangePostTypeDto, TipoPastoral } from '../../../../core/models/post.model';
import { User } from '../../../../core/models/user.model';
import { ConfirmationService } from '../../../../shared/components/confirmation-modal';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-admin-posts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-posts.component.html',
  styleUrl: './admin-posts.component.scss'
})
export class AdminPostsComponent implements OnInit {
  private postService = inject(PostService);
  private userService = inject(UserService);
  private confirmationService = inject(ConfirmationService);
  private toastService = inject(ToastService);

  posts = signal<Post[]>([]);
  users = signal<User[]>([]);
  isLoading = signal(true);
  searchTerm = signal('');
  selectedUserId = signal<string>('all');
  selectedTipoPastoral = signal<TipoPastoral | 'all'>('all');
  
  isTypeModalOpen = signal(false);
  selectedPost = signal<Post | null>(null);
  selectedType = signal<PostType>(PostType.Comum);

  PostType = PostType;
  TipoPastoral = TipoPastoral;

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading.set(true);
    try {
      const [posts, users] = await Promise.all([
        this.postService.getAllAdmin().toPromise(),
        this.userService.getAll().toPromise()
      ]);
      this.posts.set(posts || []);
      this.users.set(users || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  get filteredPosts(): Post[] {
    let result = this.posts();
    
    const term = this.searchTerm().toLowerCase();
    if (term) {
      result = result.filter(p => 
        p.content.toLowerCase().includes(term) ||
        p.authorName?.toLowerCase().includes(term)
      );
    }

    const userId = this.selectedUserId();
    if (userId !== 'all') {
      result = result.filter(p => p.authorId === userId);
    }

    const tipoPastoral = this.selectedTipoPastoral();
    if (tipoPastoral !== 'all') {
      result = result.filter(p => p.tipoPastoral === tipoPastoral);
    }

    return result.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  openTypeModal(post: Post): void {
    this.selectedPost.set(post);
    this.selectedType.set(post.type);
    this.isTypeModalOpen.set(true);
  }

  closeTypeModal(): void {
    this.isTypeModalOpen.set(false);
    this.selectedPost.set(null);
  }

  async changePostType(): Promise<void> {
    const post = this.selectedPost();
    if (!post) return;

    try {
      const dto: ChangePostTypeDto = {
        type: this.selectedType()
      };
      await this.postService.changePostType(post.id, dto).toPromise();
      
      const updatedPosts = this.posts().map(p => 
        p.id === post.id ? { ...p, type: this.selectedType() } : p
      );
      this.posts.set(updatedPosts);
      this.toastService.success('Tipo do post alterado com sucesso');
      
      this.closeTypeModal();
    } catch (error) {
      console.error('Erro ao alterar tipo do post:', error);
      this.toastService.error('Erro ao alterar tipo do post');
    }
  }

  async deletePost(post: Post): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      title: 'Confirmar Exclusão',
      message: `Deseja realmente excluir o post de ${post.authorName}?`,
      confirmText: 'Sim, excluir',
      cancelText: 'Cancelar',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      await this.postService.deleteAdmin(post.id).toPromise();
      this.posts.set(this.posts().filter(p => p.id !== post.id));
      this.toastService.success('Post excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir post:', error);
      this.toastService.error('Erro ao excluir post');
    }
  }

  getTypeLabel(type: PostType): string {
    const labels = {
      [PostType.Comum]: 'Comum',
      [PostType.Oficial]: 'Oficial',
      [PostType.Fixada]: 'Fixada',
      [PostType.Anuncio]: 'Anúncio'
    };
    return labels[type] || type;
  }

  getTypeClass(type: PostType): string {
    return `post-type-${type.toLowerCase()}`;
  }

  getTipoPastoralLabel(tipo: TipoPastoral | null): string {
    if (!tipo) return 'Geral';
    const labels = {
      [TipoPastoral.PA]: 'PA',
      [TipoPastoral.PJ]: 'PJ',
      [TipoPastoral.Geral]: 'Geral'
    };
    return labels[tipo] || tipo;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
