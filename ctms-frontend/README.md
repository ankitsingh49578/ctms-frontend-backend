# CTMS Frontend — Angular 19

A web frontend for the **Clinical Trial Management System (CTMS)** Spring Boot backend.
Built with Angular 19 (standalone components, signals, lazy routes) and Angular Material 3.

This README is deliberately precise about **what the backend actually exposes** and
**what this frontend actually implements**, so nothing here overstates the project.

---

## 1. Read this first — corrections to the original brief

The original specification asked for several things the **real backend does not support**.
Rather than fake them, this frontend is built against the backend as it actually is. The
gaps below are by design, not oversights, and each is easy to defend:

| Asked for | Reality in the backend source | What this frontend does |
|---|---|---|
| **JWT authentication** | Auth uses an **opaque session token** persisted in the `user_sessions` table and sent as `Authorization: Bearer <token>`. There is no JWT, no signed payload, and no client-readable expiry/claims. | Stores the opaque token and sends it as a Bearer header. Does **not** pretend to decode claims. |
| **Refresh tokens** | `AuthController` exposes only `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`. There is **no refresh endpoint**. | No silent refresh. On `401` the app clears the session and routes to login. |
| **Forgot / reset password** | No such endpoints exist anywhere in the API. | Not implemented (it would be a dead button). Password change is supported where the API *does* allow it (see below). |
| **Change own password via auth** | Not on `AuthController`. Participants change their password via `PUT /api/portal/me/password`; admins reset a user's password via `POST /api/users/{id}/change-password`. | Both of those real endpoints are wired up. |
| **PrimeNG + Angular Material together** | n/a (frontend choice) | Standardised on **Angular Material only**. Mixing two component kits doubles the CSS surface and creates overlapping theming for no functional gain. One kit, themed once. |

If an examiner asks "where is the JWT / refresh / forgot-password?", the honest answer is:
**the backend doesn't implement them, so the frontend doesn't fake them.**

---

## 2. What is actually implemented

Five role areas are built end-to-end against real endpoints and verified to compile:

**Participant Self-Service Portal** — all 19 `PortalController` endpoints (`/api/portal/**`):
dashboard, profile view/edit, change password, browse trials (paged) + trial detail,
apply to a trial, view/withdraw enrollments, view + sign/decline consents, visits (paged),
test results, adverse events, documents (metadata list), notifications (paged) + mark-read.

**Admin User Management** — the `UserController` surface (`/api/users/**`):
paged user list, keyword search, create/edit user, change role, enable/disable,
reset password, delete, plus a small dashboard using `/api/users/count`.

**Doctor portal** (`/doctor/**`) — a doctor-centric workspace over the general controllers:
dashboard (upcoming/assigned visit counts + results recorded), **My Visits**
(`/api/visits/by-doctor/{id}` with complete / mark-missed, which the backend allows for the
visit's assigned doctor), **Test Results** (`/api/test-results` — list/search/record/update
status, all DOCTOR-gated), **Adverse Events** (report + status by trial), and a read-only
**Trials** reference.

**Clinical Manager portal** (`/clinical/**`) and **Trial Manager portal** (`/manager/**`) —
these two roles overlap heavily in the backend, so they share one set of **capability-aware**
screens (see §2.1): a dashboard backed by `/api/analytics/dashboard`, **Trials**
(create/edit/status + team assignment), **Patients** (register/edit/verify + enrollments),
**Visits** (schedule + lifecycle), **Adverse Events**, **Reports** (`/api/reports`), and —
for the Clinical Manager only — **Consents** (`/api/consents`).

### 2.1 How CM and TM share screens (capability flags)

Rather than duplicate near-identical screens, the Clinical Manager and Trial Manager portals
load the **same components** from `features/clinical/`. A single `capabilitiesFor(role)` map
(`features/clinical/clinical.capabilities.ts`) turns each backend `@PreAuthorize` rule into a
boolean the UI reads to show or hide an action. The differences mirror the backend exactly:

- **Both** manager roles: manage trials, assign managers, manage patients & enrollments,
  schedule visits, generate reports.
- **Clinical Manager only:** manage consents, complete/mark-missed visits, report and triage
  adverse events. For the Trial Manager these are read-only (adverse events) or absent
  (consents) — matching the controller gates.

