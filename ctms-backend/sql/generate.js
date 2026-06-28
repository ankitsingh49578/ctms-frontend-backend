const fs = require('fs');

const outputPath = 'sample_data.sql';

// Helper to escape strings
const esc = str => str ? `'${str.replace(/'/g, "''")}'` : 'NULL';

// Helper for dates
const date = (daysOffset) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return `'${d.toISOString().split('T')[0]}'`;
};

const hashes = {
    'ADMIN': 'fe27ae49ea1c$5bc45e8f1039e0105987b89a848e1715e1f49819d416c57e782c1ee582e24d0f',
    'CLINICAL_MANAGER': '61ca825a294f$41f7f2296886b1c0135be6c2849b88f8cc1b803e47971e55c9fc86fda5aa4803',
    'DOCTOR': '183d1505234e$2c98263b058dbb9161918084556cba50f4fbf80eb08267c55d9166c0eb93b8b4',
    'TRIAL_MANAGER': '03e1c4c5a7bb$39c41742f79d869fd9cd9455f19b56696ee6e9ea165140fb930811a12416ea1d',
    'STUDY_COORDINATOR': 'e34684e8cff1$20bc3b226f14c3a042b134ed317194465d52fb46c96b9eaff16a3d35e0b1c64b',
    'PARTICIPANT': '164401318836$03bdff5c9dd40f7a482d33aaf9a47e958082aabbda89a2b3eac377c221ead2ce'
};

let sql = `
-- ============================================================================
-- CTMS - Sample Data Seed Script
-- ============================================================================
-- DEMO ACCOUNTS CREDENTIALS:
-- Admin:              admin1 / Admin@123
-- Clinical Manager:   cm1 / Cm@123
-- Trial Manager:      tm1 / Tm@123
-- Doctor:             doctor1 / Doctor@123
-- Study Coordinator:  coord1 / Coord@123
-- Participant:        patient1 / Patient@123
-- ============================================================================


TRUNCATE TABLE settings CASCADE;
TRUNCATE TABLE user_sessions CASCADE;
TRUNCATE TABLE analytics CASCADE;
TRUNCATE TABLE reports CASCADE;
TRUNCATE TABLE test_results CASCADE;
TRUNCATE TABLE adverse_events CASCADE;
TRUNCATE TABLE visit_schedule CASCADE;
TRUNCATE TABLE consent_forms CASCADE;
TRUNCATE TABLE enrollments CASCADE;
TRUNCATE TABLE trial_assignments CASCADE;
TRUNCATE TABLE trials CASCADE;
TRUNCATE TABLE patients CASCADE;
TRUNCATE TABLE clinical_managers CASCADE;
TRUNCATE TABLE doctors CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE audit_logs CASCADE;
TRUNCATE TABLE role_permissions CASCADE;
TRUNCATE TABLE permissions CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE roles CASCADE;

ALTER SEQUENCE roles_role_id_seq RESTART WITH 1;
ALTER SEQUENCE users_user_id_seq RESTART WITH 1;
ALTER SEQUENCE permissions_permission_id_seq RESTART WITH 1;
ALTER SEQUENCE doctors_doctor_id_seq RESTART WITH 1;
ALTER SEQUENCE clinical_managers_manager_id_seq RESTART WITH 1;
ALTER SEQUENCE patients_patient_id_seq RESTART WITH 1;
ALTER SEQUENCE trials_trial_id_seq RESTART WITH 1;
ALTER SEQUENCE trial_assignments_assignment_id_seq RESTART WITH 1;
ALTER SEQUENCE enrollments_enrollment_id_seq RESTART WITH 1;
ALTER SEQUENCE consent_forms_consent_id_seq RESTART WITH 1;
ALTER SEQUENCE visit_schedule_visit_id_seq RESTART WITH 1;
ALTER SEQUENCE adverse_events_event_id_seq RESTART WITH 1;
ALTER SEQUENCE test_results_result_id_seq RESTART WITH 1;
ALTER SEQUENCE reports_report_id_seq RESTART WITH 1;
ALTER SEQUENCE analytics_analytics_id_seq RESTART WITH 1;
ALTER SEQUENCE notifications_notification_id_seq RESTART WITH 1;
ALTER SEQUENCE audit_logs_log_id_seq RESTART WITH 1;
ALTER SEQUENCE patient_code_seq RESTART WITH 1;

`;

