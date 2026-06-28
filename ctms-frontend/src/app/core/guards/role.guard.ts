import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { RoleKey } from '../constants/roles';

/**
 * Restricts a route to specific roles. Declare allowed roles on the route:
 *   { path: 'admin', canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } }
 * Mirrors the backend @PreAuthorize layer on the client for navigation only;
 * the server remains the source of truth and will still 403 on direct calls.
 */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const allowed = (route.data?.['roles'] as RoleKey[] | undefined) ?? [];
  if (allowed.length === 0 || auth.hasRole(...allowed)) return true;

  return router.createUrlTree(['/forbidden']);
};
