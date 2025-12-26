import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

interface MenuItem {
  title: string;
  description: string;
  icon: string;
  route: string;
  iconClass: string;
}

@Component({
  selector: 'app-coord-geral-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './coord-geral-dashboard.component.html',
  styleUrl: './coord-geral-dashboard.component.scss'
})
export class CoordGeralDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  userName = signal<string>('');
  isChildRoute = signal(false);
  
  menuItems: MenuItem[] = [
    {
      title: 'Usuários',
      description: 'Visualizar todos os usuários e suas informações',
      icon: 'people',
      route: '/coord-geral/usuarios',
      iconClass: 'usuarios'
    },
    {
      title: 'Pastorais',
      description: 'Editar cores das pastorais',
      icon: 'palette',
      route: '/coord-geral/pastorais',
      iconClass: 'pastorais'
    },
    {
      title: 'Grupos',
      description: 'Gerenciar grupos das pastorais',
      icon: 'group_work',
      route: '/coord-geral/grupos',
      iconClass: 'grupos'
    },
    {
      title: 'Notificações',
      description: 'Enviar notificações para grupos ou usuários',
      icon: 'notifications_active',
      route: '/coord-geral/notificacoes',
      iconClass: 'notificacoes'
    },
    {
      title: 'Posts',
      description: 'Gerenciar e fixar posts',
      icon: 'article',
      route: '/coord-geral/posts',
      iconClass: 'posts'
    },
    {
      title: 'Horários de Missas',
      description: 'Gerenciar horários de missas',
      icon: 'schedule',
      route: '/coord-geral/missas',
      iconClass: 'horarios'
    },
    {
      title: 'Igrejas',
      description: 'Gerenciar igrejas e locais',
      icon: 'church',
      route: '/coord-geral/igrejas',
      iconClass: 'igrejas'
    },
    {
      title: 'Eventos',
      description: 'Gerenciar eventos do sistema',
      icon: 'event',
      route: '/coord-geral/eventos',
      iconClass: 'eventos'
    },
    {
      title: 'Tags',
      description: 'Gerenciar tags para usuários',
      icon: 'label',
      route: '/coord-geral/tags',
      iconClass: 'tags'
    }
  ];

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userName.set(user?.name || 'Coordenador');
    
    this.checkRoute();
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkRoute();
    });
  }

  checkRoute(): void {
    const url = this.router.url;
    this.isChildRoute.set(url !== '/coord-geral' && url.startsWith('/coord-geral/'));
  }
}
