import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ENDPOINTS } from '../../../core/constants/api-endpoints';
import { Page, PageQuery } from '../../../core/models/api.models';
import {
  CreateDoctorRequest, CreateManagerRequest, DoctorResponse, ManagerResponse,
  UpdateDoctorRequest, UpdateManagerRequest,
} from '../../../core/models/domain.models';

/**
 * Staff directories — clinical-staff records held in the `doctors` and
 * `managers` tables (distinct from the `users` accounts managed by
 * UserController). Reads are gated to TM/CM and writes to ADMIN; an ADMIN login
 * satisfies both because ADMIN inherits the functional roles via RoleHierarchy.
 *  - DoctorController  /api/doctors
 *  - ManagerController /api/managers
 */
@Injectable({ providedIn: 'root' })
export class StaffDirectoryService {
  private readonly api = inject(ApiService);

  /* ---- Doctors ---- */

  listDoctors(query: PageQuery): Observable<Page<DoctorResponse>> {
    return this.api.get<Page<DoctorResponse>>(ENDPOINTS.doctors.list, { ...query });
  }

  searchDoctors(keyword: string, query: PageQuery): Observable<Page<DoctorResponse>> {
    return this.api.get<Page<DoctorResponse>>(ENDPOINTS.doctors.search, { keyword, ...query });
  }

  createDoctor(body: CreateDoctorRequest): Observable<DoctorResponse> {
    return this.api.post<DoctorResponse>(ENDPOINTS.doctors.list, body);
  }

  updateDoctor(id: number, body: UpdateDoctorRequest): Observable<DoctorResponse> {
    return this.api.put<DoctorResponse>(ENDPOINTS.doctors.byId(id), body);
  }

  deleteDoctor(id: number): Observable<void> {
    return this.api.delete<void>(ENDPOINTS.doctors.byId(id));
  }

  /* ---- Managers ---- */

  listManagers(query: PageQuery): Observable<Page<ManagerResponse>> {
    return this.api.get<Page<ManagerResponse>>(ENDPOINTS.managers.list, { ...query });
  }

  searchManagers(keyword: string, query: PageQuery): Observable<Page<ManagerResponse>> {
    return this.api.get<Page<ManagerResponse>>(ENDPOINTS.managers.search, { keyword, ...query });
  }

  createManager(body: CreateManagerRequest): Observable<ManagerResponse> {
    return this.api.post<ManagerResponse>(ENDPOINTS.managers.list, body);
  }

  updateManager(id: number, body: UpdateManagerRequest): Observable<ManagerResponse> {
    return this.api.put<ManagerResponse>(ENDPOINTS.managers.byId(id), body);
  }

  deleteManager(id: number): Observable<void> {
    return this.api.delete<void>(ENDPOINTS.managers.byId(id));
  }
}
