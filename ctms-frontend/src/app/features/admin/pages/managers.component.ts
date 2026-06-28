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
import { ManagerResponse } from '../../../core/models/domain.models';
import { ConfirmDialogComponent, ConfirmData } from '../../../shared/confirm-dialog.component';
import { ManagerFormDialogComponent, ManagerFormData } from './manager-form.dialog';

/**
 * Manager directory (clinical / trial management staff). Backed by
 * ManagerController — every path is ADMIN-gated.
 */
@Component({
  selector: 'ctms-admin-managers',
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
        <h1>Manager Directory</h1>
        <p>Clinical and trial management staff records.</p>
        <div class="hero__icon"><mat-icon>badge</mat-icon></div>
      </div>

      <div class="toolbar">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="grow">
          <mat-icon matPrefix>search</mat-icon>
          <mat-label>Search managers</mat-label>
          <input matInput [formControl]="searchCtrl" autocomplete="off" />
          @if (searchCtrl.value) {
            <button matSuffix mat-icon-button (click)="searchCtrl.setValue('')"><mat-icon>close</mat-icon></button>
          }
        </mat-form-field>
        <button mat-flat-button color="primary" (click)="create()"><mat-icon>add</mat-icon>New manager</button>
      </div>

      @if (loading()) {
        <div class="state"><mat-spinner diameter="36" /><p>Loading managers…</p></div>
      } @else if (error()) {
        <div class="state">
          <mat-icon>error_outline</mat-icon><p>{{ error() }}</p>
          <button mat-stroked-button (click)="load()">Retry</button>
        </div>
      } @else if (page().empty) {
        <div class="state">
          <mat-icon>badge</mat-icon>
          <p>{{ searchCtrl.value ? 'No managers match your search.' : 'No managers in the directory yet.' }}</p>
          @if (!searchCtrl.value) {
            <button mat-stroked-button (click)="create()"><mat-icon>add</mat-icon>Add the first manager</button>
          }
        </div>
      } @else {
        <div class="table-wrap">
          <table mat-table [dataSource]="page().content">
            <ng-container matColumnDef="managerName">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let m"><strong>{{ m.managerName }}</strong></td>
            </ng-container>
            <ng-container matColumnDef="department">
              <th mat-header-cell *matHeaderCellDef>Department</th>
              <td mat-cell *matCellDef="let m">{{ m.department || '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="phone">
              <th mat-header-cell *matHeaderCellDef>Phone</th>
              <td mat-cell *matCellDef="let m">{{ m.phone || '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="userId">
              <th mat-header-cell *matHeaderCellDef>User</th>
              <td mat-cell *matCellDef="let m">
                @if (m.userId != null) { <span class="chip chip--neutral">#{{ m.userId }}</span> }
                @else { <span class="muted">—</span> }
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let m">
                <div class="row-actions">
                  <button mat-icon-button matTooltip="Edit" [disabled]="busyId() === m.managerId" (click)="edit(m)">
                    @if (busyId() === m.managerId) { <mat-spinner diameter="18" /> }
                    @else { <mat-icon>edit</mat-icon> }
                  </button>
                  <button mat-icon-button matTooltip="Delete" [disabled]="busyId() === m.managerId" (click)="remove(m)">
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
export class AdminManagersComponent implements OnInit {
  private readonly directory = inject(StaffDirectoryService);
  private readonly ui = inject(UiService);
  private readonly dialog = inject(MatDialog);

  readonly columns = ['managerName', 'department', 'phone', 'userId', 'actions'];

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly busyId = signal<number | null>(null);
  readonly page = signal<Page<ManagerResponse>>(emptyPage<ManagerResponse>());

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
    const q = { page: this.pageIndex, size: this.size, sort: 'managerId,asc' };
    const term = this.searchCtrl.value.trim();
    const call = term
      ? this.directory.searchManagers(term, q)
      : this.directory.listManagers(q);
    call.subscribe({
      next: (p) => {
        this.page.set(p);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('We could not load managers. Please try again.');
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
    const data: ManagerFormData = {};
    this.dialog.open(ManagerFormDialogComponent, { data, width: '520px' }).afterClosed().subscribe((res) => {
      if (res) this.load();
    });
  }

  edit(m: ManagerResponse): void {
    const data: ManagerFormData = { manager: m };
    this.dialog.open(ManagerFormDialogComponent, { data, width: '520px' }).afterClosed().subscribe((res) => {
      if (res) this.load();
    });
  }

  remove(m: ManagerResponse): void {
    const data: ConfirmData = {
      title: 'Delete manager?',
      message: `This removes "${m.managerName}" from the directory. Trial or coordinator assignments that reference this manager may block deletion, in which case the backend will reject it.`,
      confirmLabel: 'Delete',
      danger: true,
    };
    this.dialog.open(ConfirmDialogComponent, { data, width: '460px' }).afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.busyId.set(m.managerId);
      this.directory.deleteManager(m.managerId).subscribe({
        next: () => {
          this.busyId.set(null);
          this.ui.success(`Manager "${m.managerName}" deleted.`);
          if (this.page().content.length === 1 && this.pageIndex > 0) this.pageIndex--;
          this.load();
        },
        error: () => this.busyId.set(null),
      });
    });
  }
}
