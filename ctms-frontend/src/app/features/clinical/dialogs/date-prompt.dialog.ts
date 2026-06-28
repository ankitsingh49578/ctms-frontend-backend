import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { toIsoDate } from '../clinical.util';

export interface DatePromptData {
  title: string;
  label: string;
  message?: string;
  required?: boolean;
  initial?: Date;
  confirmLabel?: string;
}

/** Asks for a single date. Closes with an ISO date string, or undefined if cancelled. */
@Component({
  selector: 'ctms-date-prompt-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatDatepickerModule, MatNativeDateModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      @if (data.message) { <p class="muted" style="margin:0 0 12px">{{ data.message }}</p> }
      <mat-form-field appearance="outline" style="width:100%">
        <mat-label>{{ data.label }}</mat-label>
        <input matInput [matDatepicker]="dp" [value]="value()" (dateChange)="value.set($event.value)" />
        <mat-datepicker-toggle matIconSuffix [for]="dp" />
        <mat-datepicker #dp />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="undefined">Cancel</button>
      <button mat-flat-button [disabled]="data.required && !value()" [mat-dialog-close]="result()">
        {{ data.confirmLabel ?? 'Confirm' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class DatePromptDialogComponent {
  readonly data = inject<DatePromptData>(MAT_DIALOG_DATA);
  readonly value = signal<Date | null>(this.data.initial ?? null);
  result(): string | null { return toIsoDate(this.value()) ?? null; }
}
