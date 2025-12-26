import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { NotificacaoService } from '../../core/services/notificacao.service';
import { SignalRService } from '../../core/services/signal-r.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private notificacaoService = inject(NotificacaoService);
  private signalRService = inject(SignalRService);

  sidebarOpen = signal(false);
  unreadCount = signal(0);

  constructor() {
    // Monitorar novas notificações e atualizar contador
    effect(() => {
      const novaNotificacao = this.signalRService.novaNotificacao();
      if (novaNotificacao) {
        this.unreadCount.update(count => count + 1);
      }
    });
  }

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

  get isCoordenadorGeral(): boolean {
    const role = this.currentUser?.role;
    return role === 'Coordenador Geral' || role === 'Administrador';
  }

  get isCoordenador(): boolean {
    const role = this.currentUser?.role;
    return role === 'Coordenador de Grupo' || role === 'Coordenador Geral' || role === 'Administrador';
  }

  ngOnInit(): void {
    this.loadUnreadCount();
    
    // Só conectar SignalR se houver usuário autenticado
    if (this.currentUser) {
      this.connectSignalR();
    }
  }

  connectSignalR(): void {
    // Verificar novamente se há token antes de conectar
    if (!localStorage.getItem('token')) {
      console.warn('Token não disponível, SignalR não será conectado');
      return;
    }

    this.signalRService.connect().catch((err) => {
      console.error('Erro ao conectar SignalR no layout:', err);
      // Não tentar reconectar automaticamente se não houver token
      if (localStorage.getItem('token')) {
        setTimeout(() => this.connectSignalR(), 5000);
      }
    });
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
    this.signalRService.reset();
    this.authService.logout();
  }
}
