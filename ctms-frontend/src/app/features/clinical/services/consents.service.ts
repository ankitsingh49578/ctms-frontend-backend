import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ENDPOINTS } from '../../../core/constants/api-endpoints';
import { ConsentResponse } from '../../../core/models/domain.models';
import { ApiResponse } from '../../../core/models/api.models';
import { environment } from '../../../../environments/environment';

/**
 * ConsentController (/api/consents). Create/manage is CLINICAL_MANAGER only;
 * the trial-scoped read also allows TRIAL_MANAGER. (Participants act on their
 * own consents through the portal controller, not here.)
 */
@Injectable({ providedIn: 'root' })
export class ConsentService {
  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);

  create(body: Record<string, any>, document?: File): Observable<ConsentResponse> {
    const formData = new FormData();
    formData.append('consent', new Blob([JSON.stringify(body)], { type: 'application/json' }));
    if (document) {
      formData.append('document', document, document.name);
    }
    return this.http.post<ApiResponse<ConsentResponse>>(
      environment.apiBaseUrl + ENDPOINTS.consents.create, formData
    ).pipe(map(r => r.data));
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

  /** Returns the full URL to download/view the consent document. */
  documentUrl(consentId: number): string {
    return environment.apiBaseUrl + ENDPOINTS.consents.document(consentId);
  }
}