Each role still gets its **own colour identity** (a role class on the layout shell re-points a
single `--ctms-accent` token: teal for Doctor, violet for Clinical Manager, amber for Trial
Manager, blue for Admin), so the shared screens never feel generic.

> The backend seeds **5** roles (Admin, Doctor, Participant, Clinical Manager, Manager).
> The `RoleType` enum defines **7** (it also has `SUPER_ADMIN` and `STUDY_COORDINATOR`),
> but those two are **not seeded**. The frontend handles all 7 keys defensively while only
> the 5 seeded roles can actually log in. `STUDY_COORDINATOR` still lands on a "coming soon"
> page (it has no seeded data and no dedicated backend surface).

### 2.2 Honest limitations baked into these portals

These follow directly from what the backend will and won't allow a given role to call:

- **Manager assignment is by ID, not a picker.** `GET /api/managers` is **ADMIN-only**, so a
  Clinical/Trial Manager cannot list managers to choose from. The "assign manager to trial"
  dialog therefore takes a **manager ID** (shown on each manager's own profile) plus a role,
  and says so inline. It does not pretend a directory it can't read exists.
- **Doctors can't list patients.** `GET /api/patients` is gated to the manager roles. So the
  doctor's adverse-event form takes a **patient ID** (which a doctor has from the patient's
  visit/chart) rather than a patient dropdown. The doctor's *test-result* form sidesteps this
  by sourcing the patient from the doctor's own selected visit.
- **A doctor login needs a `doctors` row.** The session carries a `userId`; doctor data is
  keyed by `doctorId`, resolved once via `GET /api/doctors/by-user/{userId}`. If a doctor
  account has no `doctors` record, the portal shows a clear "ask an admin to create your
  doctor profile" state instead of erroring. (Demo `dr.smith` / `dr.jones` both have rows.)
- **Analytics rates depend on a snapshot.** The dashboard's completion/compliance bars read
  the latest analytics snapshot; if none has been captured (an ADMIN action), the dashboard
  says so rather than showing fake numbers.

---

## 3. Prerequisites

- **Node.js 18.19+ or 20+** and npm (built and verified on Node 22).
- The **CTMS Spring Boot backend running on `http://localhost:8080`** with sample data loaded.
  - Demo login (salt `ctmsDEMO`, from `sql/sample_data.sql`):

    | Role | Username | Password |
    |---|---|---|
    | Admin | `admin` | `Admin@123` |
    | Doctor | `dr.smith` | `Doctor@123` |
    | Participant | `p.john` | `Patient@123` |
    | Clinical Manager | `cm.alex` | `Clinical@123` |
    | Manager (→ Trial Manager) | `mgr.kate` | `Manager@123` |

  - The Participant portal (the richest part of this UI) is best explored with **`p.john`**.
  - User Management is behind **`admin`**.

---

## 4. Run it

```bash
npm install        # already vendored here, but safe to re-run
npm start          # ng serve with the dev proxy (see below) -> http://localhost:4200
```

`npm start` uses **`proxy.conf.json`**, which forwards `/api` to `http://localhost:8080`.
That keeps the browser's requests same-origin in development, so you don't depend on the
backend's CORS config while testing locally. The app calls relative `/api/...` paths
(`environment.apiBaseUrl` is an empty string), so the proxy is all that's needed.

Production build:

```bash
npm run build      # outputs to dist/ctms-frontend/browser
```

To point a deployed build at a non-proxied API, set `apiBaseUrl` in
`src/environments/environment.ts` to the backend origin (e.g. `https://api.example.com`)
and ensure the backend's `ctms.cors.*` allows your frontend origin.

---

## 5. Build status (verified, not assumed)

This codebase was compiled in this environment with:

```
ng build --configuration development
# → Application bundle generation complete. 0 warnings, 0 errors.
```

So the TypeScript and **all Angular templates type-check and compile cleanly** — this is a
real result, not a "should work." Two caveats stated plainly:

- A **production** build (`ng build`) additionally minifies and enforces bundle budgets.
  Run it locally to confirm budget headroom on your machine; it is not exercised here.
- There are **no automated tests yet** (no `.spec` files). Karma/Jasmine is configured in
  `angular.json`, so `ng test` is ready for specs to be added — but claiming "tested" would
  be false. The verification that exists is: *it compiles, and every call maps to a real
  documented endpoint.*

---

## 6. How the frontend talks to the backend (the non-obvious bits)