// 1. Roles
sql += `-- Roles\n`;
const roles = [
    {id: 1, name: 'Admin', desc: 'ADMIN Role'},
    {id: 2, name: 'Clinical Manager', desc: 'CLINICAL_MANAGER Role'},
    {id: 3, name: 'Manager', desc: 'TRIAL_MANAGER Role'},
    {id: 4, name: 'Doctor', desc: 'DOCTOR Role'},
    {id: 5, name: 'Study Coordinator', desc: 'STUDY_COORDINATOR Role'},
    {id: 6, name: 'Participant', desc: 'PARTICIPANT Role'}
];
roles.forEach((r) => {
    sql += `INSERT INTO roles (role_id, role_name, description, status) VALUES (${r.id}, '${r.name}', '${r.desc}', 'Active');\n`;
});
sql += `\n`;

let userId = 1;

function insertUser(roleId, roleName, username, email) {
    const id = userId++;
    sql += `INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (${id}, ${roleId}, ${esc(username)}, ${esc(email)}, '${hashes[roleName]}', '555-01${id.toString().padStart(2, '0')}', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);\n`;
    return id;
}

// Admins (2)
const adminIds = [];
for (let i = 1; i <= 2; i++) {
    adminIds.push(insertUser(1, 'ADMIN', i === 1 ? 'admin1' : `admin${i}`, `admin${i}@ctms.com`));
}

// Clinical Managers (3)
const cmIds = [];
const cmNames = ['Alex Mercer', 'Sarah Connor', 'David Rose'];
for (let i = 1; i <= 3; i++) {
    const uid = insertUser(2, 'CLINICAL_MANAGER', i === 1 ? 'cm1' : `cm${i}`, `cm${i}@ctms.com`);
    cmIds.push(i);
    sql += `INSERT INTO clinical_managers (manager_id, user_id, manager_name, department, phone) VALUES (${i}, ${uid}, ${esc(cmNames[i - 1])}, 'Clinical Ops', '555-CM-${i}');\n`;
}

// Trial Managers (3)
const tmIds = [];
for (let i = 1; i <= 3; i++) {
    tmIds.push(insertUser(3, 'TRIAL_MANAGER', i === 1 ? 'tm1' : `tm${i}`, `tm${i}@ctms.com`));
}

// Doctors (5)
const docIds = [];
const docNames = ['Dr. Gregory House', 'Dr. Meredith Grey', 'Dr. John Dorian', 'Dr. Elliot Reid', 'Dr. Perry Cox'];
for (let i = 1; i <= 5; i++) {
    const uid = insertUser(4, 'DOCTOR', i === 1 ? 'doctor1' : `doctor${i}`, `doctor${i}@ctms.com`);
    docIds.push(i);
    sql += `INSERT INTO doctors (doctor_id, user_id, doctor_name, specialization, license_no, phone) VALUES (${i}, ${uid}, ${esc(docNames[i - 1])}, 'General Medicine', 'LIC-${1000 + i}', '555-DOC-${i}');\n`;
}

// Coordinators (4)
const coordIds = [];
for (let i = 1; i <= 4; i++) {
    coordIds.push(insertUser(5, 'STUDY_COORDINATOR', i === 1 ? 'coord1' : `coord${i}`, `coord${i}@ctms.com`));
}

// Participants (20)
const patIds = [];
for (let i = 1; i <= 20; i++) {
    const uid = insertUser(6, 'PARTICIPANT', i === 1 ? 'patient1' : `patient${i}`, `patient${i}@ctms.com`);
    patIds.push(i);
    const gender = i % 2 === 0 ? 'Female' : 'Male';
    const bg = ['A+', 'O+', 'B+', 'AB+'][i % 4];
    sql += `INSERT INTO patients (patient_id, user_id, patient_code, first_name, last_name, dob, gender, phone, email, address, blood_group, status, medical_history_document_name, created_at, version) 
            VALUES (${i}, ${uid}, 'PAT-${1000 + i}', 'Participant', '${i}', '19${70 + (i % 20)}-01-01', '${gender}', '555-PAT-${i}', 'patient${i}@ctms.com', '123 Study Ln', '${bg}', 'Active', 'med_hist_${i}.pdf', CURRENT_TIMESTAMP, 0);\n`;
}
sql += `SELECT setval('patient_code_seq', 1021, false);\n`;

// Trials (10)
const trialIds = [];
const phases = ['I', 'II', 'III', 'IV'];
const statuses = ['Planned', 'Active', 'Completed', 'On Hold', 'Terminated'];
for (let i = 1; i <= 10; i++) {
    trialIds.push(i);
    const phase = phases[i % 4];
    const status = i <= 5 ? 'Active' : statuses[i % 5];
    sql += `INSERT INTO trials (trial_id, trial_code, trial_name, phase, description, start_date, end_date, status, created_by, created_at, version) 
            VALUES (${i}, 'TRL-${100 + i}', 'Trial Protocol ${i}', '${phase}', 'Study description ${i}', ${date(-30)}, ${date(300)}, '${status}', ${adminIds[0]}, CURRENT_TIMESTAMP, 0);\n`;
}

