import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { DirectoryService } from '../clinical/services/insights.service';
import { DoctorResponse } from '../../core/models/domain.models';

/**
 * Resolves the signed-in doctor's profile (and thus doctorId) once per session.
 * The backend keys doctor data on doctorId, but the session only carries the
 * userId — so we look up GET /api/doctors/by-user/{userId} and cache it. Pages
 * that need the doctorId subscribe to {@link profile}. If the user has no
 * doctor row, the observable errors and pages show a clear message.
 */
@Injectable({ providedIn: 'root' })
export class DoctorContextService {
  private readonly auth = inject(AuthService);
  private readonly directory = inject(DirectoryService);
  private cached$?: Observable<DoctorResponse>;

  profile(): Observable<DoctorResponse> {
    if (!this.cached$) {
      const userId = this.auth.user()?.userId;
      if (userId == null) {
        return throwError(() => new Error('No authenticated user.'));
      }
      this.cached$ = this.directory.myDoctorProfile(userId).pipe(shareReplay(1));
    }
    return this.cached$;
  }
}
