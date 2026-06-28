import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { PatientService } from '../services/patients.service';
import { AuthService } from '../../../core/services/auth.service';
import { UiService } from '../../../core/services/ui.service';
import { Page } from '../../../core/models/api.models';
import { PatientResponse } from '../../../core/models/domain.models';
import { statusTone } from '../../../core/models/enums';
import { capabilitiesFor } from '../clinical.capabilities';
import { PatientFormDialogComponent } from '../dialogs/patient-form.dialog';
import { EnrollmentsDialogComponent } from '../dialogs/enrollments.dialog';

@Component({
  selector: 'ctms-patients-management',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, ReactiveFormsModule, MatTableModule, MatPaginatorModule, MatProgressSpinnerModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatMenuModule,
    RouterLink
  ],
  template: `
    <section class="page">
      <header class="page__head">
        <div>
          <h1 class="page__title">Patients</h1>
          <p class="page__subtitle">Registry of trial participants and their enrollments.</p>
        </div>
      </header>

      <div class="toolbar">
        <mat-form-field appearance="outline" class="grow" subscriptSizing="dynamic">
          <mat-icon matPrefix>search</mat-icon>
          <mat-label>Search patients</mat-label>
          <input matInput [formControl]="search" placeholder="Name or code" />
        </mat-form-field>
        @if (caps().managePatients) {
          <button mat-flat-button (click)="create()"><mat-icon>person_add</mat-icon>Register patient</button>
        }
      </div>

      @if (loading()) {
        <div class="state"><mat-spinner diameter="36" /><p>Loading patients…</p></div>
      } @else if (error()) {
        <div class="state">
          <mat-icon>error_outline</mat-icon><p>{{ error() }}</p>
          <button mat-stroked-button (click)="load()">Retry</button>
        </div>
      } @else if (page().empty) {
        <div class="state"><mat-icon>groups</mat-icon><p>No patients match your search.</p></div>
      } @else {
        <div class="table-wrap">
          <table mat-table [dataSource]="page().content">
            <ng-container matColumnDef="code">
              <th mat-header-cell *matHeaderCellDef>Code</th>
              <td mat-cell *matCellDef="let p">{{ p.patientCode }}</td>
            </ng-container>
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let p">
                <div>{{ p.fullName }}</div>
                <div class="muted" style="font-size:.76rem">
                  {{ p.gender || '—' }}@if (p.dob) { · {{ p.dob | date:'mediumDate' }} }
                </div>
              </td>
            </ng-container>
            <ng-container matColumnDef="contact">
              <th mat-header-cell *matHeaderCellDef>Contact</th>
              <td mat-cell *matCellDef="let p">
                <div>{{ p.phone || '—' }}</div>
                <div class="muted" style="font-size:.76rem">{{ p.email || '' }}</div>
              </td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let p">
                <span class="chip" [class]="'chip--' + tone(p.status)">{{ p.status }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let p" style="text-align:right">
                <button mat-icon-button [matMenuTriggerFor]="menu" (click)="$event.stopPropagation()"><mat-icon>more_vert</mat-icon></button>
                <mat-menu #menu="matMenu">
                  <a mat-menu-item [routerLink]="['../patients', p.patientId]">
                    <mat-icon>visibility</mat-icon>View details
                  </a>
                  <button mat-menu-item (click)="enrollments(p)"><mat-icon>science</mat-icon>Enrollments</button>
                  @if (caps().managePatients) {
                    <button mat-menu-item (click)="edit(p)"><mat-icon>edit</mat-icon>Edit</button>
                    <button mat-menu-item (click)="verify(p)" [disabled]="busyId() === p.patientId">
                      <mat-icon>verified</mat-icon>Verify
                    </button>
                  }
                </mat-menu>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns" class="clickable-row" (click)="viewDetails(row)"></tr>
          </table>
        </div>

        <mat-paginator
          [length]="page().totalElements" [pageSize]="page().size || size"
          [pageIndex]="page().number" [pageSizeOptions]="[5,10,20,50]" (page)="onPage($event)" />
      }
    </section>
  `,
})
export class PatientsManagementComponent {
  private readonly patients = inject(PatientService);
  private readonly auth = inject(AuthService);
  private readonly ui = inject(UiService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly caps = computed(() => capabilitiesFor(this.auth.roleKey()));
  readonly tone = statusTone;

  readonly search = new FormControl('', { nonNullable: true });
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly busyId = signal<number | null>(null);
  readonly page = signal<Page<PatientResponse>>({
    content: [], totalElements: 0, totalPages: 0, number: 0, size: 10,
    first: true, last: true, numberOfElements: 0, empty: true,
  });

  readonly columns = ['code', 'name', 'contact', 'status', 'actions'];
  pageIndex = 0;
  size = 10;
  private lastQuery = '';

  constructor() {
    this.load();
    this.search.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe((v) => {
      this.lastQuery = (v ?? '').trim();
      this.pageIndex = 0;
      this.load();
    });
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    const q = { page: this.pageIndex, size: this.size, sort: 'patientId,desc' };
    const req = this.lastQuery ? this.patients.search(this.lastQuery, q) : this.patients.list(q);
    req.subscribe({
      next: (p) => { this.page.set(p); this.loading.set(false); },
      error: () => { this.error.set('We could not load patients. Please try again.'); this.loading.set(false); },
    });
  }

  onPage(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.size = e.pageSize;
    this.load();
  }

  create(): void {
    this.dialog.open(PatientFormDialogComponent, { data: null, width: '680px', panelClass: 'ctms-dialog' })
      .afterClosed().subscribe((saved) => { if (saved) this.load(); });
  }

  viewDetails(p: PatientResponse): void {
    this.router.navigate(['../patients', p.patientId], { relativeTo: this.route });
  }

  edit(p: PatientResponse): void {
    this.dialog.open(PatientFormDialogComponent, { data: p, width: '680px', panelClass: 'ctms-dialog' })
      .afterClosed().subscribe((saved) => { if (saved) this.load(); });
  }

  verify(p: PatientResponse): void {
    this.busyId.set(p.patientId);
    this.patients.verify(p.patientId).subscribe({
      next: () => { this.busyId.set(null); this.ui.success('Patient verified.'); this.load(); },
      error: () => this.busyId.set(null),
    });
  }

  enrollments(p: PatientResponse): void {
    this.dialog.open(EnrollmentsDialogComponent, {
      data: { patient: p, canManage: this.caps().manageEnrollments },
      width: '620px', panelClass: 'ctms-dialog',
    });
  }
}
