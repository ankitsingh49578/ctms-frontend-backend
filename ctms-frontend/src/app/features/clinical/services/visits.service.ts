import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ENDPOINTS } from '../../../core/constants/api-endpoints';
import { Page, PageQuery } from '../../../core/models/api.models';
import {
  CompleteVisitRequest, CreateVisitRequest, RescheduleVisitRequest, VisitResponse,
} from '../../../core/models/domain.models';

/**
 * VisitController (/api/visits). Scheduling/reschedule/cancel are
 * TRIAL_MANAGER + CLINICAL_MANAGER; complete/missed are CLINICAL_MANAGER or the
 * visit's assigned doctor; reads vary (see controller @PreAuthorize).
 */
@Injectable({ providedIn: 'root' })
export class VisitService {
  private readonly api = inject(ApiService);

  schedule(body: CreateVisitRequest): Observable<VisitResponse> {
    return this.api.post<VisitResponse>(ENDPOINTS.visits.create, body);
  }
  get(id: number): Observable<VisitResponse> {
    return this.api.get<VisitResponse>(ENDPOINTS.visits.byId(id));
  }
  reschedule(id: number, body: RescheduleVisitRequest): Observable<VisitResponse> {
    return this.api.put<VisitResponse>(ENDPOINTS.visits.reschedule(id), body);
  }
  complete(id: number, body: CompleteVisitRequest): Observable<VisitResponse> {
    return this.api.put<VisitResponse>(ENDPOINTS.visits.complete(id), body);
  }
  markMissed(id: number): Observable<VisitResponse> {
    return this.api.put<VisitResponse>(ENDPOINTS.visits.missed(id), {});
  }
  cancel(id: number): Observable<VisitResponse> {
    return this.api.put<VisitResponse>(ENDPOINTS.visits.cancel(id), {});
  }
  forPatient(patientId: number, query: PageQuery): Observable<Page<VisitResponse>> {
    return this.api.get<Page<VisitResponse>>(ENDPOINTS.visits.byPatient(patientId), { ...query });
  }
  forTrial(trialId: number, query: PageQuery): Observable<Page<VisitResponse>> {
    return this.api.get<Page<VisitResponse>>(ENDPOINTS.visits.byTrial(trialId), { ...query });
  }
  byDoctor(doctorId: number): Observable<VisitResponse[]> {
    return this.api.get<VisitResponse[]>(ENDPOINTS.visits.byDoctor(doctorId));
  }
  upcoming(days?: number): Observable<VisitResponse[]> {
    return this.api.get<VisitResponse[]>(ENDPOINTS.visits.upcoming, days ? { days } : undefined);
  }
  countByStatus(status: string): Observable<number> {
    return this.api.get<number>(ENDPOINTS.visits.count, { status });
  }
}
