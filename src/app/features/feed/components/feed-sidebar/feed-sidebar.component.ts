import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostService } from '../../../../core/services/post.service';
import { Post } from '../../../../core/models/post.model';

@Component({
  selector: 'app-feed-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './feed-sidebar.component.html',
  styleUrl: './feed-sidebar.component.scss'
})
export class FeedSidebarComponent implements OnInit {
  private postService = inject(PostService);

  anuncios = signal<Post[]>([]);
  avisos = signal<Post[]>([]);
  isLoadingAnuncios = signal(true);
  isLoadingAvisos = signal(true);

  ngOnInit(): void {
    this.loadAnuncios();
    this.loadAvisos();
  }

  loadAnuncios(): void {
    this.isLoadingAnuncios.set(true);
    this.postService.getAnuncios(5).subscribe({
      next: (posts) => {
        this.anuncios.set(posts);
        this.isLoadingAnuncios.set(false);
      },
      error: () => {
        this.isLoadingAnuncios.set(false);
      }
    });
  }

  loadAvisos(): void {
    this.isLoadingAvisos.set(true);
    this.postService.getAvisos(5).subscribe({
      next: (posts) => {
        this.avisos.set(posts);
        this.isLoadingAvisos.set(false);
      },
      error: () => {
        this.isLoadingAvisos.set(false);
      }
    });
  }

  formatDate(date: string): string {
    const postDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return postDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }

  truncateContent(content: string, maxLength: number = 80): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  }
}
