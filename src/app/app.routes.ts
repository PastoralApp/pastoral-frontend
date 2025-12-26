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
      {
        path: 'google-complete',
        loadComponent: () => import('./features/auth/google-callback/google-callback.component').then(m => m.GoogleCallbackComponent)
      },
      {
        path: 'google-success',
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
        path: 'post/:id',
        loadComponent: () => import('./features/feed/post-detail/post-detail.component').then(m => m.PostDetailComponent)
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
        path: 'grupos',
        loadComponent: () => import('./features/grupos/grupos-list.component').then(m => m.GruposListComponent)
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
        path: 'enviar-notificacao',
        loadComponent: () => import('./features/enviar-notificacao/enviar-notificacao.component').then(m => m.EnviarNotificacaoComponent)
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
        data: { roles: ['Administrador', 'Coordenador Geral'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent)
          },
          {
            path: 'users',
            loadComponent: () => import('./features/admin/pages/users/users-list.component').then(m => m.UsersListComponent)
          },
          {
            path: 'users/create',
            loadComponent: () => import('./features/admin/pages/users/user-form.component').then(m => m.UserFormComponent)
          },
          {
            path: 'users/edit/:id',
            loadComponent: () => import('./features/admin/pages/users/user-form.component').then(m => m.UserFormComponent)
          },
          {
            path: 'pastorais',
            loadComponent: () => import('./features/admin/pages/pastorais/pastorais-list.component').then(m => m.PastoraisListComponent)
          },
          {
            path: 'pastorais/create',
            loadComponent: () => import('./features/admin/pages/pastorais/pastoral-form.component').then(m => m.PastoralFormComponent)
          },
          {
            path: 'pastorais/edit/:id',
            loadComponent: () => import('./features/admin/pages/pastorais/pastoral-form.component').then(m => m.PastoralFormComponent)
          },
          {
            path: 'grupos',
            loadComponent: () => import('./features/admin/pages/grupos/grupos-list.component').then(m => m.GruposListComponent)
          },
          {
            path: 'grupos/create',
            loadComponent: () => import('./features/admin/pages/grupos/grupo-form.component').then(m => m.GrupoFormComponent)
          },
          {
            path: 'grupos/edit/:id',
            loadComponent: () => import('./features/admin/pages/grupos/grupo-form.component').then(m => m.GrupoFormComponent)
          },
          {
            path: 'igrejas',
            canActivate: [roleGuard],
            data: { roles: ['Administrador', 'Coordenador Geral'] },
            loadComponent: () => import('./features/admin/pages/igrejas/igrejas-list.component').then(m => m.IgrejasListComponent)
          },
          {
            path: 'igrejas/create',
            canActivate: [roleGuard],
            data: { roles: ['Administrador', 'Coordenador Geral'] },
            loadComponent: () => import('./features/admin/pages/igrejas/igreja-form.component').then(m => m.IgrejaFormComponent)
          },
          {
            path: 'igrejas/edit/:id',
            canActivate: [roleGuard],
            data: { roles: ['Administrador', 'Coordenador Geral'] },
            loadComponent: () => import('./features/admin/pages/igrejas/igreja-form.component').then(m => m.IgrejaFormComponent)
          },
          {
            path: 'horarios',
            canActivate: [roleGuard],
            data: { roles: ['Administrador', 'Coordenador Geral'] },
            loadComponent: () => import('./features/admin/pages/horarios/horarios-list.component').then(m => m.HorariosListComponent)
          },
          {
            path: 'horarios/create',
            canActivate: [roleGuard],
            data: { roles: ['Administrador', 'Coordenador Geral'] },
            loadComponent: () => import('./features/admin/pages/horarios/horario-form.component').then(m => m.HorarioFormComponent)
          },
          {
            path: 'horarios/edit/:id',
            canActivate: [roleGuard],
            data: { roles: ['Administrador', 'Coordenador Geral'] },
            loadComponent: () => import('./features/admin/pages/horarios/horario-form.component').then(m => m.HorarioFormComponent)
          },
          {
            path: 'notificacoes',
            loadComponent: () => import('./features/admin/pages/notificacoes/notificacoes-list.component').then(m => m.NotificacoesListComponent)
          },
          {
            path: 'notificacoes/create',
            loadComponent: () => import('./features/admin/pages/notificacoes/notificacao-form.component').then(m => m.NotificacaoFormComponent)
          },
          {
            path: 'notificacoes/edit/:id',
            loadComponent: () => import('./features/admin/pages/notificacoes/notificacao-form.component').then(m => m.NotificacaoFormComponent)
          },
          {
            path: 'roles',
            loadComponent: () => import('./features/admin/pages/roles/roles-list.component').then(m => m.RolesListComponent)
          },
          {
            path: 'roles/create',
            loadComponent: () => import('./features/admin/pages/roles/role-form.component').then(m => m.RoleFormComponent)
          },
          {
            path: 'roles/edit/:id',
            loadComponent: () => import('./features/admin/pages/roles/role-form.component').then(m => m.RoleFormComponent)
          },
          {
            path: 'posts',
            loadComponent: () => import('./features/admin/pages/posts/admin-posts.component').then(m => m.AdminPostsComponent)
          },
          {
            path: 'tags',
            canActivate: [roleGuard],
            data: { roles: ['Administrador', 'Coordenador Geral'] },
            loadComponent: () => import('./features/admin/pages/tags/admin-tags.component').then(m => m.AdminTagsComponent)
          },
          {
            path: 'eventos',
            canActivate: [roleGuard],
            data: { roles: ['Administrador', 'Coordenador Geral'] },
            loadComponent: () => import('./features/admin/pages/eventos/admin-eventos.component').then(m => m.AdminEventosComponent)
          },
          {
            path: 'eventos/create',
            canActivate: [roleGuard],
            data: { roles: ['Administrador', 'Coordenador Geral'] },
            loadComponent: () => import('./features/admin/pages/eventos/admin-evento-form.component').then(m => m.AdminEventoFormComponent)
          },
          {
            path: 'eventos/edit/:id',
            canActivate: [roleGuard],
            data: { roles: ['Administrador', 'Coordenador Geral'] },
            loadComponent: () => import('./features/admin/pages/eventos/admin-evento-form.component').then(m => m.AdminEventoFormComponent)
          },
          {
            path: 'coordenacao',
            loadComponent: () => import('./features/admin/pages/coordenacao/coordenacao-list.component').then(m => m.CoordenacaoListComponent)
          },
          {
            path: 'coordenacao/create',
            loadComponent: () => import('./features/admin/pages/coordenacao/coordenacao-form.component').then(m => m.CoordenacaoFormComponent)
          },
          {
            path: 'coordenacao/edit/:id',
            loadComponent: () => import('./features/admin/pages/coordenacao/coordenacao-form.component').then(m => m.CoordenacaoFormComponent)
          }
        ]
      },
      {
        path: 'coord-grupo',
        canActivate: [roleGuard],
        data: { roles: ['Coordenador de Grupo', 'Coordenador Geral', 'Administrador'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/coord-grupo/coordenacao.component').then(m => m.CoordenacaoComponent)
          },
          {
            path: 'usuarios',
            canActivate: [roleGuard],
            data: { roles: ['Coordenador de Grupo', 'Administrador'] },
            loadComponent: () => import('./features/coord-grupo/usuarios/usuarios-grupo.component').then(m => m.UsuariosGrupoComponent)
          },
          {
            path: 'tags',
            canActivate: [roleGuard],
            data: { roles: ['Coordenador de Grupo', 'Coordenador Geral', 'Administrador'] },
            loadComponent: () => import('./features/coord-grupo/tags/coordenacao-tags.component').then(m => m.CoordenacaoTagsComponent)
          },
          {
            path: 'eventos',
            loadComponent: () => import('./features/coord-grupo/eventos/coordenacao-eventos.component').then(m => m.CoordenacaoEventosComponent)
          },
          {
            path: 'eventos/create',
            loadComponent: () => import('./features/coord-grupo/eventos/coordenacao-evento-form.component').then(m => m.CoordenacaoEventoFormComponent)
          },
          {
            path: 'eventos/edit/:id',
            loadComponent: () => import('./features/coord-grupo/eventos/coordenacao-evento-form.component').then(m => m.CoordenacaoEventoFormComponent)
          }
        ]
      },
      {
        path: 'coord-geral',
        canActivate: [roleGuard],
        data: { roles: ['Coordenador Geral', 'Administrador'] },
        loadChildren: () => import('./features/coord-geral/coord-geral.routes').then(m => m.coordGeralRoutes)
      },
      { path: '', redirectTo: 'feed', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
