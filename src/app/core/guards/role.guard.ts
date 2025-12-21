import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function roleGuard(allowedRoles: number[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const user = authService.currentUserValue;

    if (!user || !user.role) {
      router.navigate(['/login']);
      return false;
    }

    if (allowedRoles.includes(user.role.type)) {
      return true;
    }

    router.navigate(['/dashboard']);
    return false;
  };
}
