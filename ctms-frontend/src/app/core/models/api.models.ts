/**
 * The standard response envelope returned by EVERY CTMS endpoint
 * (com.ctms.dto.ApiResponse). Null fields are omitted server-side, so `data`,
 * `errors` and `path` are optional on the wire.
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
  path?: string;
  timestamp?: string;
}

/**
 * Spring Data `Page<T>` as serialized by the backend's default Jackson config
 * (the controllers return `Page<T>` directly inside ApiResponse.data). Only the
 * fields the UI consumes are typed here.
 */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // zero-based current page index
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

/** Query params accepted by the backend's `Pageable` endpoints. */
export interface PageQuery {
  page?: number; // zero-based
  size?: number;
  /** e.g. 'scheduledDate,desc' or 'trialId,asc'. */
  sort?: string;
}

export function emptyPage<T>(): Page<T> {
  return {
    content: [], totalElements: 0, totalPages: 0, number: 0, size: 0,
    first: true, last: true, numberOfElements: 0, empty: true,
  };
}
