import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
import { TrialService } from '../services/trials.service';
import { AuthService } from '../../../core/services/auth.service';
import { UiService } from '../../../core/services/ui.service';
import { Page } from '../../../core/models/api.models';
import { TrialResponse } from '../../../core/models/domain.models';
import { statusTone, TRIAL_STATUSES } from '../../../core/models/enums';
import { capabilitiesFor } from '../clinical.capabilities';
import { TrialFormDialogComponent } from '../dialogs/trial-form.dialog';
import { PickStatusDialogComponent, PickStatusData } from '../dialogs/pick-status.dialog';
import { AssignManagerDialogComponent } from '../dialogs/assign-manager.dialog';

@Component({
  selector: 'ctms-trials-management',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, ReactiveFormsModule, RouterLink, MatTableModule, MatPaginatorModule, MatProgressSpinnerModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatMenuModule,
  ],
  template: `
    <section class="page">
      <header class="page__head">
        <div>
          <h1 class="page__title">Trials</h1>
          <p class="page__subtitle">Manage study records, status and team assignments.</p>
        </div>
      </header>

      <div class="toolbar">
        <mat-form-field appearance="outline" class="grow" subscriptSizing="dynamic">
          <mat-icon matPrefix>search</mat-icon>
          <mat-label>Search trials</mat-label>
          <input matInput [formControl]="search" placeholder="Name or code" />
        </mat-form-field>
        @if (caps().manageTrials) {
          <button mat-flat-button (click)="create()"><mat-icon>add</mat-icon>New trial</button>
        }
      </div>

      @if (loading()) {
        <div class="state"><mat-spinner diameter="36" /><p>Loading trials…</p></div>
      } @else if (error()) {
        <div class="state">
          <mat-icon>error_outline</mat-icon><p>{{ error() }}</p>
          <button mat-stroked-button (click)="load()">Retry</button>
        </div>
      } @else if (page().empty) {
        <div class="state"><mat-icon>science</mat-icon><p>No trials match your search.</p></div>
      } @else {
        <div class="table-wrap">
          <table mat-table [dataSource]="page().content">
            <ng-container matColumnDef="code">
              <th mat-header-cell *matHeaderCellDef>Code</th>
              <td mat-cell *matCellDef="let t">{{ t.trialCode }}</td>
            </ng-container>
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Trial</th>
              <td mat-cell *matCellDef="let t">
                <div>{{ t.trialName }}</div>
                <div class="muted" style="font-size:.76rem">Phase {{ t.phase }}</div>
              </td>
            </ng-container>
            <ng-container matColumnDef="dates">
              <th mat-header-cell *matHeaderCellDef>Timeline</th>
              <td mat-cell *matCellDef="let t">
                {{ t.startDate ? (t.startDate | date:'mediumDate') : '—' }}
                @if (t.endDate) { → {{ t.endDate | date:'mediumDate' }} }
              </td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let t">
                <span class="chip" [class]="'chip--' + tone(t.status)">{{ t.status }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let t" style="text-align:right">
                @if (hasRowActions) {
                  <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Actions" (click)="$event.stopPropagation()"><mat-icon>more_vert</mat-icon></button>
                  <mat-menu #menu="matMenu">
                    <a mat-menu-item [routerLink]="['../trials', t.trialId]"><mat-icon>visibility</mat-icon>View details</a>
                    @if (caps().manageTrials) {
                      <button mat-menu-item (click)="edit(t)"><mat-icon>edit</mat-icon>Edit details</button>
                      <button mat-menu-item (click)="changeStatus(t)"><mat-icon>flag</mat-icon>Change status</button>
                    }
                    @if (caps().assignManagers || caps().viewAssignments) {
                      <button mat-menu-item (click)="assignments(t)"><mat-icon>group_add</mat-icon>Team & assignments</button>
                    }
                  </mat-menu>
                } @else {
                  <span class="muted" style="font-size:.8rem">—</span>
                }
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
export class TrialsManagementComponent {
  private readonly trials = inject(TrialService);
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
  readonly page = signal<Page<TrialResponse>>({
    content: [], totalElements: 0, totalPages: 0, number: 0, size: 10,
    first: true, last: true, numberOfElements: 0, empty: true,
  });

  readonly columns = ['code', 'name', 'dates', 'status', 'actions'];
  readonly hasRowActions = true;

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
    const q = { page: this.pageIndex, size: this.size, sort: 'trialId,desc' };
    const req = this.lastQuery
      ? this.trials.search(this.lastQuery, q)
      : this.trials.list(q);
    req.subscribe({
      next: (p) => { this.page.set(p); this.loading.set(false); },
      error: () => { this.error.set('We could not load trials. Please try again.'); this.loading.set(false); },
    });
  }

  onPage(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.size = e.pageSize;
    this.load();
  }

  create(): void {
    this.dialog.open(TrialFormDialogComponent, { data: null, width: '640px', panelClass: 'ctms-dialog' })
      .afterClosed().subscribe((saved) => { if (saved) this.load(); });
  }

  viewDetails(t: TrialResponse): void {
    this.router.navigate(['../trials', t.trialId], { relativeTo: this.route });
  }

  edit(t: TrialResponse): void {
    this.dialog.open(TrialFormDialogComponent, { data: t, width: '640px', panelClass: 'ctms-dialog' })
      .afterClosed().subscribe((saved) => { if (saved) this.load(); });
  }

  changeStatus(t: TrialResponse): void {
    const data: PickStatusData = {
      title: `Status — ${t.trialName}`, label: 'Trial status', current: t.status,
      options: TRIAL_STATUSES, confirmLabel: 'Update status',
    };
    this.dialog.open(PickStatusDialogComponent, { data, width: '380px', panelClass: 'ctms-dialog' })
      .afterClosed().subscribe((status?: string) => {
        if (!status || status === t.status) return;
        this.trials.updateStatus(t.trialId, status).subscribe({
          next: () => { this.ui.success('Trial status updated.'); this.load(); },
        });
      });
  }

  assignments(t: TrialResponse): void {
    this.dialog.open(AssignManagerDialogComponent, {
      data: { trial: t, canAssign: this.caps().assignManagers },
      width: '560px', panelClass: 'ctms-dialog',
    });
  }
}
