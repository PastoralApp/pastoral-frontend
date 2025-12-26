import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const coordGeralRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./coord-geral-dashboard/coord-geral-dashboard.component').then(
        (m) => m.CoordGeralDashboardComponent
      ),
    canActivate: [authGuard],
    data: { roles: ['Coordenador Geral', 'Administrador'] },
  },
  {
    path: 'usuarios',
    loadComponent: () =>
      import('./usuarios/usuarios-list.component').then(
        (m) => m.UsuariosListComponent
      ),
    canActivate: [authGuard],
    data: { roles: ['Coordenador Geral', 'Administrador'] },
  },
  {
    path: 'pastorais',
    loadComponent: () =>
      import('./pastorais/pastorais-coord.component').then(
        (m) => m.PastoraisCoordComponent
      ),
    canActivate: [authGuard],
    data: { roles: ['Coordenador Geral', 'Administrador'] },
  },
  {
    path: 'grupos',
    loadComponent: () =>
      import('./grupos/grupos-list.component').then(
        (m) => m.GruposListComponent
      ),
    canActivate: [authGuard],
    data: { roles: ['Coordenador Geral', 'Administrador'] },
  },
  {
    path: 'grupos/novo',
    loadComponent: () =>
      import('./grupos/grupo-form.component').then(
        (m) => m.GrupoFormComponent
      ),
    canActivate: [authGuard],
    data: { roles: ['Coordenador Geral', 'Administrador'] },
  },
  {
    path: 'grupos/:id/editar',
    loadComponent: () =>
      import('./grupos/grupo-form.component').then(
        (m) => m.GrupoFormComponent
      ),
    canActivate: [authGuard],
    data: { roles: ['Coordenador Geral', 'Administrador'] },
  },
  {
    path: 'notificacoes',
    loadComponent: () =>
      import('./notificacoes/enviar-notificacao-coord.component').then(
        (m) => m.EnviarNotificacaoCoordComponent
      ),
    canActivate: [authGuard],
    data: { roles: ['Coordenador Geral', 'Administrador'] },
  },
  {
    path: 'posts',
    loadComponent: () =>
      import('./posts/posts-gerenciar.component').then(
        (m) => m.PostsGerenciarComponent
      ),
    canActivate: [authGuard],
    data: { roles: ['Coordenador Geral', 'Administrador'] },
  },
  {
    path: 'missas',
    loadComponent: () =>
      import('./missas/missas-crud.component').then(
        (m) => m.MissasCrudComponent
      ),
    canActivate: [authGuard],
    data: { roles: ['Coordenador Geral', 'Administrador'] },
  },
  {
    path: 'igrejas',
    loadComponent: () =>
      import('./igrejas/igrejas-crud.component').then(
        (m) => m.IgrejasCrudComponent
      ),
    canActivate: [authGuard],
    data: { roles: ['Coordenador Geral', 'Administrador'] },
  },
  {
    path: 'eventos',
    loadComponent: () =>
      import('./eventos/eventos-crud.component').then(
        (m) => m.EventosCrudComponent
      ),
    canActivate: [authGuard],
    data: { roles: ['Coordenador Geral', 'Administrador'] },
  },
  {
    path: 'tags',
    loadComponent: () =>
      import('./tags/tags-crud.component').then(
        (m) => m.TagsCrudComponent
      ),
    canActivate: [authGuard],
    data: { roles: ['Coordenador Geral', 'Administrador'] },
  },
];
