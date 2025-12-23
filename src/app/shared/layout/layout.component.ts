import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { NotificacaoService } from '../../core/services/notificacao.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private notificacaoService = inject(NotificacaoService);

  sidebarOpen = signal(false);
  unreadCount = signal(0);

  get currentUser() {
    return this.authService.currentUser();
  }

  get userInitial(): string {
    return this.currentUser?.name?.charAt(0).toUpperCase() || '?';
  }

  get isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'Administrador';
  }

  get isCoordenador(): boolean {
    const role = this.currentUser?.role;
    return role === 'Coordenador de Grupo' || role === 'Coordenador Geral';
  }

  ngOnInit(): void {
    this.loadUnreadCount();
  }

  loadUnreadCount(): void {
    this.notificacaoService.getNaoLidas().subscribe({
      next: (notificacoes) => {
        this.unreadCount.set(notificacoes.length);
      }
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
  }
}
