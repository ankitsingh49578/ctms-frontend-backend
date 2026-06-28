import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UiService } from '../services/ui.service';

/**
 * Centralized API error handling. Reads the backend's ApiResponse error
 * envelope ({ success:false, message, errors[] }), shows a toast, and reacts to
 * auth failures:
 *   401  -> clear the (now invalid/expired) session and send the user to login
 *   403  -> route to the Forbidden page (authenticated but lacks the role)
 * The error is rethrown so components can still handle it locally if needed.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const ui = inject(UiService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const isLogin = req.url.includes('/api/auth/login');

      if (err.status === 0) {
        ui.error('Cannot reach the server. Check that the backend is running.');
        return throwError(() => err);
      }

      if (err.status === 401 && !isLogin) {
        auth.clear();
        ui.error('Your session has expired or is invalid. Please sign in again.');
        router.navigate(['/login']);
        return throwError(() => err);
      }

      if (err.status === 403) {
        ui.error('You do not have permission to perform that action.');
        return throwError(() => err);
      }

      // Surface the backend's own message where available.
      ui.error(extractMessage(err));
      return throwError(() => err);
    }),
  );
};

function extractMessage(err: HttpErrorResponse): string {
  const body = err.error as { message?: string; errors?: string[] } | string | null;
  if (typeof body === 'string' && body.trim()) return body;
  if (body && typeof body === 'object') {
    const detail = Array.isArray(body.errors) && body.errors.length ? `: ${body.errors.join(', ')}` : '';
    if (body.message) return body.message + detail;
  }
  return `Request failed (${err.status}). Please try again.`;
}
