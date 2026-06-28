import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { DoctorResponse, ChangePasswordRequest } from '../../../core/models/domain.models';

export interface UpdateDoctorProfileRequest {
  phone?: string;
  address?: string;
  profileImage?: string;
  emergencyContact?: string;
}

@Injectable({ providedIn: 'root' })
export class DoctorProfileService {
  private readonly api = inject(ApiService);

  getProfile(): Observable<DoctorResponse> {
    return this.api.get<DoctorResponse>('/api/doctors/profile');
  }

  updateProfile(body: UpdateDoctorProfileRequest): Observable<DoctorResponse> {
    return this.api.put<DoctorResponse>('/api/doctors/profile', body);
  }

  changePassword(body: ChangePasswordRequest): Observable<void> {
    return this.api.post<void>('/api/doctors/change-password', body);
  }
}
