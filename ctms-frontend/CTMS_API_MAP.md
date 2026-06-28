# CTMS API Map — backend endpoints vs frontend coverage

This is the inventory of the backend's REST surface (19 controllers) and exactly which
parts this Angular frontend drives. Endpoint paths mirror `src/app/core/constants/api-endpoints.ts`.

Legend: **[UI]** = wired into a screen in this build · **[dropdown]** = used to populate a
control · **[available]** = mapped in the endpoint registry for future work, no UI yet.

Every endpoint returns the `ApiResponse<T>` envelope. "(paged)" means `data` is a Spring
`Page<T>` and the endpoint accepts `page` / `size` / `sort`.

---

## AuthController — `/api/auth`
| Method | Path | Access | Coverage |
|---|---|---|---|
| POST | `/login` | public | **[UI]** login page |
| POST | `/logout` | authenticated | **[UI]** topbar sign-out |
| GET | `/me` | authenticated | **[UI]** session bootstrap |

> No forgot-password, reset, refresh, or change-password endpoints exist on this controller.

## PortalController — `/api/portal` (role: PARTICIPANT) — fully implemented
| Method | Path | Coverage |
|---|---|---|
| GET | `/me` | **[UI]** profile |
| PUT | `/me` | **[UI]** profile edit |
| PUT | `/me/password` | **[UI]** change password |
| GET | `/me/dashboard` | **[UI]** dashboard |
| GET | `/trials` (paged) | **[UI]** browse trials |
| GET | `/trials/{id}` | **[UI]** trial detail |
| GET | `/me/enrollments` | **[UI]** applications |
| POST | `/me/enrollments` | **[UI]** apply to trial |
| DELETE | `/me/enrollments/{id}` | **[UI]** withdraw |
| GET | `/me/consents` | **[UI]** consents |
| POST | `/me/consents/{id}/sign` | **[UI]** sign |
| POST | `/me/consents/{id}/decline` | **[UI]** decline |
| GET | `/me/visits` (paged) | **[UI]** visits |
| GET | `/me/test-results` | **[UI]** results |
| GET | `/me/adverse-events` | **[UI]** adverse events |
| GET | `/me/documents` | **[UI]** documents (list only — no download endpoint exists) |
| GET | `/me/notifications` (paged) | **[UI]** notifications |
| GET | `/me/notifications/unread` | **[UI]** unread filter / badge count |
| PUT | `/me/notifications/{id}/read` | **[UI]** mark read |

## UserController — `/api/users` (role: ADMIN) — fully implemented
| Method | Path | Coverage |
|---|---|---|
| GET | `/` (paged) | **[UI]** user list |
| GET | `/search?keyword` (paged) | **[UI]** search |
| GET | `/count` | **[UI]** dashboard metric |
| POST | `/` | **[UI]** create user |
| GET | `/{id}` | **[available]** |
| PUT | `/{id}` | **[UI]** edit user |
| DELETE | `/{id}` | **[UI]** delete |
| POST | `/{id}/change-password` | **[UI]** reset password |
| POST | `/{id}/change-role` | **[UI]** change role |
| POST | `/{id}/enable` | **[UI]** enable |
| POST | `/{id}/disable` | **[UI]** disable |

## RoleController — `/api/roles` (role: ADMIN) — now driven by the Roles page
| Method | Path | Coverage |
|---|---|---|
| GET | `/` (paged) | **[UI]** Roles & Access page · **[dropdown]** role picker in user dialogs |
| POST | `/` | **[UI]** create role |
| PUT | `/{id}` | **[UI]** edit role (name / description / status) |
| DELETE | `/{id}` | **[UI]** delete role (backend rejects roles in use) |
| GET | `/search`, `/count`, `/by-name`, `/exists`, `/{id}` | **[available]** |

> The Roles page edits name/description/status only. `permissionIds` is accepted
> by the API but never consulted for authorization (access is by role **name**),
> so no permission editor is surfaced.

---

## Staff controllers — now driven by the Doctor / Clinical Mgr / Trial Mgr portals

Access column shows the backend `@PreAuthorize` gate. **TM** = Trial Manager,
**CM** = Clinical Manager, **DR** = Doctor. "own" = ownership predicate via `AccessGuard`.

