import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ENDPOINTS } from '../../../core/constants/api-endpoints';
import { Page, PageQuery } from '../../../core/models/api.models';
import {
  CreateRoleRequest, RoleResponse, UpdateRoleRequest,
} from '../../../core/models/domain.models';

/**
 * Roles (com.ctms.controller.RoleController, ADMIN role). `listAll()` powers the
 * role dropdowns in the user dialogs; the paged list + write methods back the
 * Roles management page. Every path here is gated by hasRole('ADMIN').
 */
@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly api = inject(ApiService);

  /** Flattened, large-page read used to populate role pickers (seeded set is small). */
  listAll(): Observable<RoleResponse[]> {
    return this.api
      .get<Page<RoleResponse>>(ENDPOINTS.roles.list, { page: 0, size: 100, sort: 'roleId,asc' })
      .pipe(map((p) => p.content));
  }

  list(query: PageQuery): Observable<Page<RoleResponse>> {
    return this.api.get<Page<RoleResponse>>(ENDPOINTS.roles.list, { ...query });
  }

  create(body: CreateRoleRequest): Observable<RoleResponse> {
    return this.api.post<RoleResponse>(ENDPOINTS.roles.list, body);
  }

  update(id: number, body: UpdateRoleRequest): Observable<RoleResponse> {
    return this.api.put<RoleResponse>(ENDPOINTS.roles.byId(id), body);
  }

  remove(id: number): Observable<void> {
    return this.api.delete<void>(ENDPOINTS.roles.byId(id));
  }
}
