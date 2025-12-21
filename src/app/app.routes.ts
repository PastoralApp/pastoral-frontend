import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register').then(m => m.Register)
      },
      {
        path: 'google-success',
        loadComponent: () => import('./features/auth/google-success/google-success').then(m => m.GoogleSuccess)
      }
    ]
  },
  {
    path: 'login',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'register',
    redirectTo: '/auth/register',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard([3])],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/admin-users/admin-users').then(m => m.AdminUsers)
      },
      {
        path: 'posts',
        loadComponent: () => import('./features/admin/admin-posts/admin-posts').then(m => m.AdminPosts)
      },
      {
        path: 'eventos',
        loadComponent: () => import('./features/admin/admin-eventos/admin-eventos').then(m => m.AdminEventos)
      },
      {
        path: 'pastorais',
        loadComponent: () => import('./features/admin/admin-pastorais/admin-pastorais').then(m => m.AdminPastorais)
      }
    ]
  },
  {
    path: 'coordenacao',
    canActivate: [authGuard, roleGuard([2, 3])],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/coordenacao/coordenacao-dashboard/coordenacao-dashboard').then(m => m.CoordenacaoDashboard)
      },
      {
        path: 'grupos',
        loadComponent: () => import('./features/coordenacao/coordenacao-grupos/coordenacao-grupos').then(m => m.CoordenacaoGrupos)
      },
      {
        path: 'membros',
        loadComponent: () => import('./features/coordenacao/coordenacao-membros/coordenacao-membros').then(m => m.CoordenacaoMembros)
      }
    ]
  },
  {
    path: 'feed',
    loadComponent: () => import('./features/feed/feed.component').then(m => m.FeedComponent),
    canActivate: [authGuard]
  },
  {
    path: 'salvados',
    loadComponent: () => import('./features/salvados/salvados.component').then(m => m.SalvadosComponent),
    canActivate: [authGuard]
  },
  {
    path: 'notificacoes',
    loadComponent: () => import('./features/notificacoes/notificacoes.component').then(m => m.NotificacoesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'pastorais',
    loadComponent: () => import('./features/pastorais/pastorais-gallery.component').then(m => m.PastoraisGalleryComponent),
    canActivate: [authGuard]
  },
  {
    path: 'posts',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/posts/post-list/post-list').then(m => m.PostList)
      },
      {
        path: 'create',
        loadComponent: () => import('./features/posts/post-create/post-create').then(m => m.PostCreate),
        canActivate: [roleGuard([1, 2, 3])]
      },
      {
        path: ':id',
        loadComponent: () => import('./features/posts/post-detail/post-detail').then(m => m.PostDetail)
      }
    ]
  },
  {
    path: 'eventos',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/eventos/evento-list/evento-list').then(m => m.EventoList)
      },
      {
        path: 'create',
        loadComponent: () => import('./features/eventos/evento-create/evento-create').then(m => m.EventoCreate),
        canActivate: [roleGuard([1, 2, 3])]
      },
      {
        path: ':id',
        loadComponent: () => import('./features/eventos/evento-detail/evento-detail').then(m => m.EventoDetail)
      }
    ]
  },
  {
    path: 'users',
    canActivate: [authGuard, roleGuard([2, 3])],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/users/user-list/user-list').then(m => m.UserList)
      },
      {
        path: 'new',
        loadComponent: () => import('./features/users/user-form/user-form').then(m => m.UserForm)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/users/user-form/user-form').then(m => m.UserForm)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
