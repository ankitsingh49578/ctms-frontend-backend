import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationAdminService } from '../services/notification-admin.service';
import { UiService } from '../../../core/services/ui.service';

/** Compose and deliver a notification to a user (POST /api/notifications). */
@Component({
  selector: 'ctms-notification-compose-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Send notification</h2>
    <mat-dialog-content>
      <form [formGroup]="form" style="display:grid;gap:4px;padding-top:6px">
        <mat-form-field appearance="outline">
          <mat-label>Recipient user ID</mat-label>
          <input matInput type="number" inputmode="numeric" formControlName="userId" />
          @if (form.controls.userId.hasError('required')) { <mat-error>Required</mat-error> }
          @if (form.controls.userId.hasError('min')) { <mat-error>Must be a valid user ID</mat-error> }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" autocomplete="off" maxlength="150" />
          @if (form.controls.title.hasError('required')) { <mat-error>Required</mat-error> }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Message</mat-label>
          <textarea matInput formControlName="message" rows="3" autocomplete="off"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false" [disabled]="saving()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid || saving()" (click)="save()">
        @if (saving()) { <mat-spinner diameter="18" /> } @else { Send }
      </button>
    </mat-dialog-actions>
  `,
})
export class NotificationComposeDialogComponent {
  private readonly ref = inject(MatDialogRef<NotificationComposeDialogComponent>);
  private readonly notifications = inject(NotificationAdminService);
  private readonly ui = inject(UiService);
  private readonly fb = inject(FormBuilder);

  readonly saving = signal(false);

  readonly form = this.fb.group({
    userId: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    title: this.fb.control('', [Validators.required]),
    message: this.fb.control(''),
  });

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.getRawValue();
    this.notifications
      .send({ userId: Number(v.userId), title: v.title ?? '', message: v.message || undefined })
      .subscribe({
        next: (n) => {
          this.ui.success('Notification sent.');
          this.ref.close(n);
        },
        error: () => this.saving.set(false),
      });
  }
}
