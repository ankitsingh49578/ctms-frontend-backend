import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ENDPOINTS } from '../../../core/constants/api-endpoints';
import { CreateNotificationRequest, NotificationResponse } from '../../../core/models/domain.models';

/**
 * Non-portal notifications surface (com.ctms.controller.NotificationController).
 * Sending is gated to TM/CM and per-user reads to ADMIN-or-self; an ADMIN login
 * satisfies both via the role hierarchy. (Participants read their own feed
 * through the separate /api/portal endpoints, not this controller.)
 */
@Injectable({ providedIn: 'root' })
export class NotificationAdminService {
  private readonly api = inject(ApiService);

  /** POST /api/notifications — deliver a notification to a user. */
  send(body: CreateNotificationRequest): Observable<NotificationResponse> {
    return this.api.post<NotificationResponse>(ENDPOINTS.notifications.create, body);
  }

  /** GET /api/notifications/user/{userId} — full feed for a user. */
  forUser(userId: number): Observable<NotificationResponse[]> {
    return this.api.get<NotificationResponse[]>(ENDPOINTS.notifications.byUser(userId));
  }

  /** GET /api/notifications/user/{userId}/unread — unread feed for a user. */
  unreadForUser(userId: number): Observable<NotificationResponse[]> {
    return this.api.get<NotificationResponse[]>(ENDPOINTS.notifications.unreadByUser(userId));
  }

  /** PUT /api/notifications/{id}/read — mark a single notification read. */
  markRead(id: number): Observable<NotificationResponse> {
    return this.api.put<NotificationResponse>(ENDPOINTS.notifications.markRead(id), {});
  }
}
