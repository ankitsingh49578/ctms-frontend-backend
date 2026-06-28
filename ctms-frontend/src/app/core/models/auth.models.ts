/** Credentials for POST /api/auth/login (com.ctms.dto.request.LoginRequest). */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Login payload (com.ctms.dto.response.AuthResponse). `token` is an OPAQUE
 * server-stored session token (NOT a JWT). `role` is the human role_name as
 * stored in the DB, e.g. "Manager", "Clinical Manager", "Admin".
 */
export interface AuthResponse {
  token: string;
  userId: number;
  username: string;
  email: string;
  role: string;
}

/** Current user (com.ctms.dto.response.UserResponse) from GET /api/auth/me. */
export interface UserResponse {
  userId: number;
  roleId: number;
  roleName: string;
  username: string;
  email: string;
  phone?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}
