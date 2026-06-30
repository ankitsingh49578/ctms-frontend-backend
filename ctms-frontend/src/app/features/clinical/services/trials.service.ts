import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ENDPOINTS } from '../../../core/constants/api-endpoints';
import { Page, PageQuery } from '../../../core/models/api.models';
import {
  AssignManagerRequest, CreateTrialRequest, TrialAssignmentResponse,
  TrialResponse, UpdateTrialRequest, TrialDetailsResponse
} from '../../../core/models/domain.models';

/**
 * TrialController (/api/trials). Read access: TRIAL_MANAGER, CLINICAL_MANAGER,
 * DOCTOR. Write (create/update/status/assign): TRIAL_MANAGER, CLINICAL_MANAGER.
 */
@Injectable({ providedIn: 'root' })
export class TrialService {
  private readonly api = inject(ApiService);

  list(query: PageQuery): Observable<Page<TrialResponse>> {
    return this.api.get<Page<TrialResponse>>(ENDPOINTS.trials.list, { ...query });
  }
  search(keyword: string, query: PageQuery): Observable<Page<TrialResponse>> {
    return this.api.get<Page<TrialResponse>>(ENDPOINTS.trials.search, { keyword, ...query });
  }
  countByStatus(status: string): Observable<number> {
    return this.api.get<number>(ENDPOINTS.trials.count, { status });
  }
  get(id: number): Observable<TrialResponse> {
    return this.api.get<TrialResponse>(ENDPOINTS.trials.byId(id));
  }
  getDetails(id: number): Observable<TrialDetailsResponse> {
    return this.api.get<TrialDetailsResponse>(ENDPOINTS.trials.details(id));
  }
  create(body: CreateTrialRequest): Observable<TrialResponse> {
    return this.api.post<TrialResponse>(ENDPOINTS.trials.list, body);
  }
  update(id: number, body: UpdateTrialRequest): Observable<TrialResponse> {
    return this.api.put<TrialResponse>(ENDPOINTS.trials.byId(id), body);
  }
  updateStatus(id: number, status: string): Observable<TrialResponse> {
    return this.api.put<TrialResponse>(`${ENDPOINTS.trials.status(id)}?status=${encodeURIComponent(status)}`, {});
  }
  delete(id: number): Observable<void> {
    return this.api.delete<void>(ENDPOINTS.trials.byId(id));
  }
  assignManager(id: number, body: AssignManagerRequest): Observable<TrialAssignmentResponse> {
    return this.api.post<TrialAssignmentResponse>(ENDPOINTS.trials.assignManager(id), body);
  }
  assignments(id: number): Observable<TrialAssignmentResponse[]> {
    return this.api.get<TrialAssignmentResponse[]>(ENDPOINTS.trials.assignments(id));
  }
}
