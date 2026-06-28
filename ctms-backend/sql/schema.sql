-- ============================================================================
-- CTMS - Clinical Trial Management System
-- Complete PostgreSQL 16 Schema  (migrated from MySQL 8)
-- 22 tables (21 core + permissions) + auto-update trigger
--
-- HOW TO RUN
-- ----------
--   1. Create the database + user FIRST (see PHASE 2 of the guide):
--          CREATE DATABASE ctms_db;
--          CREATE USER ctms_user WITH PASSWORD 'password';
--          GRANT ALL PRIVILEGES ON DATABASE ctms_db TO ctms_user;
--   2. Connect to the database:   \c ctms_db
--   3. Run this file:             \i sql/schema.sql
--   4. Run the seed data:         \i sql/sample_data.sql
--
-- MIGRATION NOTES (MySQL -> PostgreSQL)
-- ------------------------------------
--   * INT AUTO_INCREMENT PRIMARY KEY      -> SERIAL PRIMARY KEY
--   * ENUM('a','b')                       -> VARCHAR(n) + CHECK (col IN ('a','b'))
--   * DATETIME                            -> TIMESTAMP
--   * TINYINT(1)                          -> BOOLEAN
--   * DECIMAL(5,2)                        -> NUMERIC(5,2)
--   * inline INDEX idx (col)              -> separate CREATE INDEX statements
--   * UNIQUE KEY uq (a,b)                 -> CONSTRAINT uq UNIQUE (a,b)
--   * ON UPDATE CURRENT_TIMESTAMP         -> BEFORE UPDATE trigger (set_updated_at)
--   All FOREIGN KEY ON DELETE / ON UPDATE rules are preserved as-is.
-- ============================================================================

-- Make re-running safe: drop everything first (CASCADE handles FK order).
DROP TABLE IF EXISTS settings          CASCADE;
DROP TABLE IF EXISTS user_sessions     CASCADE;
DROP TABLE IF EXISTS analytics         CASCADE;
DROP TABLE IF EXISTS reports           CASCADE;

DROP TABLE IF EXISTS test_results      CASCADE;
DROP TABLE IF EXISTS adverse_events    CASCADE;
DROP TABLE IF EXISTS visit_schedule    CASCADE;
DROP TABLE IF EXISTS consent_forms     CASCADE;
DROP TABLE IF EXISTS enrollments       CASCADE;
DROP TABLE IF EXISTS trial_assignments CASCADE;
DROP TABLE IF EXISTS trials            CASCADE;
DROP TABLE IF EXISTS patients          CASCADE;
DROP TABLE IF EXISTS clinical_managers CASCADE;
DROP TABLE IF EXISTS doctors           CASCADE;
DROP TABLE IF EXISTS notifications     CASCADE;
DROP TABLE IF EXISTS audit_logs        CASCADE;
DROP TABLE IF EXISTS role_permissions  CASCADE;
DROP TABLE IF EXISTS permissions       CASCADE;
DROP TABLE IF EXISTS users             CASCADE;
DROP TABLE IF EXISTS roles             CASCADE;
DROP FUNCTION IF EXISTS set_updated_at() CASCADE;

-- ----------------------------------------------------------------------------
-- Trigger function: keeps an updated_at column in sync on every UPDATE.
-- PostgreSQL has no "ON UPDATE CURRENT_TIMESTAMP" column clause, so we use a
-- BEFORE UPDATE trigger instead (attached to users and settings below).
-- ----------------------------------------------------------------------------
CREATE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 1. roles
-- ----------------------------------------------------------------------------
CREATE TABLE roles (
    role_id      SERIAL PRIMARY KEY,
    role_name    VARCHAR(50)  NOT NULL UNIQUE,
    description  VARCHAR(255),
    status       VARCHAR(10)  NOT NULL DEFAULT 'Active'
                 CONSTRAINT chk_roles_status CHECK (status IN ('Active','Inactive'))
);

