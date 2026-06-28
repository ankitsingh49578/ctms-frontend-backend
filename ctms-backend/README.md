# CTMS Backend (Spring Boot 3.x)

A **Clinical Trial Management System** REST API, migrated from a Core Java 17 / JDBC / PostgreSQL console application to **Spring Boot 3.3.x + Hibernate/JPA + PostgreSQL**.

This is the v2.0 REST rewrite. All business rules, validations, enum-to-DB mappings and the PostgreSQL schema from the original console app are preserved; the delivery layer changed from interactive console portals to HTTP/JSON endpoints.

---

## Tech stack

| Concern | Choice |
|---|---|
| Language / build | Java 17, Maven |
| Framework | Spring Boot 3.3.5 (Web, Data JPA, Validation, Actuator) |
| Persistence | Hibernate / JPA over PostgreSQL |
| API docs | springdoc-openapi 2.6.0 (Swagger UI) |
| Auth | Opaque session tokens (preserved from the legacy app; **not** Spring Security) |
| Boilerplate | Lombok |
| Tests | JUnit 5, Mockito, H2 (in-memory) |

## Layered architecture

```
controller  ->  service (interface) -> service.impl  ->  repository (Spring Data JPA)  ->  PostgreSQL
                       |                     |
                      dto  <—— mapper ——  entity (JPA)
```

Cross-cutting: `dto` (request/response envelopes), `mapper` (entity→response), `exception` (+ `GlobalExceptionHandler`), `config`, `security` (Spring Security session-token filter, RBAC `AccessGuard`, request-scoped current user), `validation`, `enums`, `util` (+ `util/converter` JPA `AttributeConverter`s), `constants`.

## Quick start

```bash
# 1. Create the database and load the schema (+ optional seed data)
createdb ctms_db
psql -d ctms_db -f sql/schema.sql
psql -d ctms_db -f sql/patch_01_participants.sql
psql -d ctms_db -f sql/patch_02_search_indexes.sql
psql -d ctms_db -f sql/sample_data.sql      # optional demo data

# 2. Point the app at your DB (defaults shown; override via env vars)
export DB_URL=jdbc:postgresql://localhost:5432/ctms_db
export DB_USERNAME=ctms_user
export DB_PASSWORD=password

# 3. Build and run
mvn clean install
mvn spring-boot:run
```

- API base: `http://localhost:8080/api`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- Health: `http://localhost:8080/actuator/health`

Demo login (with `sample_data.sql` loaded): `admin` / `Admin@123`.

See [`docs/SETUP.md`](docs/SETUP.md) for full setup, the [Postman collection](postman/CTMS.postman_collection.json) to exercise every endpoint, and [`docs/`](docs) for architecture, ERD, the API contract and migration notes.

## Endpoint groups

Users · Patients · Trials · Enrollments · Consents · Visits · Adverse Events · Test Results · Documents · Reports · Analytics · Auth — plus Roles, Doctors, Managers, Notifications and Settings.

**Participant Portal** (`/api/portal`, `ROLE_PARTICIPANT`, self-scoped): browse/apply to trials, sign/decline own consent, view own visits, results, adverse events, documents and notifications, and a personal dashboard. See [`docs/PARTICIPANT_PORTAL.md`](docs/PARTICIPANT_PORTAL.md).

## Important notes

- The PostgreSQL schema in `sql/` is the **source of truth**. Hibernate runs with `ddl-auto: none` and will not create or modify tables — load `schema.sql` before first run.
- Security is **enabled by default** (`ctms.security.enabled=true`): every `/api/**` call except `/api/auth/login` requires a session token, and role-based access control (`@PreAuthorize` + ownership guards) is enforced on every endpoint — see `docs/SECURITY_AUDIT_RBAC.md` for the full access matrix. Setting it to `false` (local dev only) authenticates all requests as the configured system user and logs a startup warning.
- This project was authored to be correct by inspection; build it locally with `mvn clean install` (the authoring sandbox had no Maven or network access).
