import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [noAuthGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'google-callback',
        loadComponent: () => import('./features/auth/google-callback/google-callback.component').then(m => m.GoogleCallbackComponent)
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: 'feed',
        loadComponent: () => import('./features/feed/feed.component').then(m => m.FeedComponent)
      },
      {
        path: 'eventos',
        loadComponent: () => import('./features/eventos/eventos.component').then(m => m.EventosComponent)
      },
      {
        path: 'eventos/novo',
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'Coordenador Geral', 'Coordenador de Grupo'] },
        loadComponent: () => import('./features/eventos/evento-form/evento-form.component').then(m => m.EventoFormComponent)
      },
      {
        path: 'eventos/:id',
        loadComponent: () => import('./features/eventos/evento-detail/evento-detail.component').then(m => m.EventoDetailComponent)
      },
      {
        path: 'eventos/:id/editar',
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'Coordenador Geral', 'Coordenador de Grupo'] },
        loadComponent: () => import('./features/eventos/evento-form/evento-form.component').then(m => m.EventoFormComponent)
      },
      {
        path: 'pastorais',
        loadComponent: () => import('./features/pastorais/pastorais.component').then(m => m.PastoraisComponent)
      },
      {
        path: 'pastorais/:id',
        loadComponent: () => import('./features/pastorais/pastoral-detail/pastoral-detail.component').then(m => m.PastoralDetailComponent)
      },
      {
        path: 'grupos/:id',
        loadComponent: () => import('./features/grupos/grupo-detail.component').then(m => m.GrupoDetailComponent)
      },
      {
        path: 'notificacoes',
        loadComponent: () => import('./features/notificacoes/notificacoes.component').then(m => m.NotificacoesComponent)
      },
      {
        path: 'salvos',
        loadComponent: () => import('./features/salvos/salvos.component').then(m => m.SalvosComponent)
      },
      {
        path: 'meus-posts',
        loadComponent: () => import('./features/meus-posts/meus-posts.component').then(m => m.MeusPostsComponent)
      },
      {
        path: 'igrejas',
        loadComponent: () => import('./features/igrejas/igrejas.component').then(m => m.IgrejasComponent)
      },
      {
        path: 'igrejas/:id',
        loadComponent: () => import('./features/igrejas/igreja-detail/igreja-detail.component').then(m => m.IgrejaDetailComponent)
      },
      {
        path: 'horarios-missa',
        loadComponent: () => import('./features/horarios-missa/horarios-missa.component').then(m => m.HorariosMissaComponent)
      },
      {
        path: 'usuarios/:id',
        loadComponent: () => import('./features/users/user-profile.component').then(m => m.UserProfileComponent)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'configuracoes',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { roles: ['Administrador'] },
        loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent)
      },
      {
        path: 'coordenacao',
        canActivate: [roleGuard],
        data: { roles: ['Coordenador de Grupo', 'Coordenador Geral', 'Administrador'] },
        loadComponent: () => import('./features/coordenacao/coordenacao.component').then(m => m.CoordenacaoComponent)
      },
      { path: '', redirectTo: 'feed', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