> **Path note:** scoped-collection routes are written `/by-trial`, `/by-doctor`,
> `/by-patient` below as shorthand. The live routes (in `api-endpoints.ts` and on the
> controllers) are `/{resource}/trial/{id}`, `/{resource}/doctor/{id}`,
> `/{resource}/patient/{id}` — e.g. `GET /api/visits/doctor/{doctorId}`.

### TrialController — `/api/trials`
| Method | Path | Access | Coverage |
|---|---|---|---|
| GET | `/` (paged), `/search`, `/count`, `/{id}` | TM·CM·DR | **[UI]** Trials (CM/TM manage, DR read-only) |
| POST | `/`, PUT `/{id}`, PUT `/{id}/status` | TM·CM | **[UI]** create / edit / change status |
| POST | `/{id}/assign-manager` | TM·CM | **[UI]** assign-manager dialog (by manager ID) |
| GET | `/{id}/assignments` | TM / trial's mgr | **[UI]** assignments list in that dialog |
| DELETE | `/{id}` | ADMIN | **[available]** (not surfaced in these portals) |

### PatientController — `/api/patients`
| Method | Path | Access | Coverage |
|---|---|---|---|
| GET | `/` (paged), `/search`, `/count` | TM·CM | **[UI]** Patients · **[dropdown]** visit/consent/AE forms |
| GET | `/{id}`, `/{id}/enrollments` | TM·CM·own | **[UI]** enrollments dialog |
| POST | `/`, PUT `/{id}`, POST `/{id}/verify` | TM·CM | **[UI]** register / edit / verify |

### EnrollmentController — `/api/enrollments`
| Method | Path | Access | Coverage |
|---|---|---|---|
| POST | `/`, PUT `/{id}/status` | TM·CM | **[UI]** enroll + status (enrollments dialog) |
| GET | `/{id}` | TM·CM·DR·own | **[available]** |

### ConsentController — `/api/consents` (Clinical Manager portal)
| Method | Path | Access | Coverage |
|---|---|---|---|
| POST | `/`, sign/decline/withdraw | CM (or own) | **[UI]** Consents page |
| GET | `/by-trial/{id}` | TM·CM | **[UI]** Consents (trial-scoped list) |
| GET | `/{id}`, `/by-patient/{id}` | CM·own | **[available]** |

### VisitController — `/api/visits`
| Method | Path | Access | Coverage |
|---|---|---|---|
| POST | `/`, reschedule, cancel | TM·CM | **[UI]** schedule / reschedule / cancel (CM·TM) |
| PUT | `/{id}/complete`, `/{id}/missed` | CM / visit's DR | **[UI]** CM Visits **and** Doctor My-Visits |
| GET | `/by-trial/{id}` (paged) | TM·CM·DR | **[UI]** CM/TM Visits |
| GET | `/by-doctor/{id}` | TM·CM·self | **[UI]** Doctor My-Visits · **[dropdown]** result form |
| GET | `/upcoming` | TM·CM·DR | **[UI]** Doctor dashboard metric |
| GET | `/by-patient/{id}`, `/{id}`, `/count` | varies | **[available]** |

### TestResultController — `/api/test-results` (Doctor portal)
| Method | Path | Access | Coverage |
|---|---|---|---|
| GET | `/` (paged), `/search`, `/count` | DR | **[UI]** Doctor Test Results |
| POST | `/`, PUT `/{id}/status` | DR | **[UI]** record / update status |
| GET | `/{id}`, by patient/visit | DR·own | **[available]** |

### AdverseEventController — `/api/adverse-events`
| Method | Path | Access | Coverage |
|---|---|---|---|
| POST | `/`, PUT `/{id}/status` | CM·DR | **[UI]** report + status (CM page & Doctor page) |
| GET | `/by-trial/{id}` | TM·CM·DR | **[UI]** CM/TM (read-only for TM) & Doctor |
| GET | `/by-patient/{id}`, `/{id}`, `/count` | varies | **[available]** |

