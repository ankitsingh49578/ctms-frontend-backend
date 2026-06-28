import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ENDPOINTS } from '../../../core/constants/api-endpoints';
import { Page, PageQuery } from '../../../core/models/api.models';
import { UserResponse } from '../../../core/models/auth.models';
import {
  ChangePasswordRequest, ChangeRoleRequest, CreateUserRequest, UpdateUserRequest,
} from '../../../core/models/domain.models';

/**
 * Admin user administration (com.ctms.controller.UserController, ADMIN role).
 * Mirrors every endpoint the controller exposes.
 */
@Injectable({ providedIn: 'root' })
export class UserAdminService {
  private readonly api = inject(ApiService);

  list(query: PageQuery): Observable<Page<UserResponse>> {
    return this.api.get<Page<UserResponse>>(ENDPOINTS.users.list, { ...query });
  }
  search(keyword: string, query: PageQuery): Observable<Page<UserResponse>> {
    return this.api.get<Page<UserResponse>>(ENDPOINTS.users.search, { keyword, ...query });
  }
  count(): Observable<number> {
    return this.api.get<number>(ENDPOINTS.users.count);
  }
  getById(id: number): Observable<UserResponse> {
    return this.api.get<UserResponse>(ENDPOINTS.users.byId(id));
  }
  create(body: CreateUserRequest): Observable<UserResponse> {
    return this.api.post<UserResponse>(ENDPOINTS.users.list, body);
  }
  update(id: number, body: UpdateUserRequest): Observable<UserResponse> {
    return this.api.put<UserResponse>(ENDPOINTS.users.byId(id), body);
  }
  remove(id: number): Observable<void> {
    return this.api.delete<void>(ENDPOINTS.users.byId(id));
  }
  changeRole(id: number, body: ChangeRoleRequest): Observable<UserResponse> {
    return this.api.post<UserResponse>(ENDPOINTS.users.changeRole(id), body);
  }
  changePassword(id: number, body: ChangePasswordRequest): Observable<void> {
    return this.api.post<void>(ENDPOINTS.users.changePassword(id), body);
  }
  enable(id: number): Observable<UserResponse> {
    return this.api.post<UserResponse>(ENDPOINTS.users.enable(id));
  }
  disable(id: number): Observable<UserResponse> {
    return this.api.post<UserResponse>(ENDPOINTS.users.disable(id));
  }
}
