import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ENDPOINTS } from '../../../core/constants/api-endpoints';
import { Page, PageQuery } from '../../../core/models/api.models';
import {
  ConsentResponse,
  CreateEnrollmentRequest, CreatePatientRequest, EnrollmentResponse,
  PatientResponse, ParticipantVisitSummaryResponse, TestResultResponse, UpdateEnrollmentStatusRequest, UpdatePatientRequest,
  VisitResponse,
} from '../../../core/models/domain.models';

/**
 * PatientController (/api/patients). All read/write here is gated to
 * TRIAL_MANAGER and CLINICAL_MANAGER (single-patient GET also allows an
 * assigned doctor / the patient themselves via AccessGuard).
 */
@Injectable({ providedIn: 'root' })
export class PatientService {
  private readonly api = inject(ApiService);

  list(query: PageQuery): Observable<Page<PatientResponse>> {
    return this.api.get<Page<PatientResponse>>(ENDPOINTS.patients.list, { ...query });
  }
  search(keyword: string, query: PageQuery): Observable<Page<PatientResponse>> {
    return this.api.get<Page<PatientResponse>>(ENDPOINTS.patients.search, { keyword, ...query });
  }
  count(): Observable<number> {
    return this.api.get<number>(ENDPOINTS.patients.count);
  }
  get(id: number): Observable<PatientResponse> {
    return this.api.get<PatientResponse>(ENDPOINTS.patients.byId(id));
  }
  create(body: CreatePatientRequest): Observable<PatientResponse> {
    return this.api.post<PatientResponse>(ENDPOINTS.patients.list, body);
  }
  update(id: number, body: UpdatePatientRequest): Observable<PatientResponse> {
    return this.api.put<PatientResponse>(ENDPOINTS.patients.byId(id), body);
  }
  verify(id: number): Observable<PatientResponse> {
    return this.api.post<PatientResponse>(ENDPOINTS.patients.verify(id));
  }
  enrollments(id: number): Observable<EnrollmentResponse[]> {
    return this.api.get<EnrollmentResponse[]>(ENDPOINTS.patients.enrollments(id));
  }
  visitSummary(id: number): Observable<ParticipantVisitSummaryResponse> {
    return this.api.get<ParticipantVisitSummaryResponse>(ENDPOINTS.patients.visitSummary(id));
  }
  consents(id: number): Observable<ConsentResponse[]> {
    return this.api.get<ConsentResponse[]>(ENDPOINTS.consents.byPatient(id));
  }
  visits(id: number): Observable<Page<VisitResponse>> {
    return this.api.get<Page<VisitResponse>>(ENDPOINTS.visits.byPatient(id));
  }
  testResults(id: number): Observable<TestResultResponse[]> {
    return this.api.get<TestResultResponse[]>(ENDPOINTS.testResults.byPatient(id));
  }

}

/**
 * EnrollmentController (/api/enrollments). enroll + status are
 * TRIAL_MANAGER / CLINICAL_MANAGER.
 */
@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private readonly api = inject(ApiService);

  enroll(body: CreateEnrollmentRequest): Observable<EnrollmentResponse> {
    return this.api.post<EnrollmentResponse>(ENDPOINTS.enrollments.create, body);
  }
  get(id: number): Observable<EnrollmentResponse> {
    return this.api.get<EnrollmentResponse>(ENDPOINTS.enrollments.byId(id));
  }
  getByTrial(trialId: number, query: PageQuery): Observable<Page<EnrollmentResponse>> {
    return this.api.get<Page<EnrollmentResponse>>(ENDPOINTS.enrollments.byTrial(trialId), { ...query });
  }
  updateStatus(id: number, body: UpdateEnrollmentStatusRequest): Observable<EnrollmentResponse> {
    return this.api.put<EnrollmentResponse>(ENDPOINTS.enrollments.status(id), body);
  }
}
