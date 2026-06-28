import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

export interface PickStatusData {
  title: string;
  label?: string;
  current?: string | null;
  options: readonly string[];
  confirmLabel?: string;
}

/** Generic single-status picker. Closes with the chosen status string, or undefined. */
@Component({
  selector: 'ctms-pick-status-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule, MatSelectModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" style="width:100%">
        <mat-label>{{ data.label ?? 'Status' }}</mat-label>
        <mat-select [value]="choice()" (selectionChange)="choice.set($event.value)">
          @for (o of data.options; track o) { <mat-option [value]="o">{{ o }}</mat-option> }
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="undefined">Cancel</button>
      <button mat-flat-button [disabled]="!choice()" [mat-dialog-close]="choice()">
        {{ data.confirmLabel ?? 'Update' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class PickStatusDialogComponent {
  readonly data = inject<PickStatusData>(MAT_DIALOG_DATA);
  readonly choice = signal<string | null>(this.data.current ?? null);
}
