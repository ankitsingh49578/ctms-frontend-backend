-- ============================================================================
-- CTMS PATCH 02 — performance indexes for search / filter / count
-- Apply to an EXISTING ctms_db to add indexes that back the new
-- search()/findByStatus()/count*() DAO queries added in this release.
--
--   psql -U ctms_user -d ctms_db -f sql/patch_02_search_indexes.sql
--
-- All statements use IF NOT EXISTS so this patch is safe to re-run, and a
-- fresh schema.sql install does not require it (these indexes only optimize;
-- they are not required for correctness).
-- ============================================================================

-- --- case-insensitive search support (ILIKE on names/codes) ---
-- A trigram extension would be ideal for ILIKE '%kw%'; we keep plain btree
-- indexes on the high-selectivity exact/prefix columns to avoid extra
-- extensions. These help equality, prefix and ORDER BY usage.

-- users: search by username/email, list by status
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email    ON users(email);

-- patients: search by code/name, filter by status (status index already exists)
CREATE INDEX IF NOT EXISTS idx_patients_code      ON patients(patient_code);
CREATE INDEX IF NOT EXISTS idx_patients_last_name ON patients(last_name);

-- trials: filter/count by status already covered by idx_trial_status; add code lookups
CREATE INDEX IF NOT EXISTS idx_trials_code ON trials(trial_code);

-- doctors / clinical managers: search & user-link lookups
CREATE INDEX IF NOT EXISTS idx_doctors_name        ON doctors(doctor_name);
CREATE INDEX IF NOT EXISTS idx_doctors_license     ON doctors(license_no);
CREATE INDEX IF NOT EXISTS idx_managers_name       ON clinical_managers(manager_name);

-- consent forms: filter/count by status
CREATE INDEX IF NOT EXISTS idx_consent_status ON consent_forms(consent_status);

-- adverse events: filter/count by status and severity
CREATE INDEX IF NOT EXISTS idx_ae_status   ON adverse_events(status);
CREATE INDEX IF NOT EXISTS idx_ae_severity ON adverse_events(severity);

-- visit schedule: count/filter by status
CREATE INDEX IF NOT EXISTS idx_visit_status ON visit_schedule(visit_status);

-- test results: filter/count by status, search by test name
CREATE INDEX IF NOT EXISTS idx_tr_status    ON test_results(result_status);
CREATE INDEX IF NOT EXISTS idx_tr_test_name ON test_results(test_name);

-- documents: filter/count by type
CREATE INDEX IF NOT EXISTS idx_doc_type ON documents(document_type);

-- reports: filter/count by type
CREATE INDEX IF NOT EXISTS idx_report_type ON reports(report_type);

-- notifications: unread lookups per user (partial index)
CREATE INDEX IF NOT EXISTS idx_notif_user_unread ON notifications(user_id) WHERE is_read = FALSE;

-- enrollments: status counts per trial
CREATE INDEX IF NOT EXISTS idx_enr_status ON enrollments(status);

SELECT 'CTMS patch 02 applied: search/filter/count indexes created (idempotent).' AS status;
