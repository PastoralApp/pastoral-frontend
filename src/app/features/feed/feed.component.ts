import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostService } from '../../core/services/post.service';
import { PastoralService } from '../../core/services/pastoral.service';
import { Post } from '../../core/models/post.model';
import { Pastoral, TipoPastoral } from '../../core/models/pastoral.model';
import { PostCardComponent } from './components/post-card/post-card.component';
import { CreatePostComponent } from './components/create-post/create-post.component';
import { ToastService } from '../../shared/services/toast.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, PostCardComponent, CreatePostComponent],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.scss'
})
export class FeedComponent implements OnInit {
  private postService = inject(PostService);
  private pastoralService = inject(PastoralService);
  private toastService = inject(ToastService);

  posts = signal<Post[]>([]);
  pinnedPosts = signal<Post[]>([]);
  pastorais = signal<Pastoral[]>([]);
  availableFilters = signal<Array<{tipo: TipoPastoral, label: string, icon: string}>>([
    {tipo: TipoPastoral.Geral, label: 'Todos', icon: 'public'},
    {tipo: TipoPastoral.PA, label: 'Pastoral Adolescentes', icon: 'child_care'},
    {tipo: TipoPastoral.PJ, label: 'Pastoral Jovens', icon: 'groups'}
  ]);
  selectedFilter = signal<TipoPastoral | null>(null);
  isLoading = signal(true);
  protected readonly TipoPastoral = TipoPastoral;

  ngOnInit(): void {
    this.loadPastorais();
    this.loadPosts();
  }

  loadPastorais(): void {
    this.pastoralService.getAll().subscribe({
      next: (pastorais) => {
        this.pastorais.set(pastorais);
      }
    });
  }

  loadPosts(): void {
    this.isLoading.set(true);

    this.postService.getPinned().subscribe({
      next: (pinned) => {
        this.pinnedPosts.set(pinned);
      }
    });

    this.postService.getRecent(50).subscribe({
      next: (posts) => {
        this.posts.set(posts);
        this.updateAvailableFilters();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.toastService.error('Erro ao carregar posts');
        this.isLoading.set(false);
      }
    });
  }

  updateAvailableFilters(): void {
    // Sempre mostrar todos os filtros
    const filters = [
      {tipo: TipoPastoral.Geral, label: 'Todos', icon: 'public'},
      {tipo: TipoPastoral.PA, label: 'Pastoral Adolescentes', icon: 'child_care'},
      {tipo: TipoPastoral.PJ, label: 'Pastoral Jovens', icon: 'groups'}
    ];

    this.availableFilters.set(filters);
  }

  loadPostsByFilter(filter: TipoPastoral): void {
    this.isLoading.set(true);
    
    if (filter === TipoPastoral.Geral) {
      this.loadPosts();
      return;
    }

    this.postService.getByTipoPastoral(filter).subscribe({
      next: (posts) => {
        this.posts.set(posts);
        this.pinnedPosts.set(posts.filter(p => p.isPinned));
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Erro ao carregar posts');
        this.isLoading.set(false);
      }
    });
  }

  setFilter(filter: TipoPastoral | null): void {
    this.selectedFilter.set(filter);
    
    if (filter === null || filter === TipoPastoral.Geral) {
      this.loadPosts();
    } else {
      this.loadPostsByFilter(filter);
    }
  }

  onPostCreated(post: Post): void {
    this.posts.update(posts => [post, ...posts]);
    this.updateAvailableFilters();
  }

  onPostDeleted(postId: string): void {
    this.posts.update(posts => posts.filter(p => p.id !== postId));
    this.pinnedPosts.update(posts => posts.filter(p => p.id !== postId));
  }

  onPostUpdated(updatedPost: Post): void {
    this.posts.update(posts => posts.map(p => p.id === updatedPost.id ? updatedPost : p));
  }
}
