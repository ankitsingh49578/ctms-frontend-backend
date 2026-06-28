import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StaffDirectoryService } from '../services/staff-directory.service';
import { UiService } from '../../../core/services/ui.service';
import { Page, emptyPage } from '../../../core/models/api.models';
import { DoctorResponse } from '../../../core/models/domain.models';
import { ConfirmDialogComponent, ConfirmData } from '../../../shared/confirm-dialog.component';
import { DoctorFormDialogComponent, DoctorFormData } from './doctor-form.dialog';

/**
 * Doctor directory. Backed by DoctorController. Listing/search are TM/CM-gated
 * and writes are ADMIN-gated; an ADMIN login satisfies both via RoleHierarchy.
 */
@Component({
  selector: 'ctms-admin-doctors',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, MatTableModule, MatPaginatorModule, MatProgressSpinnerModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatTooltipModule,
    MatDialogModule,
  ],
  template: `
    <section class="page">
      <div class="hero">
        <h1>Doctor Directory</h1>
        <p>Clinical-staff records that visits, results and adverse events reference.</p>
        <div class="hero__icon"><mat-icon>stethoscope</mat-icon></div>
      </div>

      <div class="toolbar">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="grow">
          <mat-icon matPrefix>search</mat-icon>
          <mat-label>Search doctors</mat-label>
          <input matInput [formControl]="searchCtrl" autocomplete="off" />
          @if (searchCtrl.value) {
            <button matSuffix mat-icon-button (click)="searchCtrl.setValue('')"><mat-icon>close</mat-icon></button>
          }
        </mat-form-field>
        <button mat-flat-button color="primary" (click)="create()"><mat-icon>add</mat-icon>New doctor</button>
      </div>

      @if (loading()) {
        <div class="state"><mat-spinner diameter="36" /><p>Loading doctors…</p></div>
      } @else if (error()) {
        <div class="state">
          <mat-icon>error_outline</mat-icon><p>{{ error() }}</p>
          <button mat-stroked-button (click)="load()">Retry</button>
        </div>
      } @else if (page().empty) {
        <div class="state">
          <mat-icon>stethoscope</mat-icon>
          <p>{{ searchCtrl.value ? 'No doctors match your search.' : 'No doctors in the directory yet.' }}</p>
          @if (!searchCtrl.value) {
            <button mat-stroked-button (click)="create()"><mat-icon>add</mat-icon>Add the first doctor</button>
          }
        </div>
      } @else {
        <div class="table-wrap">
          <table mat-table [dataSource]="page().content">
            <ng-container matColumnDef="doctorName">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let d"><strong>{{ d.doctorName }}</strong></td>
            </ng-container>
            <ng-container matColumnDef="specialization">
              <th mat-header-cell *matHeaderCellDef>Specialization</th>
              <td mat-cell *matCellDef="let d">{{ d.specialization || '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="licenseNo">
              <th mat-header-cell *matHeaderCellDef>License</th>
              <td mat-cell *matCellDef="let d">{{ d.licenseNo || '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="phone">
              <th mat-header-cell *matHeaderCellDef>Phone</th>
              <td mat-cell *matCellDef="let d">{{ d.phone || '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="userId">
              <th mat-header-cell *matHeaderCellDef>User</th>
              <td mat-cell *matCellDef="let d">
                @if (d.userId != null) { <span class="chip chip--neutral">#{{ d.userId }}</span> }
                @else { <span class="muted">—</span> }
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let d">
                <div class="row-actions">
                  <button mat-icon-button matTooltip="Edit" [disabled]="busyId() === d.doctorId" (click)="edit(d)">
                    @if (busyId() === d.doctorId) { <mat-spinner diameter="18" /> }
                    @else { <mat-icon>edit</mat-icon> }
                  </button>
                  <button mat-icon-button matTooltip="Delete" [disabled]="busyId() === d.doctorId" (click)="remove(d)">
                    <mat-icon style="color:var(--ctms-danger)">delete</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns"></tr>
          </table>
        </div>

        <mat-paginator
          [length]="page().totalElements"
          [pageSize]="page().size || size"
          [pageIndex]="page().number"
          [pageSizeOptions]="[10, 20, 50]"
          (page)="onPage($event)" />
      }
    </section>
  `,
})
export class AdminDoctorsComponent implements OnInit {
  private readonly directory = inject(StaffDirectoryService);
  private readonly ui = inject(UiService);
  private readonly dialog = inject(MatDialog);

  readonly columns = ['doctorName', 'specialization', 'licenseNo', 'phone', 'userId', 'actions'];

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly busyId = signal<number | null>(null);
  readonly page = signal<Page<DoctorResponse>>(emptyPage<DoctorResponse>());

  readonly searchCtrl = new FormControl('', { nonNullable: true });
  pageIndex = 0;
  size = 20;

  ngOnInit(): void {
    this.searchCtrl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.pageIndex = 0;
        this.load();
      });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    const q = { page: this.pageIndex, size: this.size, sort: 'doctorId,asc' };
    const term = this.searchCtrl.value.trim();
    const call = term
      ? this.directory.searchDoctors(term, q)
      : this.directory.listDoctors(q);
    call.subscribe({
      next: (p) => {
        this.page.set(p);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('We could not load doctors. Please try again.');
        this.loading.set(false);
      },
    });
  }

  onPage(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.size = e.pageSize;
    this.load();
  }

  create(): void {
    const data: DoctorFormData = {};
    this.dialog.open(DoctorFormDialogComponent, { data, width: '520px' }).afterClosed().subscribe((res) => {
      if (res) this.load();
    });
  }

  edit(d: DoctorResponse): void {
    const data: DoctorFormData = { doctor: d };
    this.dialog.open(DoctorFormDialogComponent, { data, width: '520px' }).afterClosed().subscribe((res) => {
      if (res) this.load();
    });
  }

  remove(d: DoctorResponse): void {
    const data: ConfirmData = {
      title: 'Delete doctor?',
      message: `This removes "${d.doctorName}" from the directory. Records that reference this doctor may block deletion, in which case the backend will reject it.`,
      confirmLabel: 'Delete',
      danger: true,
    };
    this.dialog.open(ConfirmDialogComponent, { data, width: '460px' }).afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.busyId.set(d.doctorId);
      this.directory.deleteDoctor(d.doctorId).subscribe({
        next: () => {
          this.busyId.set(null);
          this.ui.success(`Doctor "${d.doctorName}" deleted.`);
          if (this.page().content.length === 1 && this.pageIndex > 0) this.pageIndex--;
          this.load();
        },
        error: () => this.busyId.set(null),
      });
    });
  }
}