-- ----------------------------------------------------------------------------
-- 2. users
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    user_id      SERIAL PRIMARY KEY,
    role_id      INT NOT NULL,
    username     VARCHAR(100) NOT NULL UNIQUE,
    email        VARCHAR(150) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    phone        VARCHAR(20),
    status       VARCHAR(10)  NOT NULL DEFAULT 'Active'
                 CONSTRAINT chk_users_status CHECK (status IN ('Active','Inactive')),
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(role_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX idx_users_role   ON users(role_id);
CREATE INDEX idx_users_status ON users(status);
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. permissions
-- ----------------------------------------------------------------------------
CREATE TABLE permissions (
    permission_id    SERIAL PRIMARY KEY,
    permission_name  VARCHAR(100) NOT NULL UNIQUE
);

-- ----------------------------------------------------------------------------
-- 4. role_permissions  (junction: roles <-> permissions)
-- ----------------------------------------------------------------------------
CREATE TABLE role_permissions (
    role_id        INT NOT NULL,
    permission_id  INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(role_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES permissions(permission_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ----------------------------------------------------------------------------
-- 5. audit_logs
-- ----------------------------------------------------------------------------
CREATE TABLE audit_logs (
    log_id       SERIAL PRIMARY KEY,
    user_id      INT NOT NULL,
    action       VARCHAR(255) NOT NULL,
    module       VARCHAR(100),
    ip_address   VARCHAR(45),
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX idx_audit_user ON audit_logs(user_id);

-- ----------------------------------------------------------------------------
-- 6. notifications
-- ----------------------------------------------------------------------------
CREATE TABLE notifications (
    notification_id  SERIAL PRIMARY KEY,
    user_id          INT NOT NULL,
    title            VARCHAR(150) NOT NULL,
    message          TEXT,
    is_read          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX idx_notif_user ON notifications(user_id);

-- ----------------------------------------------------------------------------
-- 7. doctors  (doctor_id PK, user_id FK 1:1)
-- ----------------------------------------------------------------------------
CREATE TABLE doctors (
    doctor_id      SERIAL PRIMARY KEY,
    user_id        INT NOT NULL UNIQUE,
    doctor_name    VARCHAR(150) NOT NULL,
    specialization VARCHAR(150),
    license_no     VARCHAR(100) UNIQUE,
    phone          VARCHAR(20),
    profile_image  VARCHAR(255),
    employee_id    VARCHAR(50) UNIQUE,
    department     VARCHAR(100),
    designation    VARCHAR(100),
    qualification  VARCHAR(150),
    address        TEXT,
    emergency_contact VARCHAR(100),
    CONSTRAINT fk_doctor_user FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ----------------------------------------------------------------------------
-- 8. clinical_managers  (manager_id PK, user_id FK 1:1)
-- ----------------------------------------------------------------------------
CREATE TABLE clinical_managers (
    manager_id    SERIAL PRIMARY KEY,
    user_id       INT NOT NULL UNIQUE,
    manager_name  VARCHAR(150) NOT NULL,
    department    VARCHAR(150),
    phone         VARCHAR(20),
    CONSTRAINT fk_manager_user FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ----------------------------------------------------------------------------
-- 9. patients  (patient_id PK, user_id FK)
-- ----------------------------------------------------------------------------
CREATE TABLE patients (
    patient_id    SERIAL PRIMARY KEY,
    user_id       INT UNIQUE,                     -- nullable: a participant need not be a login user
    patient_code  VARCHAR(20)  NOT NULL UNIQUE,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    dob           DATE NOT NULL,
    gender        VARCHAR(10)  NOT NULL
                  CONSTRAINT chk_patients_gender CHECK (gender IN ('Male','Female','Other')),
    phone         VARCHAR(20),
    email         VARCHAR(150),
    address       TEXT,
    blood_group   VARCHAR(5),
    status         VARCHAR(10) NOT NULL DEFAULT 'Active'
                   CONSTRAINT chk_patient_status
                   CHECK (status IN ('Active','Inactive','Pending','Verified')),
    medical_history_document_name VARCHAR(255),
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_patient_user FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX idx_patients_status ON patients(status);

-- ----------------------------------------------------------------------------
-- 10. trials
-- ----------------------------------------------------------------------------
CREATE TABLE trials (
    trial_id     SERIAL PRIMARY KEY,
    trial_code   VARCHAR(20)  NOT NULL UNIQUE,
    trial_name   VARCHAR(255) NOT NULL,
    phase        VARCHAR(4)   NOT NULL
                 CONSTRAINT chk_trials_phase CHECK (phase IN ('I','II','III','IV')),
    description  TEXT,
    start_date   DATE NOT NULL,
    end_date     DATE,
    status       VARCHAR(12)  NOT NULL DEFAULT 'Planned'
                 CONSTRAINT chk_trials_status
                 CHECK (status IN ('Planned','Active','Completed','On Hold','Terminated')),
    created_by   INT NOT NULL,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_trial_creator FOREIGN KEY (created_by) REFERENCES users(user_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_trials_dates CHECK (end_date IS NULL OR end_date >= start_date)
);
CREATE INDEX idx_trial_status ON trials(status);

-- ----------------------------------------------------------------------------
-- 11. trial_assignments
-- ----------------------------------------------------------------------------
CREATE TABLE trial_assignments (
    assignment_id  SERIAL PRIMARY KEY,
    trial_id       INT NOT NULL,
    manager_id     INT NOT NULL,
    role           VARCHAR(12) NOT NULL
                   CONSTRAINT chk_ta_role CHECK (role IN ('Manager','Coordinator','Monitor')),
    assigned_date  DATE NOT NULL,
    status         VARCHAR(10) NOT NULL DEFAULT 'Active'
                   CONSTRAINT chk_ta_status CHECK (status IN ('Active','Inactive')),
    CONSTRAINT fk_ta_trial FOREIGN KEY (trial_id) REFERENCES trials(trial_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ta_manager FOREIGN KEY (manager_id) REFERENCES clinical_managers(manager_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX idx_ta_trial   ON trial_assignments(trial_id);
CREATE INDEX idx_ta_manager ON trial_assignments(manager_id);

-- ----------------------------------------------------------------------------
-- 12. enrollments
-- ----------------------------------------------------------------------------
CREATE TABLE enrollments (
    enrollment_id    SERIAL PRIMARY KEY,
    patient_id       INT NOT NULL,
    trial_id         INT NOT NULL,
    enrollment_date  DATE NOT NULL,
    status           VARCHAR(12) NOT NULL DEFAULT 'Screening'
                     CONSTRAINT chk_enr_status
                     CHECK (status IN ('Screening','Enrolled','Completed','Withdrawn','Terminated')),
    CONSTRAINT fk_enr_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_enr_trial FOREIGN KEY (trial_id) REFERENCES trials(trial_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_patient_trial UNIQUE (patient_id, trial_id)
);
CREATE INDEX idx_enr_trial ON enrollments(trial_id);

-- ----------------------------------------------------------------------------
-- 13. consent_forms
-- ----------------------------------------------------------------------------
CREATE TABLE consent_forms (
    consent_id       SERIAL PRIMARY KEY,
    patient_id       INT NOT NULL,
    trial_id         INT NOT NULL,
    consent_version  VARCHAR(50) NOT NULL,
    consent_date     DATE NOT NULL,
    consent_status   VARCHAR(10) NOT NULL DEFAULT 'Pending'
                     CONSTRAINT chk_consent_status
                     CHECK (consent_status IN ('Pending','Signed','Declined','Withdrawn')),
    file_path        VARCHAR(255),
    document_name    VARCHAR(255),
    document_path    VARCHAR(500),
    document_size    BIGINT,
    uploaded_by      VARCHAR(100),
    uploaded_date    TIMESTAMP,
    signed_date      TIMESTAMP,
    CONSTRAINT fk_consent_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_consent_trial FOREIGN KEY (trial_id) REFERENCES trials(trial_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX idx_consent_patient ON consent_forms(patient_id);

-- ----------------------------------------------------------------------------
-- 14. visit_schedule
-- ----------------------------------------------------------------------------
CREATE TABLE visit_schedule (
    visit_id        SERIAL PRIMARY KEY,
    trial_id        INT NOT NULL,
    patient_id      INT NOT NULL,
    doctor_id       INT,
    manager_id      INT,
    visit_number    INT NOT NULL,
    visit_type      VARCHAR(100) NOT NULL,
    scheduled_date  DATE NOT NULL,
    window_start    DATE,
    window_end      DATE,
    actual_date     DATE,
    visit_status    VARCHAR(12) NOT NULL DEFAULT 'Scheduled'
                    CONSTRAINT chk_visit_status
                    CHECK (visit_status IN ('Scheduled','Completed','Missed','Cancelled','Rescheduled')),
    notes           TEXT,
    CONSTRAINT fk_visit_trial   FOREIGN KEY (trial_id)   REFERENCES trials(trial_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_visit_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_visit_doctor  FOREIGN KEY (doctor_id)  REFERENCES doctors(doctor_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_visit_manager FOREIGN KEY (manager_id) REFERENCES clinical_managers(manager_id)
        ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX idx_visit_trial   ON visit_schedule(trial_id);
CREATE INDEX idx_visit_patient ON visit_schedule(patient_id);

-- ----------------------------------------------------------------------------
-- 15. adverse_events
-- ----------------------------------------------------------------------------
CREATE TABLE adverse_events (
    event_id      SERIAL PRIMARY KEY,
    trial_id      INT NOT NULL,
    patient_id    INT NOT NULL,
    reported_by   INT NOT NULL,           -- FK -> users.user_id
    event_date    DATE NOT NULL,
    severity      VARCHAR(16) NOT NULL
                  CONSTRAINT chk_ae_severity
                  CHECK (severity IN ('Mild','Moderate','Severe','Life Threatening')),
      description   TEXT,
      title         VARCHAR(255),
      symptoms      TEXT,
      start_date    TIMESTAMP,
      end_date      TIMESTAMP,
      actions_taken TEXT,
      requires_medical_attention BOOLEAN,
      attachments   TEXT,
      status        VARCHAR(12) NOT NULL DEFAULT 'Reported'
                  CONSTRAINT chk_ae_status
                  CHECK (status IN ('Reported','In Review','Resolved','Closed')),
    created_by_doctor_id INT,                     -- added for data isolation
    created_by_doctor_name VARCHAR(150),          -- added for data isolation
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ae_trial    FOREIGN KEY (trial_id)    REFERENCES trials(trial_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ae_patient  FOREIGN KEY (patient_id)  REFERENCES patients(patient_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ae_reporter FOREIGN KEY (reported_by) REFERENCES users(user_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX idx_ae_trial   ON adverse_events(trial_id);
CREATE INDEX idx_ae_patient ON adverse_events(patient_id);

-- ----------------------------------------------------------------------------
-- 16. test_results
-- ----------------------------------------------------------------------------
CREATE TABLE test_results (
    result_id      SERIAL PRIMARY KEY,
    visit_id       INT NOT NULL,
    patient_id     INT NOT NULL,
    doctor_id      INT NOT NULL,
    test_name      VARCHAR(150) NOT NULL,
    result_value   TEXT,
    unit           VARCHAR(50),
    result_status  VARCHAR(12) NOT NULL DEFAULT 'Normal'
                   CONSTRAINT chk_tr_status
                   CHECK (result_status IN ('Normal','Abnormal','Critical','Inconclusive')),
    collected_date DATE NOT NULL,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tr_visit   FOREIGN KEY (visit_id)   REFERENCES visit_schedule(visit_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_tr_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_tr_doctor  FOREIGN KEY (doctor_id)  REFERENCES doctors(doctor_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX idx_tr_visit ON test_results(visit_id);



-- ----------------------------------------------------------------------------
-- 19. reports
-- ----------------------------------------------------------------------------
CREATE TABLE reports (
    report_id      SERIAL PRIMARY KEY,
    trial_id       INT,
    report_name    VARCHAR(150) NOT NULL,
    report_type    VARCHAR(12) NOT NULL
                   CONSTRAINT chk_report_type
                   CHECK (report_type IN ('Recruitment','Safety','Performance','Compliance','Other')),
    generated_by   INT NOT NULL,          -- FK -> users.user_id
    generated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    file_path      VARCHAR(255),
    CONSTRAINT fk_report_trial     FOREIGN KEY (trial_id)     REFERENCES trials(trial_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_report_generator FOREIGN KEY (generated_by) REFERENCES users(user_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX idx_report_trial ON reports(trial_id);

-- ----------------------------------------------------------------------------
-- 20. analytics
-- ----------------------------------------------------------------------------
CREATE TABLE analytics (
    analytics_id      SERIAL PRIMARY KEY,
    metric_date       DATE NOT NULL,
    active_trials     INT NOT NULL DEFAULT 0,
    total_patients    INT NOT NULL DEFAULT 0,
    enrolled_patients INT NOT NULL DEFAULT 0,
    completion_rate   NUMERIC(5,2) NOT NULL DEFAULT 0,
    compliance_rate   NUMERIC(5,2) NOT NULL DEFAULT 0,
    pending_visits    INT NOT NULL DEFAULT 0,
    overdue_visits    INT NOT NULL DEFAULT 0,
    generated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 21. user_sessions
-- ----------------------------------------------------------------------------
CREATE TABLE user_sessions (
    session_id   SERIAL PRIMARY KEY,
    user_id      INT NOT NULL,
    token        VARCHAR(255) NOT NULL,
    ip_address   VARCHAR(45),
    login_time   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    logout_time  TIMESTAMP,
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX idx_session_user  ON user_sessions(user_id);
CREATE INDEX idx_session_token ON user_sessions(token);

-- ----------------------------------------------------------------------------
-- 22. settings
-- ----------------------------------------------------------------------------
CREATE TABLE settings (
    setting_id     SERIAL PRIMARY KEY,
    setting_key    VARCHAR(100) NOT NULL UNIQUE,
    setting_value  TEXT,
    updated_by     INT NOT NULL,          -- FK -> users.user_id
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_setting_user FOREIGN KEY (updated_by) REFERENCES users(user_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TRIGGER trg_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- Secondary indexes that back the search() / findByStatus() / count*() queries
-- used by the DAO layer. (Idempotent on a fresh install; also shipped as
-- sql/patch_02_search_indexes.sql for existing databases.)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_username    ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email       ON users(email);
CREATE INDEX IF NOT EXISTS idx_patients_code     ON patients(patient_code);
CREATE INDEX IF NOT EXISTS idx_patients_last_name ON patients(last_name);
CREATE INDEX IF NOT EXISTS idx_trials_code       ON trials(trial_code);
CREATE INDEX IF NOT EXISTS idx_doctors_name      ON doctors(doctor_name);
CREATE INDEX IF NOT EXISTS idx_doctors_license   ON doctors(license_no);
CREATE INDEX IF NOT EXISTS idx_managers_name     ON clinical_managers(manager_name);
CREATE INDEX IF NOT EXISTS idx_consent_status    ON consent_forms(consent_status);
CREATE INDEX IF NOT EXISTS idx_ae_status         ON adverse_events(status);
CREATE INDEX IF NOT EXISTS idx_ae_severity       ON adverse_events(severity);
CREATE INDEX IF NOT EXISTS idx_visit_status      ON visit_schedule(visit_status);
CREATE INDEX IF NOT EXISTS idx_tr_status         ON test_results(result_status);
CREATE INDEX IF NOT EXISTS idx_tr_test_name      ON test_results(test_name);

CREATE INDEX IF NOT EXISTS idx_report_type       ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_notif_user_unread ON notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_enr_status        ON enrollments(status);

-- ============================================================================
-- End of schema. Run sample_data.sql next to seed demo data.
-- ============================================================================
SELECT 'CTMS PostgreSQL schema created successfully (19 core tables + permissions).' AS status;

-- =====================================================================
-- POST-AUDIT PRODUCTION HARDENING (baked into fresh installs)
-- Mirrors sql/patch_03_production_hardening.sql so a brand-new database and an
-- upgraded one end up identical. All statements are idempotent.
-- =====================================================================

-- Token expiry (PHASE 3)
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);

-- Thread-safe participant codes (PHASE 4)
CREATE SEQUENCE IF NOT EXISTS patient_code_seq;
SELECT setval(
    'patient_code_seq',
    COALESCE(
        (SELECT MAX(CAST(SUBSTRING(patient_code FROM 'PAT-([0-9]+)') AS INTEGER))
         FROM patients
         WHERE patient_code ~ '^PAT-[0-9]+$'),
        0) + 1,
    false
);

-- Optimistic locking (PHASE 8)
ALTER TABLE trials         ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE enrollments    ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE visit_schedule ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE patients       ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

