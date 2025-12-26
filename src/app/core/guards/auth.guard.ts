import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getToken()) {
    return true;
  }

  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedPaths = ['/auth/google-callback', '/auth/google-complete', '/auth/google-success'];
  if (allowedPaths.some(path => state.url.startsWith(path))) {
    return true;
  }

  if (!authService.getToken()) {
    return true;
  }

  router.navigate(['/feed']);
  return false;
};
