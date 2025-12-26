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
    { id: 'igrejas', label: 'Igrejas', icon: 'assets/logosemfundo.png', route: '/igrejas' },
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
    { id: 'coord-grupos', label: 'Meus Grupos', icon: 'group_work', route: '/coord-grupo', roles: ['Coordenador de Grupo', 'Coordenador Geral', 'Administrador'] },
    { id: 'coord-usuarios', label: 'Usuários do Grupo', icon: 'people', route: '/coord-grupo/usuarios', roles: ['Coordenador de Grupo'] },
    { id: 'coord-eventos', label: 'Gerenciar Eventos', icon: 'event_note', route: '/coord-grupo/eventos', roles: ['Coordenador de Grupo', 'Coordenador Geral', 'Administrador'] },
    { id: 'coord-tags', label: 'Gerenciar Tags', icon: 'label', route: '/coord-grupo/tags', roles: ['Coordenador de Grupo', 'Coordenador Geral', 'Administrador'] },
  ];

  coordGeralMenuItems: MenuItem[] = [
    { id: 'coord-geral-dashboard', label: 'Painel Coordenador', icon: 'dashboard', route: '/coord-geral', roles: ['Coordenador Geral', 'Administrador'] },
    { id: 'coord-geral-usuarios', label: 'Usuários', icon: 'people', route: '/coord-geral/usuarios', roles: ['Coordenador Geral', 'Administrador'] },
    { id: 'coord-geral-pastorais', label: 'Cores Pastorais', icon: 'palette', route: '/coord-geral/pastorais', roles: ['Coordenador Geral', 'Administrador'] },
    { id: 'coord-geral-grupos', label: 'Grupos', icon: 'group_work', route: '/coord-geral/grupos', roles: ['Coordenador Geral', 'Administrador'] },
    { id: 'coord-geral-notif', label: 'Enviar Notificação', icon: 'send', route: '/coord-geral/notificacoes', roles: ['Coordenador Geral', 'Administrador'] },
    { id: 'coord-geral-posts', label: 'Gerenciar Posts', icon: 'article', route: '/coord-geral/posts', roles: ['Coordenador Geral', 'Administrador'] },
    { id: 'coord-geral-igrejas', label: 'Igrejas', icon: 'church', route: '/admin/igrejas', roles: ['Coordenador Geral', 'Administrador'] },
    { id: 'coord-geral-horarios', label: 'Horários Missas', icon: 'schedule', route: '/admin/horarios', roles: ['Coordenador Geral', 'Administrador'] },
    { id: 'coord-geral-eventos', label: 'Eventos', icon: 'event', route: '/admin/eventos', roles: ['Coordenador Geral', 'Administrador'] },
    { id: 'coord-geral-tags', label: 'Tags', icon: 'label', route: '/admin/tags', roles: ['Coordenador Geral', 'Administrador'] },
  ];

  adminMenuItems: MenuItem[] = [
    { id: 'admin-dashboard', label: 'Painel Admin', icon: 'admin_panel_settings', route: '/admin', roles: ['Administrador'] },
    { id: 'admin-users', label: 'Usuários', icon: 'manage_accounts', route: '/admin/usuarios', roles: ['Administrador'] },
    { id: 'admin-coordenacao', label: 'Coordenação', icon: 'supervisor_account', route: '/admin/coord-grupo', roles: ['Administrador'] },
    { id: 'admin-pastorais', label: 'Pastorais', icon: 'assets/logosemfundo.png', route: '/admin/pastorais', roles: ['Administrador'] },
    { id: 'admin-grupos', label: 'Grupos', icon: 'group_work', route: '/admin/grupos', roles: ['Administrador'] },
    { id: 'admin-eventos', label: 'Eventos', icon: 'event', route: '/admin/eventos', roles: ['Administrador'] },
    { id: 'admin-posts', label: 'Posts', icon: 'article', route: '/admin/posts', roles: ['Administrador'] },
    { id: 'admin-notificacoes', label: 'Notificações', icon: 'notifications', route: '/admin/notificacoes', roles: ['Administrador'] },
    { id: 'admin-roles', label: 'Roles', icon: 'security', route: '/admin/roles', roles: ['Administrador'] },
  ];

  ngOnInit(): void {
    this.loadUnreadCount();
    console.log('🔍 Sidebar Debug:');
    console.log('Current User:', this.currentUser);
    console.log('User Role:', this.userRole);
    console.log('Is Admin:', this.isAdmin);
    console.log('Is Coordenador:', this.isCoordenador);
    console.log('Is Coordenador Geral:', this.isCoordenadorGeral);
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
    return this.userRole === 'Coordenador Geral' || this.userRole === 'Administrador';
  }

  hasAccess(item: MenuItem): boolean {
    if (!item.roles) return true;
    return item.roles.includes(this.userRole);
  }

  hasAdminAccess(): boolean {
    return this.adminMenuItems.some(item => this.hasAccess(item));
  }

  getNotificationBadge(): number {
    return this.unreadCount();
  }

  isImageIcon(icon: string): boolean {
    return icon?.includes('assets/') || icon?.endsWith('.png') || icon?.endsWith('.svg') || icon?.endsWith('.jpg');
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
