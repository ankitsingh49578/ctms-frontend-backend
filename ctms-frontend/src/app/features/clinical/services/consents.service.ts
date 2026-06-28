import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ENDPOINTS } from '../../../core/constants/api-endpoints';
import { ConsentResponse, CreateConsentRequest } from '../../../core/models/domain.models';

/**
 * ConsentController (/api/consents). Create/manage is CLINICAL_MANAGER only;
 * the trial-scoped read also allows TRIAL_MANAGER. (Participants act on their
 * own consents through the portal controller, not here.)
 */
@Injectable({ providedIn: 'root' })
export class ConsentService {
  private readonly api = inject(ApiService);

  create(body: CreateConsentRequest): Observable<ConsentResponse> {
    return this.api.post<ConsentResponse>(ENDPOINTS.consents.create, body);
  }
  get(id: number): Observable<ConsentResponse> {
    return this.api.get<ConsentResponse>(ENDPOINTS.consents.byId(id));
  }
  sign(id: number): Observable<ConsentResponse> {
    return this.api.post<ConsentResponse>(ENDPOINTS.consents.sign(id));
  }
  decline(id: number): Observable<ConsentResponse> {
    return this.api.post<ConsentResponse>(ENDPOINTS.consents.decline(id));
  }
  withdraw(id: number): Observable<ConsentResponse> {
    return this.api.post<ConsentResponse>(ENDPOINTS.consents.withdraw(id));
  }
  forPatient(patientId: number): Observable<ConsentResponse[]> {
    return this.api.get<ConsentResponse[]>(ENDPOINTS.consents.byPatient(patientId));
  }
  forTrial(trialId: number): Observable<ConsentResponse[]> {
    return this.api.get<ConsentResponse[]>(ENDPOINTS.consents.byTrial(trialId));
  }
}
