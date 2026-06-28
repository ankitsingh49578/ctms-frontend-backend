import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { ENDPOINTS } from '../constants/api-endpoints';
import { RoleKey, defaultRouteForRole, roleKeyFromName } from '../constants/roles';
import { AuthResponse, LoginRequest, UserResponse } from '../models/auth.models';

const TOKEN_KEY = 'ctms.token';
const USER_KEY = 'ctms.user';

/**
 * Authentication state for the opaque session-token model.
 *
 * IMPORTANT: the backend issues an OPAQUE session token (looked up server-side
 * in `user_sessions`), not a JWT. There is therefore no client-side expiry to
 * read and no refresh endpoint: a token is valid until the server expires the
 * session or /api/auth/logout invalidates it. We persist the token in
 * sessionStorage (cleared when the tab closes) and attach it as
 * `Authorization: Bearer <token>` via authInterceptor.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  private readonly _token = signal<string | null>(sessionStorage.getItem(TOKEN_KEY));
  private readonly _user = signal<AuthResponse | null>(this.readUser());

  /** Reactive identity for templates/guards. */
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());
  readonly roleKey = computed<RoleKey | null>(() => roleKeyFromName(this._user()?.role));

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>(ENDPOINTS.auth.login, credentials).pipe(
      tap((auth) => this.persist(auth)),
    );
  }

  /** Best-effort server logout, then always clear local state and redirect. */
  logout(redirect = true): void {
    const finish = () => {
      this.clear();
      if (redirect) this.router.navigate(['/login']);
    };
    if (this._token()) {
      this.api.post(ENDPOINTS.auth.logout).subscribe({ next: finish, error: finish });
    } else {
      finish();
    }
  }

  /** Refreshes the cached identity from GET /api/auth/me. */
  refreshMe(): Observable<UserResponse> {
    return this.api.get<UserResponse>(ENDPOINTS.auth.me);
  }

  token(): string | null {
    return this._token();
  }

  hasRole(...roles: RoleKey[]): boolean {
    const key = this.roleKey();
    return !!key && roles.includes(key);
  }

  landingRoute(): string {
    return defaultRouteForRole(this.roleKey());
  }

  /** Clears local auth state without a server call (used by the 401 handler). */
  clear(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._user.set(null);
  }

  private persist(auth: AuthResponse): void {
    sessionStorage.setItem(TOKEN_KEY, auth.token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(auth));
    this._token.set(auth.token);
    this._user.set(auth);
  }

  private readUser(): AuthResponse | null {
    const raw = sessionStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthResponse;
    } catch {
      return null;
    }
  }
}