### DoctorController / ManagerController — `/api/doctors`, `/api/managers`
| Method | Path | Access | Coverage |
|---|---|---|---|
| GET | `/doctors` (paged) | TM·CM | **[dropdown]** doctor picker when scheduling a visit |
| GET | `/doctors/by-user/{userId}` | ADMIN·self | **[UI]** resolves the signed-in doctor's `doctorId` |
| GET | `/managers/*`, `/doctors/{id}`, … | mostly ADMIN | **[available]** (directory is ADMIN-gated — see README §2.2) |

### AnalyticsController / ReportController — `/api/analytics`, `/api/reports`
| Method | Path | Access | Coverage |
|---|---|---|---|
| GET | `/analytics/dashboard`, `/analytics/latest` | TM·CM | **[UI]** CM/TM dashboard (+ completion/compliance bars) |
| GET | `/reports` (paged) | TM·CM·DR | **[UI]** Reports page |
| POST | `/reports/generate` | TM·CM | **[UI]** generate-report dialog |
| POST | `/analytics/snapshot` | ADMIN | **[available]** |

### AuditLogController / SettingController — `/api/audit-logs`, `/api/settings` (role: ADMIN) — now built
| Method | Path | Coverage |
|---|---|---|
| GET | `/audit-logs?limit` | **[UI]** Audit Trail page (recent, capped at 500) |
| GET | `/audit-logs/user/{userId}` | **[UI]** per-user filter on the Audit Trail page |
| GET | `/settings` (paged) | **[UI]** System Settings page |
| PUT | `/settings` | **[UI]** create/update a setting (upsert by key) |
| DELETE | `/settings/{id}` | **[UI]** delete a setting |
| GET | `/settings/count`, `/exists`, `/key/{key}`, `/{id}` | **[available]** |

### DoctorController / ManagerController — `/api/doctors`, `/api/managers` — now built
| Method | Path | Gate | Coverage |
|---|---|---|---|
| GET | `/doctors` (paged), `/doctors/search` | TM/CM | **[UI]** Doctor Directory (admin inherits TM/CM) · **[picker]** visit form |
| POST/PUT/DELETE | `/doctors`, `/doctors/{id}` | ADMIN | **[UI]** create / edit / delete doctor |
| GET | `/managers` (paged), `/managers/search` | ADMIN | **[UI]** Manager Directory |
| POST/PUT/DELETE | `/managers`, `/managers/{id}` | ADMIN | **[UI]** create / edit / delete manager |
| GET | `/{doctors,managers}/by-user/{userId}`, `/count` | ADMIN/self | **[available]** / used for name resolution |

### NotificationController — `/api/notifications` — now built
| Method | Path | Gate | Coverage |
|---|---|---|---|
| POST | `/notifications` | TM/CM | **[UI]** send notification (admin inherits TM/CM) |
| GET | `/notifications/user/{userId}` | ADMIN/self | **[UI]** Notifications console — feed for a user |
| GET | `/notifications/user/{userId}/unread` | ADMIN/self | **[UI]** unread filter |
| PUT | `/notifications/{id}/read` | ADMIN/own | **[UI]** mark read |

> Participants read their own feed through the separate `/api/portal` endpoints
> (already built in the participant portal), not through this controller.

### Still no UI (mapped in the registry only)
- **DocumentController** `/api/documents` — intentionally **not** built. The controller
  exposes document *metadata* only; there is no binary upload/download endpoint, so a
  documents screen could list records but never open a file. Building it would imply a
  capability the backend does not have. (The participant portal already lists documents
  and states the same limitation.)

---

## Authorization model (as implemented in the backend)

- Stateless; CSRF disabled; deny-by-default `SecurityFilterChain`; `@PreAuthorize` on every
  controller method.
- A custom filter resolves the opaque Bearer token to a session and sets authorities of the
  form `ROLE_<ENUMKEY>`.
- Role hierarchy: `SUPER_ADMIN > ADMIN > { TRIAL_MANAGER, CLINICAL_MANAGER, DOCTOR, PARTICIPANT }`.
- Dev-only bypass flag `ctms.security.enabled=false` disables the chain (with a startup
  warning). Leave it **true** for any realistic demo.

The frontend mirrors this with route guards (`authGuard`, `roleGuard`) and by mapping the
returned DB role name to a canonical key (`"Manager"` → `TRIAL_MANAGER`). Guards are a UX
convenience only — the backend remains the real authority on every call.
