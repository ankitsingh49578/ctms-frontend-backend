import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ENDPOINTS } from '../../../core/constants/api-endpoints';
import { Page, PageQuery } from '../../../core/models/api.models';
import { AuditLogResponse } from '../../../core/models/domain.models';

/**
 * ADMIN-only system administration surface:
 *  - Audit trail   (com.ctms.controller.AuditLogController)
 *
 * The audit endpoints return a
 * plain List (capped server-side, max 500) rather than a Spring Page.
 */
@Injectable({ providedIn: 'root' })
export class AdminSystemService {
  private readonly api = inject(ApiService);

  /* ---- Audit logs ---- */

  /** GET /api/audit-logs?limit — most recent entries (default 50, server caps at 500). */
  recentAuditLogs(limit = 50): Observable<AuditLogResponse[]> {
    return this.api.get<AuditLogResponse[]>(ENDPOINTS.auditLogs.list, { limit });
  }

  /** GET /api/audit-logs/user/{userId} — full trail recorded for one user. */
  auditLogsForUser(userId: number): Observable<AuditLogResponse[]> {
    return this.api.get<AuditLogResponse[]>(ENDPOINTS.auditLogs.byUser(userId));
  }


}
