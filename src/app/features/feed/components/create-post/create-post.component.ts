import { Component, inject, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../../../core/services/post.service';
import { CreatePostDto, Post, PostType, TipoPastoral } from '../../../../core/models/post.model';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-post.component.html',
  styleUrl: './create-post.component.scss'
})
export class CreatePostComponent {
  private postService = inject(PostService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  @Output() postCreated = new EventEmitter<Post>();

  conteudo = signal('');
  tipo = signal<PostType>(PostType.Comum);
  tipoPastoral = signal<TipoPastoral>(TipoPastoral.Geral);
  pastoralId = signal<string | null>(null);
  imagemUrl = signal<string | null>(null);
  isExpanded = signal(false);
  isSubmitting = signal(false);

  PostType = PostType;
  TipoPastoral = TipoPastoral;

  get isCommonUser(): boolean {
    const user = this.authService.currentUser();
    return user?.role === 'Usuário' || !user?.role;
  }

  get userName(): string {
    const user = this.authService.currentUser();
    return user?.name || 'Usuário';
  }

  get userInitial(): string {
    return this.userName.charAt(0).toUpperCase();
  }

  get userPhoto(): string | null {
    const user = this.authService.currentUser();
    return user?.photoUrl || null;
  }

  expand(): void {
    this.isExpanded.set(true);
  }

  collapse(): void {
    if (!this.conteudo().trim()) {
      this.isExpanded.set(false);
    }
  }

  submit(): void {
    const content = this.conteudo().trim();
    if (!content || this.isSubmitting()) return;

    this.isSubmitting.set(true);

    const request: CreatePostDto = {
      content: content,
      type: this.tipo(),
      tipoPastoral: this.tipoPastoral(),
      imageUrl: this.imagemUrl() || undefined
    };

    this.postService.create(request).subscribe({
      next: (post) => {
        this.postCreated.emit(post);
        this.conteudo.set('');
        this.tipo.set(PostType.Comum);
        this.tipoPastoral.set(TipoPastoral.Geral);
        this.pastoralId.set(null);
        this.imagemUrl.set(null);
        this.isExpanded.set(false);
        this.isSubmitting.set(false);
        this.toastService.success('Post publicado!');
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Erro ao criar post');
        this.isSubmitting.set(false);
      }
    });
  }

  cancel(): void {
    this.conteudo.set('');
    this.tipo.set(PostType.Comum);
    this.tipoPastoral.set(TipoPastoral.Geral);
    this.pastoralId.set(null);
    this.imagemUrl.set(null);
    this.isExpanded.set(false);
  }
}
