import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostService } from '../../core/services/post.service';
import { PastoralService } from '../../core/services/pastoral.service';
import { Post } from '../../core/models/post.model';
import { Pastoral, TipoPastoral } from '../../core/models/pastoral.model';
import { PostCardComponent } from './components/post-card/post-card.component';
import { CreatePostComponent } from './components/create-post/create-post.component';
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

  posts = signal<Post[]>([]);
  pinnedPosts = signal<Post[]>([]);
  pastorais = signal<Pastoral[]>([]);
  selectedFilter = signal<'all' | 'PA' | 'PJ'>('all');
  isLoading = signal(true);
  error = signal('');

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
    this.error.set('');

    this.postService.getPinned().subscribe({
      next: (pinned) => {
        this.pinnedPosts.set(pinned);
      }
    });

    this.postService.getRecent(50).subscribe({
      next: (posts) => {
        this.posts.set(posts);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar posts');
        this.isLoading.set(false);
      }
    });
  }

  loadPostsByFilter(filter: 'PA' | 'PJ'): void {
    this.isLoading.set(true);
    this.error.set('');
    
    const pastoralIds = this.pastorais()
      .filter(p => p.tipoPastoral === filter)
      .map(p => p.id);

    if (pastoralIds.length === 0) {
      this.posts.set([]);
      this.pinnedPosts.set([]);
      this.isLoading.set(false);
      return;
    }

    // Carregar posts de todas as pastorais do tipo selecionado
    const requests = pastoralIds.map(id => this.postService.getByPastoral(id));
    
    forkJoin(requests).subscribe({
      next: (results) => {
        const allPosts = results.flat();
        this.posts.set(allPosts);
        this.pinnedPosts.set(allPosts.filter(p => p.isPinned));
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Erro ao carregar posts');
        this.isLoading.set(false);
      }
    });
  }

  setFilter(filter: 'all' | 'PA' | 'PJ'): void {
    this.selectedFilter.set(filter);
    
    if (filter === 'all') {
      this.loadPosts();
    } else {
      this.loadPostsByFilter(filter);
    }
  }

  onPostCreated(post: Post): void {
    this.posts.update(posts => [post, ...posts]);
  }

  onPostDeleted(postId: string): void {
    this.posts.update(posts => posts.filter(p => p.id !== postId));
    this.pinnedPosts.update(posts => posts.filter(p => p.id !== postId));
  }

  onPostUpdated(updatedPost: Post): void {
    this.posts.update(posts => posts.map(p => p.id === updatedPost.id ? updatedPost : p));
  }
}
