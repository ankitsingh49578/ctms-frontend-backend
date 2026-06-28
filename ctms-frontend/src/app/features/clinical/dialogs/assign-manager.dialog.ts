import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { TrialService } from '../services/trials.service';
import { UiService } from '../../../core/services/ui.service';
import { TrialAssignmentResponse, TrialResponse } from '../../../core/models/domain.models';
import { ASSIGNMENT_ROLES, statusTone } from '../../../core/models/enums';

interface AssignDialogData { trial: TrialResponse; canAssign: boolean; }

@Component({
  selector: 'ctms-assign-manager-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatProgressSpinnerModule, MatIconModule, MatDividerModule,
  ],
  template: `
    <h2 mat-dialog-title>Team & assignments</h2>
    <mat-dialog-content>
      <p class="muted" style="margin:0 0 14px">{{ data.trial.trialName }} ({{ data.trial.trialCode }})</p>

      @if (loading()) {
        <div class="state" style="padding:24px"><mat-spinner diameter="28" /></div>
      } @else if (rows().length) {
        <div class="table-wrap" style="margin-bottom:6px">
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="text-align:left;color:var(--ctms-ink-soft);font-size:.78rem">
                <th style="padding:6px 8px">Manager #</th><th style="padding:6px 8px">Role</th>
                <th style="padding:6px 8px">Assigned</th><th style="padding:6px 8px">Status</th>
              </tr>
            </thead>
            <tbody>
              @for (a of rows(); track a.assignmentId) {
                <tr style="border-top:1px solid var(--ctms-border)">
                  <td style="padding:8px">#{{ a.managerId }}</td>
                  <td style="padding:8px">{{ a.role }}</td>
                  <td style="padding:8px">{{ a.assignedDate ? (a.assignedDate | date:'mediumDate') : '—' }}</td>
                  <td style="padding:8px"><span class="chip" [class]="'chip--' + tone(a.status)">{{ a.status }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <p class="muted" style="margin:0 0 8px">No managers are assigned to this trial yet.</p>
      }

      @if (data.canAssign) {
        <mat-divider style="margin:16px 0" />
        <h3 style="margin:0 0 4px;font-size:1rem">Assign a manager</h3>
        <p class="muted" style="margin:0 0 12px;font-size:.78rem">
          The manager directory is restricted to administrators, so assignment is by manager ID.
          (Your own manager ID appears on your profile.)
        </p>
        <form [formGroup]="form" class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>Manager ID</mat-label>
            <input matInput type="number" formControlName="managerId" />
            @if (form.controls.managerId.hasError('required')) { <mat-error>Required</mat-error> }
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Assignment role</mat-label>
            <mat-select formControlName="role">
              @for (r of roles; track r) { <mat-option [value]="r">{{ r }}</mat-option> }
            </mat-select>
          </mat-form-field>
        </form>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close [disabled]="assigning()">Close</button>
      @if (data.canAssign) {
        <button mat-flat-button (click)="assign()" [disabled]="form.invalid || assigning()">
          @if (assigning()) { <mat-spinner diameter="18" /> } @else { Assign }
        </button>
      }
    </mat-dialog-actions>
  `,
})
export class AssignManagerDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly trials = inject(TrialService);
  private readonly ui = inject(UiService);
  readonly data = inject<AssignDialogData>(MAT_DIALOG_DATA);

  readonly roles = ASSIGNMENT_ROLES;
  readonly tone = statusTone;
  readonly loading = signal(true);
  readonly assigning = signal(false);
  readonly rows = signal<TrialAssignmentResponse[]>([]);

  readonly form = this.fb.group({
    managerId: this.fb.control<number | null>(null, [Validators.required]),
    role: this.fb.control('Manager', [Validators.required]),
  });

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.trials.assignments(this.data.trial.trialId).subscribe({
      next: (list) => { this.rows.set(list); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  assign(): void {
    if (this.form.invalid) return;
    this.assigning.set(true);
    const v = this.form.getRawValue();
    this.trials.assignManager(this.data.trial.trialId, { managerId: v.managerId!, role: v.role! }).subscribe({
      next: () => {
        this.assigning.set(false);
        this.ui.success('Manager assigned to trial.');
        this.form.reset({ managerId: null, role: 'Manager' });
        this.refresh();
      },
      error: () => this.assigning.set(false),
    });
  }
}
