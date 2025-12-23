import { Component, Input, Output, EventEmitter, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificacaoService } from '../../../core/services/notificacao.service';

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: number;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  private authService = inject(AuthService);
  private notificacaoService = inject(NotificacaoService);

  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() menuItemClick = new EventEmitter<MenuItem>();

  unreadCount = signal(0);

  mainMenuItems: MenuItem[] = [
    { id: 'feed', label: 'Feed', icon: 'home', route: '/feed' },
    { id: 'eventos', label: 'Eventos', icon: 'event', route: '/eventos' },
    { id: 'pastorais', label: 'Pastorais', icon: 'groups', route: '/pastorais' },
    { id: 'igrejas', label: 'Igrejas', icon: 'church', route: '/igrejas' },
    { id: 'horarios', label: 'Horários de Missa', icon: 'schedule', route: '/horarios-missa' },
    { id: 'notificacoes', label: 'Notificações', icon: 'notifications', route: '/notificacoes' },
    { id: 'salvos', label: 'Salvos', icon: 'bookmark', route: '/salvos' },
  ];

  profileMenuItems: MenuItem[] = [
    { id: 'meus-posts', label: 'Meus Posts', icon: 'article', route: '/meus-posts' },
    { id: 'perfil', label: 'Meu Perfil', icon: 'person', route: '/perfil' },
    { id: 'configuracoes', label: 'Configurações', icon: 'settings', route: '/configuracoes' },
  ];

  coordMenuItems: MenuItem[] = [
    { id: 'coord-grupos', label: 'Gerenciar Grupos', icon: 'group_work', route: '/coordenacao', roles: ['Coordenador de Grupo', 'Coordenador Geral', 'Administrador'] },
    { id: 'coord-membros', label: 'Membros', icon: 'people', route: '/coordenacao/membros', roles: ['Coordenador de Grupo', 'Coordenador Geral', 'Administrador'] },
    { id: 'coord-eventos', label: 'Criar Eventos', icon: 'event_note', route: '/eventos/novo', roles: ['Coordenador de Grupo', 'Coordenador Geral', 'Administrador'] },
  ];

  adminMenuItems: MenuItem[] = [
    { id: 'admin-dashboard', label: 'Painel Admin', icon: 'admin_panel_settings', route: '/admin', roles: ['Administrador'] },
    { id: 'admin-users', label: 'Usuários', icon: 'manage_accounts', route: '/admin/usuarios', roles: ['Administrador'] },
    { id: 'admin-pastorais', label: 'Pastorais', icon: 'church', route: '/admin/pastorais', roles: ['Administrador'] },
    { id: 'admin-grupos', label: 'Grupos', icon: 'group_work', route: '/admin/grupos', roles: ['Administrador'] },
    { id: 'admin-eventos', label: 'Eventos', icon: 'event', route: '/admin/eventos', roles: ['Administrador'] },
    { id: 'admin-posts', label: 'Posts', icon: 'article', route: '/admin/posts', roles: ['Administrador'] },
    { id: 'admin-notificacoes', label: 'Notificações', icon: 'notifications', route: '/admin/notificacoes', roles: ['Administrador'] },
    { id: 'admin-roles', label: 'Roles', icon: 'security', route: '/admin/roles', roles: ['Administrador'] },
  ];

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

  get currentUser() {
    return this.authService.currentUser();
  }

  get userRole(): string {
    return this.currentUser?.role || '';
  }

  get isAdmin(): boolean {
    return this.userRole === 'Administrador';
  }

  get isCoordenador(): boolean {
    return ['Coordenador de Grupo', 'Coordenador Geral', 'Administrador'].includes(this.userRole);
  }

  get isCoordenadorGeral(): boolean {
    return ['Coordenador Geral', 'Administrador'].includes(this.userRole);
  }

  hasAccess(item: MenuItem): boolean {
    if (!item.roles) return true;
    return item.roles.includes(this.userRole);
  }

  getNotificationBadge(): number {
    return this.unreadCount();
  }

  onItemClick(item: MenuItem): void {
    this.menuItemClick.emit(item);
    this.close.emit();
  }

  onClose(): void {
    this.close.emit();
  }

  logout(): void {
    this.authService.logout();
  }
}
