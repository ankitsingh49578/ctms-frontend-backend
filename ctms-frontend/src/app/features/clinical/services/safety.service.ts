import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ENDPOINTS } from '../../../core/constants/api-endpoints';
import { Page, PageQuery } from '../../../core/models/api.models';
import {
  AdverseEventResponse, RecordTestResultRequest, ReportAdverseEventRequest,
  TestResultResponse, UpdateAdverseEventStatusRequest, UpdateTestResultStatusRequest,
} from '../../../core/models/domain.models';

/**
 * AdverseEventController (/api/adverse-events). report + status change are
 * CLINICAL_MANAGER / DOCTOR; trial-scoped read additionally allows
 * TRIAL_MANAGER (oversight); severity count is the two manager roles.
 */
@Injectable({ providedIn: 'root' })
export class AdverseEventService {
  private readonly api = inject(ApiService);

  report(body: ReportAdverseEventRequest): Observable<AdverseEventResponse> {
    return this.api.post<AdverseEventResponse>(ENDPOINTS.adverseEvents.create, body);
  }
  get(id: number): Observable<AdverseEventResponse> {
    return this.api.get<AdverseEventResponse>(ENDPOINTS.adverseEvents.byId(id));
  }
  updateStatus(id: number, body: UpdateAdverseEventStatusRequest): Observable<AdverseEventResponse> {
    return this.api.put<AdverseEventResponse>(ENDPOINTS.adverseEvents.status(id), body);
  }
  forTrial(trialId: number): Observable<AdverseEventResponse[]> {
    return this.api.get<AdverseEventResponse[]>(ENDPOINTS.adverseEvents.byTrial(trialId));
  }
  forPatient(patientId: number): Observable<AdverseEventResponse[]> {
    return this.api.get<AdverseEventResponse[]>(ENDPOINTS.adverseEvents.byPatient(patientId));
  }
  countBySeverity(severity: string): Observable<number> {
    return this.api.get<number>(ENDPOINTS.adverseEvents.count, { severity });
  }
}

/**
 * TestResultController (/api/test-results). The list / search / count / record /
 * status endpoints are DOCTOR-only; patient/visit reads also allow an assigned
 * doctor or the patient. (Managers have no test-result access here.)
 */
@Injectable({ providedIn: 'root' })
export class TestResultService {
  private readonly api = inject(ApiService);

  list(query: PageQuery): Observable<Page<TestResultResponse>> {
    return this.api.get<Page<TestResultResponse>>(ENDPOINTS.testResults.create, { ...query });
  }
  search(params: { testName?: string; status?: string } & PageQuery): Observable<Page<TestResultResponse>> {
    return this.api.get<Page<TestResultResponse>>(ENDPOINTS.testResults.search, { ...params });
  }
  patientSummaries(params: { keyword?: string } & PageQuery): Observable<Page<import('../../../core/models/domain.models').PatientTestResultSummaryResponse>> {
    return this.api.get<Page<import('../../../core/models/domain.models').PatientTestResultSummaryResponse>>(
      '/api/test-results/patient-summaries', { ...params }
    );
  }
  count(): Observable<number> {
    return this.api.get<number>(ENDPOINTS.testResults.count);
  }
  get(id: number): Observable<TestResultResponse> {
    return this.api.get<TestResultResponse>(ENDPOINTS.testResults.byId(id));
  }
  record(body: RecordTestResultRequest): Observable<TestResultResponse> {
    return this.api.post<TestResultResponse>(ENDPOINTS.testResults.create, body);
  }
  updateStatus(id: number, body: UpdateTestResultStatusRequest): Observable<TestResultResponse> {
    return this.api.put<TestResultResponse>(ENDPOINTS.testResults.status(id), body);
  }
  forPatient(patientId: number): Observable<TestResultResponse[]> {
    return this.api.get<TestResultResponse[]>(ENDPOINTS.testResults.byPatient(patientId));
  }
  forVisit(visitId: number): Observable<TestResultResponse[]> {
    return this.api.get<TestResultResponse[]>(ENDPOINTS.testResults.byVisit(visitId));
  }
}
