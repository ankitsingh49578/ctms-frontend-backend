import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserAdminService } from '../services/user-admin.service';
import { RoleService } from '../services/role.service';
import { UiService } from '../../../core/services/ui.service';
import { AuthService } from '../../../core/services/auth.service';
import { Page } from '../../../core/models/api.models';
import { UserResponse } from '../../../core/models/auth.models';
import { RoleResponse } from '../../../core/models/domain.models';
import { statusTone } from '../../../core/models/enums';
import { ConfirmDialogComponent, ConfirmData } from '../../../shared/confirm-dialog.component';
import { UserFormDialogComponent, UserFormData } from './user-form.dialog';
import {
  ChangeRoleDialogComponent, ChangeRoleData, ResetPasswordDialogComponent,
} from './user-actions.dialogs';

@Component({
  selector: 'ctms-admin-user-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, ReactiveFormsModule, MatTableModule, MatPaginatorModule, MatProgressSpinnerModule,
    MatButtonModule, MatIconModule, MatMenuModule, MatFormFieldModule, MatInputModule,
    MatTooltipModule, MatDialogModule,
  ],
  template: `
    <section class="page">
      <header class="page__head">
        <div>
          <h1 class="page__title">User Management</h1>
          <p class="page__subtitle">Accounts, roles and access across the system.</p>
        </div>
        <button mat-flat-button color="primary" (click)="create()"><mat-icon>person_add</mat-icon>New user</button>
      </header>

      <div class="card" style="margin-bottom:16px;padding:8px 16px">
        <mat-form-field appearance="outline" class="field-full" style="margin:0" subscriptSizing="dynamic">
          <mat-icon matPrefix>search</mat-icon>
          <mat-label>Search by username or email</mat-label>
          <input matInput [formControl]="searchCtrl" />
          @if (searchCtrl.value) {
            <button matSuffix mat-icon-button (click)="searchCtrl.setValue('')"><mat-icon>close</mat-icon></button>
          }
        </mat-form-field>
      </div>

      @if (loading()) {
        <div class="state"><mat-spinner diameter="36" /><p>Loading users…</p></div>
      } @else if (error()) {
        <div class="state">
          <mat-icon>error_outline</mat-icon><p>{{ error() }}</p>
          <button mat-stroked-button (click)="load()">Retry</button>
        </div>
      } @else if (page().empty) {
        <div class="state">
          <mat-icon>person_off</mat-icon>
          <p>{{ searchCtrl.value ? 'No users match your search.' : 'No users found.' }}</p>
        </div>
      } @else {
        <div class="table-wrap">
          <table mat-table [dataSource]="page().content">
            <ng-container matColumnDef="username">
              <th mat-header-cell *matHeaderCellDef>Username</th>
              <td mat-cell *matCellDef="let u">
                <strong>{{ u.username }}</strong>
                @if (isSelf(u)) { <span class="chip chip--neutral" style="margin-left:6px">you</span> }
              </td>
            </ng-container>
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let u">{{ u.email }}</td>
            </ng-container>
            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>Role</th>
              <td mat-cell *matCellDef="let u"><span class="chip chip--neutral">{{ u.roleName }}</span></td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let u">
                <span class="chip" [class]="'chip--' + tone(u.status)">{{ u.status }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="created">
              <th mat-header-cell *matHeaderCellDef>Created</th>
              <td mat-cell *matCellDef="let u">{{ u.createdAt ? (u.createdAt | date:'mediumDate') : '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let u">
                <button mat-icon-button [matMenuTriggerFor]="menu" [disabled]="busyId() === u.userId"
                        [matTooltip]="'Actions'">
                  @if (busyId() === u.userId) { <mat-spinner diameter="18" /> }
                  @else { <mat-icon>more_vert</mat-icon> }
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="edit(u)"><mat-icon>edit</mat-icon>Edit</button>
                  <button mat-menu-item (click)="changeRole(u)"><mat-icon>badge</mat-icon>Change role</button>
                  <button mat-menu-item (click)="resetPassword(u)"><mat-icon>lock_reset</mat-icon>Reset password</button>
                  @if (u.status === 'Active') {
                    <button mat-menu-item (click)="disable(u)"><mat-icon>block</mat-icon>Disable</button>
                  } @else {
                    <button mat-menu-item (click)="enable(u)"><mat-icon>check_circle</mat-icon>Enable</button>
                  }
                  <button mat-menu-item [disabled]="isSelf(u)" (click)="remove(u)">
                    <mat-icon color="warn">delete</mat-icon>
                    <span style="color:var(--ctms-danger)">Delete</span>
                  </button>
                </mat-menu>
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
export class AdminUserListComponent implements OnInit {
  private readonly users = inject(UserAdminService);
  private readonly roleSvc = inject(RoleService);
  private readonly ui = inject(UiService);
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  readonly columns = ['username', 'email', 'role', 'status', 'created', 'actions'];
  readonly tone = statusTone;

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly busyId = signal<number | null>(null);
  readonly roles = signal<RoleResponse[]>([]);
  readonly page = signal<Page<UserResponse>>({
    content: [], totalElements: 0, totalPages: 0, number: 0, size: 10,
    first: true, last: true, numberOfElements: 0, empty: true,
  });

  readonly searchCtrl = new FormControl('', { nonNullable: true });
  pageIndex = 0;
  size = 10;

  ngOnInit(): void {
    this.roleSvc.listAll().subscribe({
      next: (r) => this.roles.set(r),
      error: () => {},
    });
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
    const keyword = this.searchCtrl.value.trim();
    const query = { page: this.pageIndex, size: this.size, sort: 'userId,asc' };
    const call = keyword ? this.users.search(keyword, query) : this.users.list(query);
    call.subscribe({
      next: (p) => {
        this.page.set(p);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('We could not load users. Please try again.');
        this.loading.set(false);
      },
    });
  }

  onPage(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.size = e.pageSize;
    this.load();
  }

  isSelf(u: UserResponse): boolean {
    return this.auth.user()?.userId === u.userId;
  }

  create(): void {
    const data: UserFormData = { roles: this.roles() };
    this.dialog.open(UserFormDialogComponent, { data, width: '640px' }).afterClosed().subscribe((res) => {
      if (res) this.load();
    });
  }

  edit(u: UserResponse): void {
    const data: UserFormData = { user: u, roles: this.roles() };
    this.dialog.open(UserFormDialogComponent, { data, width: '640px' }).afterClosed().subscribe((res) => {
      if (res) this.load();
    });
  }

  changeRole(u: UserResponse): void {
    const data: ChangeRoleData = { user: u, roles: this.roles() };
    this.dialog.open(ChangeRoleDialogComponent, { data, width: '420px' }).afterClosed().subscribe((res) => {
      if (res) this.load();
    });
  }

  resetPassword(u: UserResponse): void {
    this.dialog.open(ResetPasswordDialogComponent, { data: u, width: '420px' }).afterClosed().subscribe();
  }

  enable(u: UserResponse): void {
    this.busyId.set(u.userId);
    this.users.enable(u.userId).subscribe({
      next: () => {
        this.busyId.set(null);
        this.ui.success(`${u.username} enabled.`);
        this.load();
      },
      error: () => this.busyId.set(null),
    });
  }

  disable(u: UserResponse): void {
    this.busyId.set(u.userId);
    this.users.disable(u.userId).subscribe({
      next: () => {
        this.busyId.set(null);
        this.ui.success(`${u.username} disabled.`);
        this.load();
      },
      error: () => this.busyId.set(null),
    });
  }

  remove(u: UserResponse): void {
    const data: ConfirmData = {
      title: 'Delete user?',
      message: `This permanently deletes ${u.username}. This action cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true,
    };
    this.dialog.open(ConfirmDialogComponent, { data, width: '420px' }).afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.busyId.set(u.userId);
      this.users.remove(u.userId).subscribe({
        next: () => {
          this.busyId.set(null);
          this.ui.success(`${u.username} deleted.`);
          // Step back a page if we just emptied the last one.
          if (this.page().content.length === 1 && this.pageIndex > 0) this.pageIndex--;
          this.load();
        },
        error: () => this.busyId.set(null),
      });
    });
  }
}
