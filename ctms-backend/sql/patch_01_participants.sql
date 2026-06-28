-- ============================================================================
-- CTMS PATCH 01 — participant fixes
-- Apply this to an EXISTING ctms_db to pick up the participant-creation fixes
-- WITHOUT dropping/reloading (keeps your current data).
--
--   psql -U ctms_user -d ctms_db -f sql/patch_01_participants.sql
--
-- (Fresh installs don't need this — schema.sql already includes these changes.)
-- ============================================================================

-- 1. A participant need not be a login user: allow patients.user_id to be NULL.
ALTER TABLE patients ALTER COLUMN user_id DROP NOT NULL;

-- 2. Widen the participant status vocabulary to match the service lifecycle
--    (addParticipant -> 'Pending', verifyParticipant -> 'Verified').
ALTER TABLE patients DROP CONSTRAINT chk_patients_status;
ALTER TABLE patients ADD CONSTRAINT chk_patients_status
    CHECK (status IN ('Active','Inactive','Pending','Verified'));

-- Verify:
--   \d patients
--   user_id should no longer say "not null"; chk_patients_status should list all four values.
