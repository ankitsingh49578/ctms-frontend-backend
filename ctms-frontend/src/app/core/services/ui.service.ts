import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/** Centralized toast notifications (Material snackbar) with consistent styling. */
@Injectable({ providedIn: 'root' })
export class UiService {
  private readonly snack = inject(MatSnackBar);

  success(message: string): void {
    this.open(message, 'ctms-snack--success');
  }

  error(message: string): void {
    this.open(message, 'ctms-snack--error', 6000);
  }

  info(message: string): void {
    this.open(message, 'ctms-snack--info');
  }

  private open(message: string, panelClass: string, duration = 3500): void {
    this.snack.open(message, 'Dismiss', {
      duration,
      panelClass,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