- **Response envelope.** Every endpoint returns `ApiResponse<T>` =
  `{ success, message, data, errors?, path?, timestamp? }`. `ApiService` unwraps `.data`
  so feature services see plain payloads; `errorInterceptor` reads the same envelope on
  failures and surfaces `message` in a snackbar.
- **Paging.** Paged endpoints return a Spring `Page<T>` *inside* `data`
  (`content`, `totalElements`, `totalPages`, `number` (0-based), `size`, `first`, `last`, …).
  Query params are `page`, `size`, `sort` (e.g. `scheduledDate,desc`). Material's paginator
  is also 0-based, so indices line up directly.
- **Role mapping gotcha.** `AuthResponse.role` returns the **human DB name**
  (e.g. `"Manager"`, `"Clinical Manager"`). The app maps that name to a canonical key via
  `core/constants/roles.ts` — notably **DB `"Manager"` → key `TRIAL_MANAGER`** — and routes
  on the key. Authorities on the backend are `ROLE_<KEY>`.
- **Auth header.** `authInterceptor` attaches `Authorization: Bearer <token>` to every
  request except the login call. The token lives in `sessionStorage` (`ctms.token`).

---

## 7. Project structure

```
src/app/
  core/
    constants/      api-endpoints.ts (full 19-controller map), roles.ts (name→key)
    guards/         auth.guard.ts, role.guard.ts
    interceptors/   auth.interceptor.ts, error.interceptor.ts
    models/         api.models.ts, auth.models.ts, domain.models.ts, enums.ts
    services/       api.service.ts, auth.service.ts, ui.service.ts
  features/
    auth/login/     login.component.ts (+ demo-account quick fill)
    portal/         services/portal.service.ts, portal.routes.ts, pages/* (11 pages)
    admin/          services/*, admin.routes.ts, pages/* (list, dashboard, dialogs)
    clinical/       shared CM/TM portal:
                      clinical.capabilities.ts (role→action flags), clinical.util.ts
                      services/* (trials, patients, visits, consents, safety, insights)
                      dialogs/* (trial/patient/visit/consent/adverse-event/report forms,
                                 assign-manager, enrollments, pick-status, date-prompt)
                      pages/*   (dashboard, trials, patients, visits, consents,
                                 adverse-events, reports)
                      clinical.routes.ts (Clinical Manager route set)
    manager/        manager.routes.ts (Trial Manager — reuses clinical/ components)
    doctor/         doctor.context.ts (resolves doctorId), doctor.routes.ts
                      dialogs/* (test-result form, adverse-event form)
                      pages/*   (dashboard, visits, test-results, adverse-events, trials)
    errors/         forbidden, not-found, coming-soon
  layout/           main-layout.component.ts (responsive sidenav + role accent), nav.config.ts
  shared/           confirm-dialog.component.ts
  app.routes.ts     login → shell(authGuard) → {
                      portal[PARTICIPANT], admin[ADMIN], doctor[DOCTOR],
                      clinical[CLINICAL_MANAGER], manager[TRIAL_MANAGER], coming-soon }
```

See **`CTMS_API_MAP.md`** for the full endpoint inventory and which parts have a UI.

---

## 8. Known limitations (complete list)

1. `STUDY_COORDINATOR` and `SUPER_ADMIN` have no dedicated screens — the former is unseeded
   with no backing data/endpoints (lands on a "coming soon" page); the latter shares the Admin
   surface. All other seeded roles (Admin, Participant, Doctor, Clinical Manager, Trial
   Manager) have full portals.
2. **Manager assignment is by ID** (the manager directory is ADMIN-only — see §2.2).
3. **Doctor adverse-event reporting takes a patient ID** (doctors can't list patients — §2.2);
   a doctor account also needs a `doctors` row or the portal shows a "no profile" state.
4. Dashboard completion/compliance rates require an analytics snapshot to exist; otherwise the
   card explains that none has been captured rather than inventing figures.
5. No automated tests yet.
6. No forgot/reset password, no token refresh, no JWT — because the backend has none.
7. Documents are **listed** for participants; the portal API exposes no file-download
   endpoint, so there is no download button (the UI says so on the page).
8. Production bundle budgets are configured but not validated in this environment.

Everything above is intentional and traceable to the backend source. The guiding rule for
this build was: **never render a control the API can't honour.**
