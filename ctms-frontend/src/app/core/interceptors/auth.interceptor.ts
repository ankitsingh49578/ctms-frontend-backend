import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ENDPOINTS } from '../constants/api-endpoints';

/**
 * Attaches the opaque session token as `Authorization: Bearer <token>` to every
 * outgoing API request. The public login endpoint is skipped (it issues the
 * token and needs no auth).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();

  if (!token || req.url.endsWith(ENDPOINTS.auth.login)) {
    return next(req);
  }

  return next(
    req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }),
  );
};
