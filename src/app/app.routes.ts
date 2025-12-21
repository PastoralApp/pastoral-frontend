import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  // Auth Routes (Public)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.Register)
  },
  {
    path: 'auth/google-success',
    loadComponent: () => import('./features/auth/google-success/google-success').then(m => m.GoogleSuccess)
  },
  // Dashboard (Protected)
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard]
  },
  // Posts Routes (Protected)
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
  // Eventos Routes (Protected)
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
  // Users Routes (Admin Only)
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
  // Fallback
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
