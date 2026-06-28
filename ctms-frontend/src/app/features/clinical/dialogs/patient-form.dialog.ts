import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PatientService } from '../services/patients.service';
import { UiService } from '../../../core/services/ui.service';
import { PatientResponse } from '../../../core/models/domain.models';
import { GENDERS, USER_STATUSES } from '../../../core/models/enums';
import { toIsoDate } from '../clinical.util';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

@Component({
  selector: 'ctms-patient-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ editing ? 'Edit patient' : 'Register patient' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid" style="padding-top:6px">
        <mat-form-field appearance="outline">
          <mat-label>First name</mat-label>
          <input matInput formControlName="firstName" />
          @if (form.controls.firstName.hasError('required')) { <mat-error>Required</mat-error> }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Last name</mat-label>
          <input matInput formControlName="lastName" />
          @if (form.controls.lastName.hasError('required')) { <mat-error>Required</mat-error> }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Date of birth</mat-label>
          <input matInput [matDatepicker]="dp" [max]="today" formControlName="dob" />
          <mat-datepicker-toggle matIconSuffix [for]="dp" />
          <mat-datepicker #dp />
          @if (form.controls.dob.hasError('required')) { <mat-error>Required</mat-error> }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Gender</mat-label>
          <mat-select formControlName="gender">
            @for (g of genders; track g) { <mat-option [value]="g">{{ g }}</mat-option> }
          </mat-select>
          @if (form.controls.gender.hasError('required')) { <mat-error>Required</mat-error> }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Phone</mat-label>
          <input matInput formControlName="phone" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" />
          @if (form.controls.email.hasError('email')) { <mat-error>Invalid email</mat-error> }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Blood group</mat-label>
          <mat-select formControlName="bloodGroup">
            <mat-option [value]="null">—</mat-option>
            @for (b of bloodGroups; track b) { <mat-option [value]="b">{{ b }}</mat-option> }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            @for (s of statuses; track s) { <mat-option [value]="s">{{ s }}</mat-option> }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="field-full">
          <mat-label>Address</mat-label>
          <textarea matInput rows="2" formControlName="address"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="undefined" [disabled]="saving()">Cancel</button>
      <button mat-flat-button (click)="save()" [disabled]="form.invalid || saving()">
        @if (saving()) { <mat-spinner diameter="18" /> } @else { {{ editing ? 'Save' : 'Register' }} }
      </button>
    </mat-dialog-actions>
  `,
})
export class PatientFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly patients = inject(PatientService);
  private readonly ui = inject(UiService);
  private readonly ref = inject(MatDialogRef<PatientFormDialogComponent>);
  readonly existing = inject<PatientResponse | null>(MAT_DIALOG_DATA);

  readonly genders = GENDERS;
  readonly statuses = USER_STATUSES;
  readonly bloodGroups = BLOOD_GROUPS;
  readonly today = new Date();
  readonly editing = !!this.existing;
  readonly saving = signal(false);

  readonly form = this.fb.group({
    firstName: this.fb.control(this.existing?.firstName ?? '', [Validators.required]),
    lastName: this.fb.control(this.existing?.lastName ?? '', [Validators.required]),
    dob: this.fb.control<Date | null>(this.existing?.dob ? new Date(this.existing.dob) : null, [Validators.required]),
    gender: this.fb.control(this.existing?.gender ?? '', [Validators.required]),
    phone: this.fb.control(this.existing?.phone ?? ''),
    email: this.fb.control(this.existing?.email ?? '', [Validators.email]),
    bloodGroup: this.fb.control<string | null>(this.existing?.bloodGroup ?? null),
    status: this.fb.control(this.existing?.status ?? 'Active'),
    address: this.fb.control(this.existing?.address ?? ''),
  });

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.getRawValue();
    const body = {
      firstName: v.firstName!,
      lastName: v.lastName!,
      dob: toIsoDate(v.dob),
      gender: v.gender!,
      phone: v.phone || undefined,
      email: v.email || undefined,
      bloodGroup: v.bloodGroup || undefined,
      status: v.status || undefined,
      address: v.address || undefined,
    };
    const req = this.editing
      ? this.patients.update(this.existing!.patientId, body)
      : this.patients.create({ ...body, dob: toIsoDate(v.dob)! });
    req.subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.ui.success(this.editing ? 'Patient updated.' : 'Patient registered.');
        this.ref.close(saved);
      },
      error: () => this.saving.set(false),
    });
  }
}
