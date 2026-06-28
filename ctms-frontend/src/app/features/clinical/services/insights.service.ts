import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ENDPOINTS } from '../../../core/constants/api-endpoints';
import { Page, PageQuery } from '../../../core/models/api.models';
import {
  AnalyticsResponse, DashboardResponse, DoctorResponse, GenerateReportRequest,
  ManagerResponse, ReportResponse,
} from '../../../core/models/domain.models';

/**
 * AnalyticsController (/api/analytics) + ReportController (/api/reports).
 * latest/dashboard are TRIAL_MANAGER + CLINICAL_MANAGER; report list also
 * allows DOCTOR; generate is the two manager roles. (snapshot is ADMIN-only.)
 */
@Injectable({ providedIn: 'root' })
export class InsightsService {
  private readonly api = inject(ApiService);

  dashboard(): Observable<DashboardResponse> {
    return this.api.get<DashboardResponse>(ENDPOINTS.analytics.dashboard);
  }
  latest(): Observable<AnalyticsResponse> {
    return this.api.get<AnalyticsResponse>(ENDPOINTS.analytics.latest);
  }
  listReports(query: PageQuery): Observable<Page<ReportResponse>> {
    return this.api.get<Page<ReportResponse>>(ENDPOINTS.reports.list, { ...query });
  }
  generateReport(body: GenerateReportRequest): Observable<ReportResponse> {
    return this.api.post<ReportResponse>(ENDPOINTS.reports.generate, body);
  }
}

/**
 * Directory lookups. DoctorController list/search are the two manager roles;
 * by-user is self-or-admin. Used to (a) resolve the signed-in doctor's own
 * doctorId and (b) populate doctor pickers when scheduling visits.
 */
@Injectable({ providedIn: 'root' })
export class DirectoryService {
  private readonly api = inject(ApiService);

  /** Resolve the signed-in doctor's profile (and thus doctorId) from their userId. */
  myDoctorProfile(userId: number): Observable<DoctorResponse> {
    return this.api.get<DoctorResponse>(ENDPOINTS.doctors.byUser(userId));
  }
  /** Resolve the signed-in manager's profile from their userId (managers table). */
  myManagerProfile(userId: number): Observable<ManagerResponse> {
    return this.api.get<ManagerResponse>(ENDPOINTS.managers.byUser(userId));
  }
  listDoctors(query: PageQuery): Observable<Page<DoctorResponse>> {
    return this.api.get<Page<DoctorResponse>>(ENDPOINTS.doctors.list, { ...query });
  }
  allDoctors(): Observable<DoctorResponse[]> {
    return this.api
      .get<Page<DoctorResponse>>(ENDPOINTS.doctors.list, { page: 0, size: 200, sort: 'doctorId,asc' })
      .pipe(map((p) => p.content));
  }
}
