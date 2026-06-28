import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ENDPOINTS } from '../../../core/constants/api-endpoints';
import { Page, PageQuery } from '../../../core/models/api.models';
import {
  AdverseEventResponse, ApplyToTrialRequest, ChangePasswordRequest, ConsentResponse,
  EnrollmentResponse, NotificationResponse, ParticipantDashboardResponse,
  PatientResponse, TestResultResponse, TrialResponse, UpdateMyProfileRequest, VisitResponse, ParticipantReportAdverseEventRequest
} from '../../../core/models/domain.models';

/**
 * Participant self-service portal (com.ctms.controller.PortalController).
 * Every call is scoped server-side to the authenticated participant — there is
 * no patient id to pass, so a participant can never reach another's data.
 */
@Injectable({ providedIn: 'root' })
export class PortalService {
  private readonly api = inject(ApiService);

  /* profile & account */
  myProfile(): Observable<PatientResponse> {
    return this.api.get<PatientResponse>(ENDPOINTS.portal.me);
  }
  updateMyProfile(body: UpdateMyProfileRequest): Observable<PatientResponse> {
    return this.api.put<PatientResponse>(ENDPOINTS.portal.me, body);
  }
  changeMyPassword(body: ChangePasswordRequest): Observable<void> {
    return this.api.put<void>(ENDPOINTS.portal.password, body);
  }
  dashboard(): Observable<ParticipantDashboardResponse> {
    return this.api.get<ParticipantDashboardResponse>(ENDPOINTS.portal.dashboard);
  }

  /* trials & enrollment */
  browseTrials(query: PageQuery): Observable<Page<TrialResponse>> {
    return this.api.get<Page<TrialResponse>>(ENDPOINTS.portal.trials, { ...query });
  }
  getTrial(id: number): Observable<TrialResponse> {
    return this.api.get<TrialResponse>(ENDPOINTS.portal.trial(id));
  }
  myEnrollments(): Observable<EnrollmentResponse[]> {
    return this.api.get<EnrollmentResponse[]>(ENDPOINTS.portal.enrollments);
  }
  applyToTrial(body: ApplyToTrialRequest): Observable<EnrollmentResponse> {
    return this.api.post<EnrollmentResponse>(ENDPOINTS.portal.enrollments, body);
  }
  withdraw(enrollmentId: number): Observable<void> {
    return this.api.delete<void>(ENDPOINTS.portal.enrollment(enrollmentId));
  }

  /* consent */
  myConsents(): Observable<ConsentResponse[]> {
    return this.api.get<ConsentResponse[]>(ENDPOINTS.portal.consents);
  }
  signConsent(consentId: number): Observable<void> {
    return this.api.post<void>(ENDPOINTS.portal.signConsent(consentId));
  }
  declineConsent(consentId: number): Observable<void> {
    return this.api.post<void>(ENDPOINTS.portal.declineConsent(consentId));
  }

  /* clinical records */
  myVisits(query: PageQuery): Observable<Page<VisitResponse>> {
    return this.api.get<Page<VisitResponse>>(ENDPOINTS.portal.visits, { ...query });
  }
  myTestResults(): Observable<TestResultResponse[]> {
    return this.api.get<TestResultResponse[]>(ENDPOINTS.portal.testResults);
  }
  myAdverseEvents(): Observable<AdverseEventResponse[]> {
    return this.api.get<AdverseEventResponse[]>(ENDPOINTS.portal.adverseEvents);
  }
  getAdverseEvent(id: number): Observable<AdverseEventResponse> {
    return this.api.get<AdverseEventResponse>(ENDPOINTS.portal.adverseEvent(id));
  }
  reportAdverseEvent(body: ParticipantReportAdverseEventRequest): Observable<AdverseEventResponse> {
    return this.api.post<AdverseEventResponse>(ENDPOINTS.portal.adverseEvents, body);
  }


  /* notifications */
  myNotifications(query: PageQuery): Observable<Page<NotificationResponse>> {
    return this.api.get<Page<NotificationResponse>>(ENDPOINTS.portal.notifications, { ...query });
  }
  myUnreadNotifications(): Observable<NotificationResponse[]> {
    return this.api.get<NotificationResponse[]>(ENDPOINTS.portal.unreadNotifications);
  }
  markNotificationRead(notificationId: number): Observable<void> {
    return this.api.put<void>(ENDPOINTS.portal.markNotificationRead(notificationId));
  }
}