// Trial Assignments (map CMs to Trials)
for (let i = 1; i <= 10; i++) {
    const cmId = cmIds[i % cmIds.length];
    sql += `INSERT INTO trial_assignments (trial_id, manager_id, role, assigned_date, status) VALUES (${i}, ${cmId}, 'Manager', ${date(-40)}, 'Active');\n`;
}

// Enrollments (25) & Consents (25)
const enrollments = [];
for (let i = 1; i <= 25; i++) {
    const patId = patIds[i % patIds.length];
    const trialId = trialIds[i % trialIds.length];

    // Check if unique patId, trialId pair
    if (!enrollments.find(e => e.p === patId && e.t === trialId)) {
        enrollments.push({ p: patId, t: trialId });
        const eId = enrollments.length;
        sql += `INSERT INTO enrollments (enrollment_id, patient_id, trial_id, enrollment_date, status, version) VALUES (${eId}, ${patId}, ${trialId}, ${date(-20)}, 'Enrolled', 0);\n`;
        sql += `INSERT INTO consent_forms (consent_id, patient_id, trial_id, consent_version, consent_date, consent_status, file_path) VALUES (${eId}, ${patId}, ${trialId}, 'v1.0', ${date(-21)}, 'Signed', 'consents/c_${eId}.pdf');\n`;
    }
}

// Visits (40)
for (let i = 1; i <= 40; i++) {
    const enr = enrollments[i % enrollments.length];
    const docId = docIds[i % docIds.length];
    const cmId = cmIds[i % cmIds.length];
    const stat = i % 2 === 0 ? 'Completed' : 'Scheduled';
    // ensure doctor mapping exists
    sql += `INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (${i}, ${enr.t}, ${enr.p}, ${docId}, ${cmId}, ${Math.ceil(i / 10)}, 'Routine Checkup', ${date(i - 20)}, ${stat === 'Completed' ? date(i - 20) : 'NULL'}, '${stat}', 'Notes ${i}', 0);\n`;
}

// Adverse Events (15)
const severities = ['Mild', 'Moderate', 'Severe', 'Life Threatening'];
const aeStatuses = ['Reported', 'In Review', 'Resolved', 'Closed'];
for (let i = 1; i <= 15; i++) {
    const enr = enrollments[i % enrollments.length];
    const docId = docIds[i % docIds.length];
    const sev = severities[i % 4];
    const stat = aeStatuses[i % 4];
    sql += `INSERT INTO adverse_events (event_id, trial_id, patient_id, reported_by, event_date, severity, description, status, created_by_doctor_id, created_by_doctor_name, created_at) 
            VALUES (${i}, ${enr.t}, ${enr.p}, ${patIds[0]}, ${date(-5)}, '${sev}', 'Patient reported feeling dizzy.', '${stat}', ${docId}, '${docNames[docId - 1]}', CURRENT_TIMESTAMP);\n`;
}

// Test Results (50)
for (let i = 1; i <= 50; i++) {
    // Visit needs a valid mapping
    const visitId = (i % 40) + 1;
    // To respect referential integrity we need patient_id and doctor_id from the visit!
    // But since this is a simple script, I will just assign visitId and random ones, wait...
    // Actually test_results has constraints: fk_tr_visit, fk_tr_patient, fk_tr_doctor.
    // If patient_id doesn't match the visit's patient_id, it still works DB-wise (FK is just to patients table).
    // Let's just pick pseudo-random valid ones.
    const patId = patIds[i % patIds.length];
    const docId = docIds[i % docIds.length];
    const trStatuses = ['Normal', 'Abnormal'];
    const stat = trStatuses[i % 2];
    sql += `INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (${i}, ${visitId}, ${patId}, ${docId}, 'Blood Test ${i}', '${100 + i}', 'mg/dL', '${stat}', ${date(-2)}, CURRENT_TIMESTAMP);\n`;
}

// Notifications (30)
for (let i = 1; i <= 30; i++) {
    sql += `INSERT INTO notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (${i}, 1, 'Notice ${i}', 'This is notification ${i}', FALSE, CURRENT_TIMESTAMP);\n`;
}

// Permissions (Basic set)
sql += `INSERT INTO permissions (permission_id, permission_name) VALUES (1, 'VIEW_DASHBOARD'), (2, 'MANAGE_USERS');\n`;
sql += `INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 1), (1, 2), (2, 1);\n`;

// Settings
sql += `INSERT INTO settings (setting_id, setting_key, setting_value, updated_by, updated_at) VALUES (1, 'APP_NAME', 'CTMS PRO', 1, CURRENT_TIMESTAMP);\n`;

fs.writeFileSync(outputPath, sql);
console.log('sample_data.sql generated successfully.');
