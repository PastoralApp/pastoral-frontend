import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../core/services/post.service';
import { Post, CreatePostDto, PostType, CreateCommentDto } from '../../core/models/post.model';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit {
  posts: Post[] = [];
  loading = false;
  showCreateForm = false;

  newPost: CreatePostDto = {
    content: '',
    imageUrl: '',
    type: 'Comum'
  };

  PostType = PostType;

  commentTexts: { [postId: string]: string } = {};
  showComments: { [postId: string]: boolean } = {};

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    this.postService.getAll().subscribe({
      next: (posts: Post[]) => {
        this.posts = posts.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erro ao carregar posts:', err);
        this.loading = false;
      }
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.resetForm();
    }
  }

  createPost(): void {
    if (!this.newPost.content) {
      return;
    }

    this.loading = true;
    this.postService.create(this.newPost).subscribe({
      next: (post: Post) => {
        this.posts.unshift(post);
        this.toggleCreateForm();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erro ao criar post:', err);
        this.loading = false;
      }
    });
  }

  resetForm(): void {
    this.newPost = {
      content: '',
      imageUrl: '',
      type: 'Comum'
    };
  }

  toggleReaction(post: Post): void {
    this.postService.toggleReaction(post.id).subscribe({
      next: (result: { likesCount: number; userHasReacted: boolean }) => {
        post.likesCount = result.likesCount;
        post.userHasReacted = result.userHasReacted;
      },
      error: (err: any) => console.error('Erro ao reagir:', err)
    });
  }

  toggleComments(postId: string): void {
    this.showComments[postId] = !this.showComments[postId];

    if (this.showComments[postId]) {
      this.loadComments(postId);
    }
  }

  loadComments(postId: string): void {
    this.postService.getComments(postId).subscribe({
      next: (comments: any[]) => {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
          post.comments = comments;
        }
      },
      error: (err: any) => console.error('Erro ao carregar comentários:', err)
    });
  }

  addComment(post: Post): void {
    const commentText = this.commentTexts[post.id];
    if (!commentText?.trim()) {
      return;
    }

    const comment: CreateCommentDto = { conteudo: commentText };

    this.postService.addComment(post.id, comment).subscribe({
      next: (newComment: any) => {
        if (!post.comments) {
          post.comments = [];
        }
        post.comments.push(newComment);
        this.commentTexts[post.id] = '';
      },
      error: (err: any) => console.error('Erro ao adicionar comentário:', err)
    });
  }

  deleteComment(post: Post, commentId: string): void {
    if (!confirm('Deseja realmente excluir este comentário?')) {
      return;
    }

    this.postService.deleteComment(commentId).subscribe({
      next: () => {
        if (post.comments) {
          post.comments = post.comments.filter(c => c.id !== commentId);
        }
      },
      error: (err: any) => console.error('Erro ao excluir comentário:', err)
    });
  }

  sharePost(post: Post): void {
    this.postService.sharePost(post.id).subscribe({
      next: () => {
        alert('Post compartilhado!');
      },
      error: (err: any) => console.error('Erro ao compartilhar:', err)
    });
  }

  toggleSave(post: Post): void {
    this.postService.toggleSave(post.id).subscribe({
      next: (result: { saved: boolean }) => {
        post.userHasSaved = result.saved;
      },
      error: (err: any) => console.error('Erro ao salvar:', err)
    });
  }

  formatDate(date: Date): string {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;

    return postDate.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }

  getPostTypeLabel(type: string): string {
    switch (type) {
      case 'Comum': return 'Comum';
      case 'Aviso': return 'Aviso';
      case 'Evento': return 'Evento';
      case 'Reflexao': return 'Reflexão';
      default: return 'Post';
    }
  }

  getPostTypeBadgeClass(type: string): string {
    switch (type) {
      case 'Comum': return 'bg-secondary';
      case 'Aviso': return 'bg-warning text-dark';
      case 'Evento': return 'bg-success';
      case 'Reflexao': return 'bg-primary';
      default: return 'bg-secondary';
    }
  }
}
