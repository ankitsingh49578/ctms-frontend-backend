import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RoleService } from '../services/role.service';
import { UiService } from '../../../core/services/ui.service';
import { Page, emptyPage } from '../../../core/models/api.models';
import { RoleResponse } from '../../../core/models/domain.models';
import { statusTone } from '../../../core/models/enums';
import { ConfirmDialogComponent, ConfirmData } from '../../../shared/confirm-dialog.component';
import { RoleFormDialogComponent, RoleFormData } from './role-form.dialog';

/**
 * Roles management. Backed by RoleController (ADMIN). Authorization across the
 * API is by role NAME, so the seeded roles underpin every portal's access — the
 * page makes that explicit and guards destructive edits with confirmation.
 */
@Component({
  selector: 'ctms-admin-roles',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTableModule, MatPaginatorModule, MatProgressSpinnerModule, MatButtonModule,
    MatIconModule, MatTooltipModule, MatDialogModule,
  ],
  template: `
    <section class="page">
      <div class="hero">
        <h1>Roles &amp; Access</h1>
        <p>The role catalogue the backend authorizes against. Access is granted by role name.</p>
        <div class="hero__icon"><mat-icon>admin_panel_settings</mat-icon></div>
      </div>

      <div class="toolbar">
        <span class="spacer"></span>
        <button mat-flat-button color="primary" (click)="create()"><mat-icon>add</mat-icon>New role</button>
      </div>

      @if (loading()) {
        <div class="state"><mat-spinner diameter="36" /><p>Loading roles…</p></div>
      } @else if (error()) {
        <div class="state">
          <mat-icon>error_outline</mat-icon><p>{{ error() }}</p>
          <button mat-stroked-button (click)="load()">Retry</button>
        </div>
      } @else if (page().empty) {
        <div class="state"><mat-icon>badge</mat-icon><p>No roles found.</p></div>
      } @else {
        <div class="table-wrap">
          <table mat-table [dataSource]="page().content">
            <ng-container matColumnDef="roleName">
              <th mat-header-cell *matHeaderCellDef>Role</th>
              <td mat-cell *matCellDef="let r"><strong>{{ r.roleName }}</strong></td>
            </ng-container>
            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Description</th>
              <td mat-cell *matCellDef="let r">{{ r.description || '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="permissions">
              <th mat-header-cell *matHeaderCellDef>Permissions</th>
              <td mat-cell *matCellDef="let r">
                @if (r.permissions?.length) {
                  <span class="chip chip--neutral" matTooltip="Stored, but not used for authorization">
                    {{ r.permissions.length }} mapped
                  </span>
                } @else { <span class="muted">—</span> }
              </td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let r"><span class="chip" [class]="'chip--' + tone(r.status)">{{ r.status }}</span></td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let r">
                <div class="row-actions">
                  <button mat-icon-button matTooltip="Edit" [disabled]="busyId() === r.roleId" (click)="edit(r)">
                    @if (busyId() === r.roleId) { <mat-spinner diameter="18" /> }
                    @else { <mat-icon>edit</mat-icon> }
                  </button>
                  <button mat-icon-button matTooltip="Delete" [disabled]="busyId() === r.roleId" (click)="remove(r)">
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

        <p class="muted" style="margin:12px 2px 0;font-size:.8rem">
          Permissions shown here are stored in the role/permission tables but are not consulted
          when authorizing requests — the API gates every endpoint on role name.
        </p>
      }
    </section>
  `,
})
export class AdminRolesComponent implements OnInit {
  private readonly roles = inject(RoleService);
  private readonly ui = inject(UiService);
  private readonly dialog = inject(MatDialog);

  readonly columns = ['roleName', 'description', 'permissions', 'status', 'actions'];
  readonly tone = statusTone;

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly busyId = signal<number | null>(null);
  readonly page = signal<Page<RoleResponse>>(emptyPage<RoleResponse>());

  pageIndex = 0;
  size = 20;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.roles.list({ page: this.pageIndex, size: this.size, sort: 'roleId,asc' }).subscribe({
      next: (p) => {
        this.page.set(p);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('We could not load roles. Please try again.');
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
    const data: RoleFormData = {};
    this.dialog.open(RoleFormDialogComponent, { data, width: '520px' }).afterClosed().subscribe((res) => {
      if (res) this.load();
    });
  }

  edit(r: RoleResponse): void {
    const data: RoleFormData = { role: r };
    this.dialog.open(RoleFormDialogComponent, { data, width: '520px' }).afterClosed().subscribe((res) => {
      if (res) this.load();
    });
  }

  remove(r: RoleResponse): void {
    const data: ConfirmData = {
      title: 'Delete role?',
      message: `This deletes the "${r.roleName}" role. Roles in use by accounts can't be removed and the backend will reject the request.`,
      confirmLabel: 'Delete',
      danger: true,
    };
    this.dialog.open(ConfirmDialogComponent, { data, width: '460px' }).afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.busyId.set(r.roleId);
      this.roles.remove(r.roleId).subscribe({
        next: () => {
          this.busyId.set(null);
          this.ui.success(`Role "${r.roleName}" deleted.`);
          if (this.page().content.length === 1 && this.pageIndex > 0) this.pageIndex--;
          this.load();
        },
        error: () => this.busyId.set(null),
      });
    });
  }
}
