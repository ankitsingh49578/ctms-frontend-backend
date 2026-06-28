import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="center-screen">
      <div class="card err">
        <mat-icon class="err__icon">explore_off</mat-icon>
        <h1 class="err__code">404</h1>
        <p class="err__title">Page not found</p>
        <p class="muted">The page you're looking for doesn't exist or has moved.</p>
        <button mat-flat-button color="primary" (click)="goHome()">
          <mat-icon>home</mat-icon> Back to safety
        </button>
      </div>
    </div>
  `,
  styles: [`
    .err { max-width: 440px; text-align: center; display: grid; gap: 8px; justify-items: center; padding: 36px; }
    .err__icon { font-size: 52px; width: 52px; height: 52px; color: var(--ctms-ink-soft); }
    .err__code { margin: 4px 0 0; font-size: 2.4rem; }
    .err__title { margin: 0; font-weight: 600; }
    button { margin-top: 12px; }
  `],
})
export class NotFoundComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  goHome(): void {
    this.router.navigateByUrl(this.auth.isAuthenticated() ? this.auth.landingRoute() : '/login');
  }
}
