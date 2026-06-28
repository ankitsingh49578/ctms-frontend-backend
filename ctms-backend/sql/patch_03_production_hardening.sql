-- =====================================================================
-- CTMS patch_03_production_hardening.sql
-- Applies the schema changes required by the post-audit hardening work.
-- Run ONCE against an existing database (after schema.sql / patch_01 / patch_02).
-- Fresh installs already include these via the updated schema.sql.
--
--   psql -d ctms_db -f sql/patch_03_production_hardening.sql
--
-- Safe to re-run: every statement is idempotent.
-- =====================================================================

-- ---------------------------------------------------------------------
-- PHASE 3 — Token expiry
-- New nullable column. Existing rows stay NULL = "never expires" (legacy
-- behaviour) so currently-logged-in users are not kicked out by the upgrade.
-- New logins populate it from ctms.security.token-validity-minutes.
-- ---------------------------------------------------------------------
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;

-- ---------------------------------------------------------------------
-- PHASE 4 — Thread-safe participant codes (PAT-0001, PAT-0002, ...)
-- Replaces the race-prone count()+1 strategy with a DB sequence. Seed the
-- sequence just past the highest existing PAT- code so no value is reused.
-- ---------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS patient_code_seq;

SELECT setval(
    'patient_code_seq',
    COALESCE(
        (SELECT MAX(CAST(SUBSTRING(patient_code FROM 'PAT-([0-9]+)') AS INTEGER))
         FROM patients
         WHERE patient_code ~ '^PAT-[0-9]+$'),
        0) + 1,
    false   -- is_called=false => the next nextval() returns exactly this number
);

-- ---------------------------------------------------------------------
-- PHASE 8 — Optimistic locking (@Version)
-- BIGINT NOT NULL DEFAULT 0 so every existing row gets a starting version and
-- Hibernate can increment it on update. Concurrent edits now fail fast with an
-- OptimisticLockException instead of silently overwriting each other.
-- ---------------------------------------------------------------------
ALTER TABLE trials         ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE enrollments    ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE visit_schedule ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE patients       ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE documents      ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- ---------------------------------------------------------------------
-- Optional: index to speed up token lookups (the auth interceptor resolves a
-- token on every protected request).
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);

-- Verify (optional):
--   \d user_sessions
--   SELECT last_value FROM patient_code_seq;
