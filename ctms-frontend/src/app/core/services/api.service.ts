import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';

type ParamValue = string | number | boolean | undefined | null;
export type QueryParams = Record<string, ParamValue>;

/**
 * Thin HTTP layer over the CTMS API. Every backend response is wrapped in
 * {@link ApiResponse}; these helpers unwrap `.data` so feature services work
 * with plain payloads. Error envelopes are handled centrally by errorInterceptor.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  get<T>(url: string, params?: QueryParams): Observable<T> {
    return this.http
      .get<ApiResponse<T>>(this.base + url, { params: this.toParams(params) })
      .pipe(map((r) => r.data));
  }

  getBaseUrl(): string {
    return this.base;
  }

  post<T>(url: string, body?: unknown): Observable<T> {
    return this.http.post<ApiResponse<T>>(this.base + url, body ?? {}).pipe(map((r) => r.data));
  }

  put<T>(url: string, body?: unknown): Observable<T> {
    return this.http.put<ApiResponse<T>>(this.base + url, body ?? {}).pipe(map((r) => r.data));
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(this.base + url).pipe(map((r) => r.data));
  }

  /** Returns the full envelope (e.g. when the success `message` matters). */
  postRaw<T>(url: string, body?: unknown): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(this.base + url, body ?? {});
  }

  private toParams(params?: QueryParams): HttpParams {
    let hp = new HttpParams();
    if (!params) return hp;
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        hp = hp.set(key, String(value));
      }
    }
    return hp;
  }
}
