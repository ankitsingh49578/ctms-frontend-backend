import { ChangeDetectionStrategy, Component, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { ConsentService } from '../services/consents.service';
import { PatientService } from '../services/patients.service';
import { UiService } from '../../../core/services/ui.service';
import { PatientResponse, TrialResponse } from '../../../core/models/domain.models';
import { CONSENT_STATUSES } from '../../../core/models/enums';
import { toIsoDate } from '../clinical.util';

interface ConsentDialogData { trial: TrialResponse; }

@Component({
  selector: 'ctms-consent-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule, MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>New consent record</h2>
    <mat-dialog-content>
      <p class="muted" style="margin:0 0 12px">{{ data.trial.trialCode }} — {{ data.trial.trialName }}</p>
      <form [formGroup]="form" class="form-grid" style="padding-top:4px">
        <mat-form-field appearance="outline" class="field-full">
          <mat-label>Patient</mat-label>
          <mat-select formControlName="patientId">
            @for (p of patients(); track p.patientId) {
              <mat-option [value]="p.patientId">{{ p.patientCode }} — {{ p.fullName }}</mat-option>
            }
          </mat-select>
          @if (form.controls.patientId.hasError('required')) { <mat-error>Required</mat-error> }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Consent version</mat-label>
          <input matInput formControlName="consentVersion" placeholder="e.g. v1.0" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Consent date</mat-label>
          <input matInput [matDatepicker]="dp" formControlName="consentDate" />
          <mat-datepicker-toggle matIconSuffix [for]="dp" />
          <mat-datepicker #dp />
          @if (form.controls.consentDate.hasError('required')) { <mat-error>Required</mat-error> }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Initial status</mat-label>
          <mat-select formControlName="consentStatus">
            @for (s of statuses; track s) { <mat-option [value]="s">{{ s }}</mat-option> }
          </mat-select>
        </mat-form-field>
        
        <div class="field-full file-upload-zone" [class.has-file]="selectedFile()" (click)="fileInput.click()">
          <input type="file" #fileInput (change)="onFileSelected($event)" accept="application/pdf" hidden />
          @if (selectedFile()) {
            <mat-icon color="primary">picture_as_pdf</mat-icon>
            <div class="file-info">
              <span class="file-name">{{ selectedFile()?.name }}</span>
              <span class="file-size">{{ formatSize(selectedFile()?.size) }}</span>
            </div>
            <button mat-icon-button (click)="clearFile($event)" matTooltip="Remove file">
              <mat-icon>close</mat-icon>
            </button>
          } @else {
            <mat-icon class="upload-icon">upload_file</mat-icon>
            <div class="upload-text">
              <span class="primary-text">Click to upload consent PDF</span>
              <span class="secondary-text">PDF format only, maximum size 1MB</span>
            </div>
          }
        </div>
        @if (fileError()) {
          <div class="field-full error-text" style="color:#f44336; font-size: 12px; margin-top: -12px;">{{ fileError() }}</div>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="undefined" [disabled]="saving()">Cancel</button>
      <button mat-flat-button (click)="save()" [disabled]="form.invalid || !selectedFile() || saving()">
        @if (saving()) { <mat-spinner diameter="18" /> } @else { Create }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .file-upload-zone {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 24px 16px;
      text-align: center;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background-color: #fafafa;
      transition: all 0.2s ease;
      margin-bottom: 16px;
    }
    .file-upload-zone:hover {
      border-color: var(--primary);
      background-color: #f0f7ff;
    }
    .file-upload-zone.has-file {
      flex-direction: row;
      padding: 12px 16px;
      border-style: solid;
      border-color: #e0e0e0;
      background-color: #fff;
    }
    .upload-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #999;
    }
    .upload-text {
      display: flex;
      flex-direction: column;
    }
    .primary-text {
      font-weight: 500;
      color: #333;
    }
    .secondary-text {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }
    .file-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      flex: 1;
      margin-left: 12px;
    }
    .file-name {
      font-weight: 500;
      font-size: 14px;
      color: #333;
    }
    .file-size {
      font-size: 12px;
      color: #666;
    }
  `]
})
export class ConsentFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly consents = inject(ConsentService);
  private readonly patientSvc = inject(PatientService);
  private readonly ui = inject(UiService);
  private readonly ref = inject(MatDialogRef<ConsentFormDialogComponent>);
  readonly data = inject<ConsentDialogData>(MAT_DIALOG_DATA);

  readonly statuses = CONSENT_STATUSES;
  readonly saving = signal(false);
  readonly patients = signal<PatientResponse[]>([]);
  
  readonly selectedFile = signal<File | null>(null);
  readonly fileError = signal<string | null>(null);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  readonly form = this.fb.group({
    patientId: this.fb.control<number | null>(null, [Validators.required]),
    consentVersion: this.fb.control(''),
    consentDate: this.fb.control<Date | null>(null, [Validators.required]),
    consentStatus: this.fb.control('Pending'),
  });

  constructor() {
    this.patientSvc.list({ page: 0, size: 200, sort: 'patientId,desc' }).subscribe({
      next: (p) => this.patients.set(p.content),
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.fileError.set(null);
      
      if (file.type !== 'application/pdf') {
        this.ui.error('Only PDF files are allowed.');
        this.selectedFile.set(null);
        return;
      }
      
      if (file.size > 1 * 1024 * 1024) { // 1MB
        this.ui.error('Maximum file size is 1 MB.');
        this.selectedFile.set(null);
        return;
      }
      
      this.selectedFile.set(file);
    }
  }

  clearFile(event: Event): void {
    event.stopPropagation();
    this.selectedFile.set(null);
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
    this.fileError.set(null);
  }

  formatSize(bytes?: number): string {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return mb.toFixed(2) + ' MB';
    return (bytes / 1024).toFixed(0) + ' KB';
  }

  save(): void {
    if (this.form.invalid || !this.selectedFile()) return;
    this.saving.set(true);
    const v = this.form.getRawValue();
    this.consents.create({
      trialId: this.data.trial.trialId,
      patientId: v.patientId!,
      consentVersion: v.consentVersion || undefined,
      consentDate: toIsoDate(v.consentDate),
      consentStatus: v.consentStatus || undefined,
    }, this.selectedFile()!).subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.ui.success('Consent record created.');
        this.ref.close(saved);
      },
      error: () => this.saving.set(false),
    });
  }
}
