
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

-- Roles
INSERT INTO roles (role_id, role_name, description, status) VALUES (1, 'Admin', 'ADMIN Role', 'Active');
INSERT INTO roles (role_id, role_name, description, status) VALUES (2, 'Clinical Manager', 'CLINICAL_MANAGER Role', 'Active');
INSERT INTO roles (role_id, role_name, description, status) VALUES (3, 'Manager', 'TRIAL_MANAGER Role', 'Active');
INSERT INTO roles (role_id, role_name, description, status) VALUES (4, 'Doctor', 'DOCTOR Role', 'Active');
INSERT INTO roles (role_id, role_name, description, status) VALUES (5, 'Study Coordinator', 'STUDY_COORDINATOR Role', 'Active');
INSERT INTO roles (role_id, role_name, description, status) VALUES (6, 'Participant', 'PARTICIPANT Role', 'Active');

INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (1, 1, 'admin1', 'admin1@ctms.com', 'fe27ae49ea1c$5bc45e8f1039e0105987b89a848e1715e1f49819d416c57e782c1ee582e24d0f', '555-0101', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (2, 1, 'admin2', 'admin2@ctms.com', 'fe27ae49ea1c$5bc45e8f1039e0105987b89a848e1715e1f49819d416c57e782c1ee582e24d0f', '555-0102', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (3, 2, 'cm1', 'cm1@ctms.com', '61ca825a294f$41f7f2296886b1c0135be6c2849b88f8cc1b803e47971e55c9fc86fda5aa4803', '555-0103', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO clinical_managers (manager_id, user_id, manager_name, department, phone) VALUES (1, 3, 'Alex Mercer', 'Clinical Ops', '555-CM-1');
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (4, 2, 'cm2', 'cm2@ctms.com', '61ca825a294f$41f7f2296886b1c0135be6c2849b88f8cc1b803e47971e55c9fc86fda5aa4803', '555-0104', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO clinical_managers (manager_id, user_id, manager_name, department, phone) VALUES (2, 4, 'Sarah Connor', 'Clinical Ops', '555-CM-2');
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (5, 2, 'cm3', 'cm3@ctms.com', '61ca825a294f$41f7f2296886b1c0135be6c2849b88f8cc1b803e47971e55c9fc86fda5aa4803', '555-0105', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO clinical_managers (manager_id, user_id, manager_name, department, phone) VALUES (3, 5, 'David Rose', 'Clinical Ops', '555-CM-3');
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (6, 3, 'tm1', 'tm1@ctms.com', '03e1c4c5a7bb$39c41742f79d869fd9cd9455f19b56696ee6e9ea165140fb930811a12416ea1d', '555-0106', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (7, 3, 'tm2', 'tm2@ctms.com', '03e1c4c5a7bb$39c41742f79d869fd9cd9455f19b56696ee6e9ea165140fb930811a12416ea1d', '555-0107', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (8, 3, 'tm3', 'tm3@ctms.com', '03e1c4c5a7bb$39c41742f79d869fd9cd9455f19b56696ee6e9ea165140fb930811a12416ea1d', '555-0108', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (9, 4, 'doctor1', 'doctor1@ctms.com', '183d1505234e$2c98263b058dbb9161918084556cba50f4fbf80eb08267c55d9166c0eb93b8b4', '555-0109', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO doctors (doctor_id, user_id, doctor_name, specialization, license_no, phone) VALUES (1, 9, 'Dr. Gregory House', 'General Medicine', 'LIC-1001', '555-DOC-1');
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (10, 4, 'doctor2', 'doctor2@ctms.com', '183d1505234e$2c98263b058dbb9161918084556cba50f4fbf80eb08267c55d9166c0eb93b8b4', '555-0110', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO doctors (doctor_id, user_id, doctor_name, specialization, license_no, phone) VALUES (2, 10, 'Dr. Meredith Grey', 'General Medicine', 'LIC-1002', '555-DOC-2');
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (11, 4, 'doctor3', 'doctor3@ctms.com', '183d1505234e$2c98263b058dbb9161918084556cba50f4fbf80eb08267c55d9166c0eb93b8b4', '555-0111', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO doctors (doctor_id, user_id, doctor_name, specialization, license_no, phone) VALUES (3, 11, 'Dr. John Dorian', 'General Medicine', 'LIC-1003', '555-DOC-3');
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (12, 4, 'doctor4', 'doctor4@ctms.com', '183d1505234e$2c98263b058dbb9161918084556cba50f4fbf80eb08267c55d9166c0eb93b8b4', '555-0112', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO doctors (doctor_id, user_id, doctor_name, specialization, license_no, phone) VALUES (4, 12, 'Dr. Elliot Reid', 'General Medicine', 'LIC-1004', '555-DOC-4');
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (13, 4, 'doctor5', 'doctor5@ctms.com', '183d1505234e$2c98263b058dbb9161918084556cba50f4fbf80eb08267c55d9166c0eb93b8b4', '555-0113', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO doctors (doctor_id, user_id, doctor_name, specialization, license_no, phone) VALUES (5, 13, 'Dr. Perry Cox', 'General Medicine', 'LIC-1005', '555-DOC-5');
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (14, 5, 'coord1', 'coord1@ctms.com', 'e34684e8cff1$20bc3b226f14c3a042b134ed317194465d52fb46c96b9eaff16a3d35e0b1c64b', '555-0114', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (15, 5, 'coord2', 'coord2@ctms.com', 'e34684e8cff1$20bc3b226f14c3a042b134ed317194465d52fb46c96b9eaff16a3d35e0b1c64b', '555-0115', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (16, 5, 'coord3', 'coord3@ctms.com', 'e34684e8cff1$20bc3b226f14c3a042b134ed317194465d52fb46c96b9eaff16a3d35e0b1c64b', '555-0116', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (17, 5, 'coord4', 'coord4@ctms.com', 'e34684e8cff1$20bc3b226f14c3a042b134ed317194465d52fb46c96b9eaff16a3d35e0b1c64b', '555-0117', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (18, 6, 'patient1', 'patient1@ctms.com', '164401318836$03bdff5c9dd40f7a482d33aaf9a47e958082aabbda89a2b3eac377c221ead2ce', '555-0118', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO patients (patient_id, user_id, patient_code, first_name, last_name, dob, gender, phone, email, address, blood_group, status, medical_history_document_name, created_at, version) 
            VALUES (1, 18, 'PAT-1001', 'Participant', '1', '1971-01-01', 'Male', '555-PAT-1', 'patient1@ctms.com', '123 Study Ln', 'O+', 'Active', 'med_hist_1.pdf', CURRENT_TIMESTAMP, 0);
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (19, 6, 'patient2', 'patient2@ctms.com', '164401318836$03bdff5c9dd40f7a482d33aaf9a47e958082aabbda89a2b3eac377c221ead2ce', '555-0119', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO patients (patient_id, user_id, patient_code, first_name, last_name, dob, gender, phone, email, address, blood_group, status, medical_history_document_name, created_at, version) 
            VALUES (2, 19, 'PAT-1002', 'Participant', '2', '1972-01-01', 'Female', '555-PAT-2', 'patient2@ctms.com', '123 Study Ln', 'B+', 'Active', 'med_hist_2.pdf', CURRENT_TIMESTAMP, 0);
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (20, 6, 'patient3', 'patient3@ctms.com', '164401318836$03bdff5c9dd40f7a482d33aaf9a47e958082aabbda89a2b3eac377c221ead2ce', '555-0120', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO patients (patient_id, user_id, patient_code, first_name, last_name, dob, gender, phone, email, address, blood_group, status, medical_history_document_name, created_at, version) 
            VALUES (3, 20, 'PAT-1003', 'Participant', '3', '1973-01-01', 'Male', '555-PAT-3', 'patient3@ctms.com', '123 Study Ln', 'AB+', 'Active', 'med_hist_3.pdf', CURRENT_TIMESTAMP, 0);
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (21, 6, 'patient4', 'patient4@ctms.com', '164401318836$03bdff5c9dd40f7a482d33aaf9a47e958082aabbda89a2b3eac377c221ead2ce', '555-0121', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO patients (patient_id, user_id, patient_code, first_name, last_name, dob, gender, phone, email, address, blood_group, status, medical_history_document_name, created_at, version) 
            VALUES (4, 21, 'PAT-1004', 'Participant', '4', '1974-01-01', 'Female', '555-PAT-4', 'patient4@ctms.com', '123 Study Ln', 'A+', 'Active', 'med_hist_4.pdf', CURRENT_TIMESTAMP, 0);
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (22, 6, 'patient5', 'patient5@ctms.com', '164401318836$03bdff5c9dd40f7a482d33aaf9a47e958082aabbda89a2b3eac377c221ead2ce', '555-0122', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO patients (patient_id, user_id, patient_code, first_name, last_name, dob, gender, phone, email, address, blood_group, status, medical_history_document_name, created_at, version) 
            VALUES (5, 22, 'PAT-1005', 'Participant', '5', '1975-01-01', 'Male', '555-PAT-5', 'patient5@ctms.com', '123 Study Ln', 'O+', 'Active', 'med_hist_5.pdf', CURRENT_TIMESTAMP, 0);
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (23, 6, 'patient6', 'patient6@ctms.com', '164401318836$03bdff5c9dd40f7a482d33aaf9a47e958082aabbda89a2b3eac377c221ead2ce', '555-0123', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO patients (patient_id, user_id, patient_code, first_name, last_name, dob, gender, phone, email, address, blood_group, status, medical_history_document_name, created_at, version) 
            VALUES (6, 23, 'PAT-1006', 'Participant', '6', '1976-01-01', 'Female', '555-PAT-6', 'patient6@ctms.com', '123 Study Ln', 'B+', 'Active', 'med_hist_6.pdf', CURRENT_TIMESTAMP, 0);
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (24, 6, 'patient7', 'patient7@ctms.com', '164401318836$03bdff5c9dd40f7a482d33aaf9a47e958082aabbda89a2b3eac377c221ead2ce', '555-0124', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO patients (patient_id, user_id, patient_code, first_name, last_name, dob, gender, phone, email, address, blood_group, status, medical_history_document_name, created_at, version) 
            VALUES (7, 24, 'PAT-1007', 'Participant', '7', '1977-01-01', 'Male', '555-PAT-7', 'patient7@ctms.com', '123 Study Ln', 'AB+', 'Active', 'med_hist_7.pdf', CURRENT_TIMESTAMP, 0);
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (25, 6, 'patient8', 'patient8@ctms.com', '164401318836$03bdff5c9dd40f7a482d33aaf9a47e958082aabbda89a2b3eac377c221ead2ce', '555-0125', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO patients (patient_id, user_id, patient_code, first_name, last_name, dob, gender, phone, email, address, blood_group, status, medical_history_document_name, created_at, version) 
            VALUES (8, 25, 'PAT-1008', 'Participant', '8', '1978-01-01', 'Female', '555-PAT-8', 'patient8@ctms.com', '123 Study Ln', 'A+', 'Active', 'med_hist_8.pdf', CURRENT_TIMESTAMP, 0);
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (26, 6, 'patient9', 'patient9@ctms.com', '164401318836$03bdff5c9dd40f7a482d33aaf9a47e958082aabbda89a2b3eac377c221ead2ce', '555-0126', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO patients (patient_id, user_id, patient_code, first_name, last_name, dob, gender, phone, email, address, blood_group, status, medical_history_document_name, created_at, version) 
            VALUES (9, 26, 'PAT-1009', 'Participant', '9', '1979-01-01', 'Male', '555-PAT-9', 'patient9@ctms.com', '123 Study Ln', 'O+', 'Active', 'med_hist_9.pdf', CURRENT_TIMESTAMP, 0);
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (27, 6, 'patient10', 'patient10@ctms.com', '164401318836$03bdff5c9dd40f7a482d33aaf9a47e958082aabbda89a2b3eac377c221ead2ce', '555-0127', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO patients (patient_id, user_id, patient_code, first_name, last_name, dob, gender, phone, email, address, blood_group, status, medical_history_document_name, created_at, version) 
            VALUES (10, 27, 'PAT-1010', 'Participant', '10', '1980-01-01', 'Female', '555-PAT-10', 'patient10@ctms.com', '123 Study Ln', 'B+', 'Active', 'med_hist_10.pdf', CURRENT_TIMESTAMP, 0);
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (28, 6, 'patient11', 'patient11@ctms.com', '164401318836$03bdff5c9dd40f7a482d33aaf9a47e958082aabbda89a2b3eac377c221ead2ce', '555-0128', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO patients (patient_id, user_id, patient_code, first_name, last_name, dob, gender, phone, email, address, blood_group, status, medical_history_document_name, created_at, version) 
            VALUES (11, 28, 'PAT-1011', 'Participant', '11', '1981-01-01', 'Male', '555-PAT-11', 'patient11@ctms.com', '123 Study Ln', 'AB+', 'Active', 'med_hist_11.pdf', CURRENT_TIMESTAMP, 0);
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (29, 6, 'patient12', 'patient12@ctms.com', '164401318836$03bdff5c9dd40f7a482d33aaf9a47e958082aabbda89a2b3eac377c221ead2ce', '555-0129', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO patients (patient_id, user_id, patient_code, first_name, last_name, dob, gender, phone, email, address, blood_group, status, medical_history_document_name, created_at, version) 
            VALUES (12, 29, 'PAT-1012', 'Participant', '12', '1982-01-01', 'Female', '555-PAT-12', 'patient12@ctms.com', '123 Study Ln', 'A+', 'Active', 'med_hist_12.pdf', CURRENT_TIMESTAMP, 0);
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (30, 6, 'patient13', 'patient13@ctms.com', '164401318836$03bdff5c9dd40f7a482d33aaf9a47e958082aabbda89a2b3eac377c221ead2ce', '555-0130', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO patients (patient_id, user_id, patient_code, first_name, last_name, dob, gender, phone, email, address, blood_group, status, medical_history_document_name, created_at, version) 
            VALUES (13, 30, 'PAT-1013', 'Participant', '13', '1983-01-01', 'Male', '555-PAT-13', 'patient13@ctms.com', '123 Study Ln', 'O+', 'Active', 'med_hist_13.pdf', CURRENT_TIMESTAMP, 0);
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (31, 6, 'patient14', 'patient14@ctms.com', '164401318836$03bdff5c9dd40f7a482d33aaf9a47e958082aabbda89a2b3eac377c221ead2ce', '555-0131', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO patients (patient_id, user_id, patient_code, first_name, last_name, dob, gender, phone, email, address, blood_group, status, medical_history_document_name, created_at, version) 
            VALUES (14, 31, 'PAT-1014', 'Participant', '14', '1984-01-01', 'Female', '555-PAT-14', 'patient14@ctms.com', '123 Study Ln', 'B+', 'Active', 'med_hist_14.pdf', CURRENT_TIMESTAMP, 0);
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (32, 6, 'patient15', 'patient15@ctms.com', '164401318836$03bdff5c9dd40f7a482d33aaf9a47e958082aabbda89a2b3eac377c221ead2ce', '555-0132', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO patients (patient_id, user_id, patient_code, first_name, last_name, dob, gender, phone, email, address, blood_group, status, medical_history_document_name, created_at, version) 
            VALUES (15, 32, 'PAT-1015', 'Participant', '15', '1985-01-01', 'Male', '555-PAT-15', 'patient15@ctms.com', '123 Study Ln', 'AB+', 'Active', 'med_hist_15.pdf', CURRENT_TIMESTAMP, 0);
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (33, 6, 'patient16', 'patient16@ctms.com', '164401318836$03bdff5c9dd40f7a482d33aaf9a47e958082aabbda89a2b3eac377c221ead2ce', '555-0133', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO patients (patient_id, user_id, patient_code, first_name, last_name, dob, gender, phone, email, address, blood_group, status, medical_history_document_name, created_at, version) 
            VALUES (16, 33, 'PAT-1016', 'Participant', '16', '1986-01-01', 'Female', '555-PAT-16', 'patient16@ctms.com', '123 Study Ln', 'A+', 'Active', 'med_hist_16.pdf', CURRENT_TIMESTAMP, 0);
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (34, 6, 'patient17', 'patient17@ctms.com', '164401318836$03bdff5c9dd40f7a482d33aaf9a47e958082aabbda89a2b3eac377c221ead2ce', '555-0134', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO patients (patient_id, user_id, patient_code, first_name, last_name, dob, gender, phone, email, address, blood_group, status, medical_history_document_name, created_at, version) 
            VALUES (17, 34, 'PAT-1017', 'Participant', '17', '1987-01-01', 'Male', '555-PAT-17', 'patient17@ctms.com', '123 Study Ln', 'O+', 'Active', 'med_hist_17.pdf', CURRENT_TIMESTAMP, 0);
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (35, 6, 'patient18', 'patient18@ctms.com', '164401318836$03bdff5c9dd40f7a482d33aaf9a47e958082aabbda89a2b3eac377c221ead2ce', '555-0135', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO patients (patient_id, user_id, patient_code, first_name, last_name, dob, gender, phone, email, address, blood_group, status, medical_history_document_name, created_at, version) 
            VALUES (18, 35, 'PAT-1018', 'Participant', '18', '1988-01-01', 'Female', '555-PAT-18', 'patient18@ctms.com', '123 Study Ln', 'B+', 'Active', 'med_hist_18.pdf', CURRENT_TIMESTAMP, 0);
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (36, 6, 'patient19', 'patient19@ctms.com', '164401318836$03bdff5c9dd40f7a482d33aaf9a47e958082aabbda89a2b3eac377c221ead2ce', '555-0136', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO patients (patient_id, user_id, patient_code, first_name, last_name, dob, gender, phone, email, address, blood_group, status, medical_history_document_name, created_at, version) 
            VALUES (19, 36, 'PAT-1019', 'Participant', '19', '1989-01-01', 'Male', '555-PAT-19', 'patient19@ctms.com', '123 Study Ln', 'AB+', 'Active', 'med_hist_19.pdf', CURRENT_TIMESTAMP, 0);
INSERT INTO users (user_id, role_id, username, email, password, phone, status, created_at, updated_at) VALUES (37, 6, 'patient20', 'patient20@ctms.com', '164401318836$03bdff5c9dd40f7a482d33aaf9a47e958082aabbda89a2b3eac377c221ead2ce', '555-0137', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO patients (patient_id, user_id, patient_code, first_name, last_name, dob, gender, phone, email, address, blood_group, status, medical_history_document_name, created_at, version) 
            VALUES (20, 37, 'PAT-1020', 'Participant', '20', '1970-01-01', 'Female', '555-PAT-20', 'patient20@ctms.com', '123 Study Ln', 'A+', 'Active', 'med_hist_20.pdf', CURRENT_TIMESTAMP, 0);
SELECT setval('patient_code_seq', 1021, false);
INSERT INTO trials (trial_id, trial_code, trial_name, phase, description, start_date, end_date, status, created_by, created_at, version) 
            VALUES (1, 'TRL-101', 'Trial Protocol 1', 'II', 'Study description 1', '2026-05-25', '2027-04-20', 'Active', 1, CURRENT_TIMESTAMP, 0);
INSERT INTO trials (trial_id, trial_code, trial_name, phase, description, start_date, end_date, status, created_by, created_at, version) 
            VALUES (2, 'TRL-102', 'Trial Protocol 2', 'III', 'Study description 2', '2026-05-25', '2027-04-20', 'Active', 1, CURRENT_TIMESTAMP, 0);
INSERT INTO trials (trial_id, trial_code, trial_name, phase, description, start_date, end_date, status, created_by, created_at, version) 
            VALUES (3, 'TRL-103', 'Trial Protocol 3', 'IV', 'Study description 3', '2026-05-25', '2027-04-20', 'Active', 1, CURRENT_TIMESTAMP, 0);
INSERT INTO trials (trial_id, trial_code, trial_name, phase, description, start_date, end_date, status, created_by, created_at, version) 
            VALUES (4, 'TRL-104', 'Trial Protocol 4', 'I', 'Study description 4', '2026-05-25', '2027-04-20', 'Active', 1, CURRENT_TIMESTAMP, 0);
INSERT INTO trials (trial_id, trial_code, trial_name, phase, description, start_date, end_date, status, created_by, created_at, version) 
            VALUES (5, 'TRL-105', 'Trial Protocol 5', 'II', 'Study description 5', '2026-05-25', '2027-04-20', 'Active', 1, CURRENT_TIMESTAMP, 0);
INSERT INTO trials (trial_id, trial_code, trial_name, phase, description, start_date, end_date, status, created_by, created_at, version) 
            VALUES (6, 'TRL-106', 'Trial Protocol 6', 'III', 'Study description 6', '2026-05-25', '2027-04-20', 'Active', 1, CURRENT_TIMESTAMP, 0);
INSERT INTO trials (trial_id, trial_code, trial_name, phase, description, start_date, end_date, status, created_by, created_at, version) 
            VALUES (7, 'TRL-107', 'Trial Protocol 7', 'IV', 'Study description 7', '2026-05-25', '2027-04-20', 'Completed', 1, CURRENT_TIMESTAMP, 0);
INSERT INTO trials (trial_id, trial_code, trial_name, phase, description, start_date, end_date, status, created_by, created_at, version) 
            VALUES (8, 'TRL-108', 'Trial Protocol 8', 'I', 'Study description 8', '2026-05-25', '2027-04-20', 'On Hold', 1, CURRENT_TIMESTAMP, 0);
INSERT INTO trials (trial_id, trial_code, trial_name, phase, description, start_date, end_date, status, created_by, created_at, version) 
            VALUES (9, 'TRL-109', 'Trial Protocol 9', 'II', 'Study description 9', '2026-05-25', '2027-04-20', 'Terminated', 1, CURRENT_TIMESTAMP, 0);
INSERT INTO trials (trial_id, trial_code, trial_name, phase, description, start_date, end_date, status, created_by, created_at, version) 
            VALUES (10, 'TRL-110', 'Trial Protocol 10', 'III', 'Study description 10', '2026-05-25', '2027-04-20', 'Planned', 1, CURRENT_TIMESTAMP, 0);
INSERT INTO trial_assignments (trial_id, manager_id, role, assigned_date, status) VALUES (1, 2, 'Manager', '2026-05-15', 'Active');
INSERT INTO trial_assignments (trial_id, manager_id, role, assigned_date, status) VALUES (2, 3, 'Manager', '2026-05-15', 'Active');
INSERT INTO trial_assignments (trial_id, manager_id, role, assigned_date, status) VALUES (3, 1, 'Manager', '2026-05-15', 'Active');
INSERT INTO trial_assignments (trial_id, manager_id, role, assigned_date, status) VALUES (4, 2, 'Manager', '2026-05-15', 'Active');
INSERT INTO trial_assignments (trial_id, manager_id, role, assigned_date, status) VALUES (5, 3, 'Manager', '2026-05-15', 'Active');
INSERT INTO trial_assignments (trial_id, manager_id, role, assigned_date, status) VALUES (6, 1, 'Manager', '2026-05-15', 'Active');
INSERT INTO trial_assignments (trial_id, manager_id, role, assigned_date, status) VALUES (7, 2, 'Manager', '2026-05-15', 'Active');
INSERT INTO trial_assignments (trial_id, manager_id, role, assigned_date, status) VALUES (8, 3, 'Manager', '2026-05-15', 'Active');
INSERT INTO trial_assignments (trial_id, manager_id, role, assigned_date, status) VALUES (9, 1, 'Manager', '2026-05-15', 'Active');
INSERT INTO trial_assignments (trial_id, manager_id, role, assigned_date, status) VALUES (10, 2, 'Manager', '2026-05-15', 'Active');
INSERT INTO enrollments (enrollment_id, patient_id, trial_id, enrollment_date, status, version) VALUES (1, 2, 2, '2026-06-04', 'Enrolled', 0);
INSERT INTO consent_forms (consent_id, patient_id, trial_id, consent_version, consent_date, consent_status, file_path) VALUES (1, 2, 2, 'v1.0', '2026-06-03', 'Signed', 'consents/c_1.pdf');
INSERT INTO enrollments (enrollment_id, patient_id, trial_id, enrollment_date, status, version) VALUES (2, 3, 3, '2026-06-04', 'Enrolled', 0);
INSERT INTO consent_forms (consent_id, patient_id, trial_id, consent_version, consent_date, consent_status, file_path) VALUES (2, 3, 3, 'v1.0', '2026-06-03', 'Signed', 'consents/c_2.pdf');
INSERT INTO enrollments (enrollment_id, patient_id, trial_id, enrollment_date, status, version) VALUES (3, 4, 4, '2026-06-04', 'Enrolled', 0);
INSERT INTO consent_forms (consent_id, patient_id, trial_id, consent_version, consent_date, consent_status, file_path) VALUES (3, 4, 4, 'v1.0', '2026-06-03', 'Signed', 'consents/c_3.pdf');
INSERT INTO enrollments (enrollment_id, patient_id, trial_id, enrollment_date, status, version) VALUES (4, 5, 5, '2026-06-04', 'Enrolled', 0);
INSERT INTO consent_forms (consent_id, patient_id, trial_id, consent_version, consent_date, consent_status, file_path) VALUES (4, 5, 5, 'v1.0', '2026-06-03', 'Signed', 'consents/c_4.pdf');
INSERT INTO enrollments (enrollment_id, patient_id, trial_id, enrollment_date, status, version) VALUES (5, 6, 6, '2026-06-04', 'Enrolled', 0);
INSERT INTO consent_forms (consent_id, patient_id, trial_id, consent_version, consent_date, consent_status, file_path) VALUES (5, 6, 6, 'v1.0', '2026-06-03', 'Signed', 'consents/c_5.pdf');
INSERT INTO enrollments (enrollment_id, patient_id, trial_id, enrollment_date, status, version) VALUES (6, 7, 7, '2026-06-04', 'Enrolled', 0);
INSERT INTO consent_forms (consent_id, patient_id, trial_id, consent_version, consent_date, consent_status, file_path) VALUES (6, 7, 7, 'v1.0', '2026-06-03', 'Signed', 'consents/c_6.pdf');
INSERT INTO enrollments (enrollment_id, patient_id, trial_id, enrollment_date, status, version) VALUES (7, 8, 8, '2026-06-04', 'Enrolled', 0);
INSERT INTO consent_forms (consent_id, patient_id, trial_id, consent_version, consent_date, consent_status, file_path) VALUES (7, 8, 8, 'v1.0', '2026-06-03', 'Signed', 'consents/c_7.pdf');
INSERT INTO enrollments (enrollment_id, patient_id, trial_id, enrollment_date, status, version) VALUES (8, 9, 9, '2026-06-04', 'Enrolled', 0);
INSERT INTO consent_forms (consent_id, patient_id, trial_id, consent_version, consent_date, consent_status, file_path) VALUES (8, 9, 9, 'v1.0', '2026-06-03', 'Signed', 'consents/c_8.pdf');
INSERT INTO enrollments (enrollment_id, patient_id, trial_id, enrollment_date, status, version) VALUES (9, 10, 10, '2026-06-04', 'Enrolled', 0);
INSERT INTO consent_forms (consent_id, patient_id, trial_id, consent_version, consent_date, consent_status, file_path) VALUES (9, 10, 10, 'v1.0', '2026-06-03', 'Signed', 'consents/c_9.pdf');
INSERT INTO enrollments (enrollment_id, patient_id, trial_id, enrollment_date, status, version) VALUES (10, 11, 1, '2026-06-04', 'Enrolled', 0);
INSERT INTO consent_forms (consent_id, patient_id, trial_id, consent_version, consent_date, consent_status, file_path) VALUES (10, 11, 1, 'v1.0', '2026-06-03', 'Signed', 'consents/c_10.pdf');
INSERT INTO enrollments (enrollment_id, patient_id, trial_id, enrollment_date, status, version) VALUES (11, 12, 2, '2026-06-04', 'Enrolled', 0);
INSERT INTO consent_forms (consent_id, patient_id, trial_id, consent_version, consent_date, consent_status, file_path) VALUES (11, 12, 2, 'v1.0', '2026-06-03', 'Signed', 'consents/c_11.pdf');
INSERT INTO enrollments (enrollment_id, patient_id, trial_id, enrollment_date, status, version) VALUES (12, 13, 3, '2026-06-04', 'Enrolled', 0);
INSERT INTO consent_forms (consent_id, patient_id, trial_id, consent_version, consent_date, consent_status, file_path) VALUES (12, 13, 3, 'v1.0', '2026-06-03', 'Signed', 'consents/c_12.pdf');
INSERT INTO enrollments (enrollment_id, patient_id, trial_id, enrollment_date, status, version) VALUES (13, 14, 4, '2026-06-04', 'Enrolled', 0);
INSERT INTO consent_forms (consent_id, patient_id, trial_id, consent_version, consent_date, consent_status, file_path) VALUES (13, 14, 4, 'v1.0', '2026-06-03', 'Signed', 'consents/c_13.pdf');
INSERT INTO enrollments (enrollment_id, patient_id, trial_id, enrollment_date, status, version) VALUES (14, 15, 5, '2026-06-04', 'Enrolled', 0);
INSERT INTO consent_forms (consent_id, patient_id, trial_id, consent_version, consent_date, consent_status, file_path) VALUES (14, 15, 5, 'v1.0', '2026-06-03', 'Signed', 'consents/c_14.pdf');
INSERT INTO enrollments (enrollment_id, patient_id, trial_id, enrollment_date, status, version) VALUES (15, 16, 6, '2026-06-04', 'Enrolled', 0);
INSERT INTO consent_forms (consent_id, patient_id, trial_id, consent_version, consent_date, consent_status, file_path) VALUES (15, 16, 6, 'v1.0', '2026-06-03', 'Signed', 'consents/c_15.pdf');
INSERT INTO enrollments (enrollment_id, patient_id, trial_id, enrollment_date, status, version) VALUES (16, 17, 7, '2026-06-04', 'Enrolled', 0);
INSERT INTO consent_forms (consent_id, patient_id, trial_id, consent_version, consent_date, consent_status, file_path) VALUES (16, 17, 7, 'v1.0', '2026-06-03', 'Signed', 'consents/c_16.pdf');
INSERT INTO enrollments (enrollment_id, patient_id, trial_id, enrollment_date, status, version) VALUES (17, 18, 8, '2026-06-04', 'Enrolled', 0);
INSERT INTO consent_forms (consent_id, patient_id, trial_id, consent_version, consent_date, consent_status, file_path) VALUES (17, 18, 8, 'v1.0', '2026-06-03', 'Signed', 'consents/c_17.pdf');
INSERT INTO enrollments (enrollment_id, patient_id, trial_id, enrollment_date, status, version) VALUES (18, 19, 9, '2026-06-04', 'Enrolled', 0);
INSERT INTO consent_forms (consent_id, patient_id, trial_id, consent_version, consent_date, consent_status, file_path) VALUES (18, 19, 9, 'v1.0', '2026-06-03', 'Signed', 'consents/c_18.pdf');
INSERT INTO enrollments (enrollment_id, patient_id, trial_id, enrollment_date, status, version) VALUES (19, 20, 10, '2026-06-04', 'Enrolled', 0);
INSERT INTO consent_forms (consent_id, patient_id, trial_id, consent_version, consent_date, consent_status, file_path) VALUES (19, 20, 10, 'v1.0', '2026-06-03', 'Signed', 'consents/c_19.pdf');
INSERT INTO enrollments (enrollment_id, patient_id, trial_id, enrollment_date, status, version) VALUES (20, 1, 1, '2026-06-04', 'Enrolled', 0);
INSERT INTO consent_forms (consent_id, patient_id, trial_id, consent_version, consent_date, consent_status, file_path) VALUES (20, 1, 1, 'v1.0', '2026-06-03', 'Signed', 'consents/c_20.pdf');
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (1, 3, 3, 2, 2, 1, 'Routine Checkup', '2026-06-05', NULL, 'Scheduled', 'Notes 1', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (2, 4, 4, 3, 3, 1, 'Routine Checkup', '2026-06-06', '2026-06-06', 'Completed', 'Notes 2', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (3, 5, 5, 4, 1, 1, 'Routine Checkup', '2026-06-07', NULL, 'Scheduled', 'Notes 3', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (4, 6, 6, 5, 2, 1, 'Routine Checkup', '2026-06-08', '2026-06-08', 'Completed', 'Notes 4', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (5, 7, 7, 1, 3, 1, 'Routine Checkup', '2026-06-09', NULL, 'Scheduled', 'Notes 5', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (6, 8, 8, 2, 1, 1, 'Routine Checkup', '2026-06-10', '2026-06-10', 'Completed', 'Notes 6', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (7, 9, 9, 3, 2, 1, 'Routine Checkup', '2026-06-11', NULL, 'Scheduled', 'Notes 7', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (8, 10, 10, 4, 3, 1, 'Routine Checkup', '2026-06-12', '2026-06-12', 'Completed', 'Notes 8', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (9, 1, 11, 5, 1, 1, 'Routine Checkup', '2026-06-13', NULL, 'Scheduled', 'Notes 9', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (10, 2, 12, 1, 2, 1, 'Routine Checkup', '2026-06-14', '2026-06-14', 'Completed', 'Notes 10', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (11, 3, 13, 2, 3, 2, 'Routine Checkup', '2026-06-15', NULL, 'Scheduled', 'Notes 11', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (12, 4, 14, 3, 1, 2, 'Routine Checkup', '2026-06-16', '2026-06-16', 'Completed', 'Notes 12', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (13, 5, 15, 4, 2, 2, 'Routine Checkup', '2026-06-17', NULL, 'Scheduled', 'Notes 13', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (14, 6, 16, 5, 3, 2, 'Routine Checkup', '2026-06-18', '2026-06-18', 'Completed', 'Notes 14', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (15, 7, 17, 1, 1, 2, 'Routine Checkup', '2026-06-19', NULL, 'Scheduled', 'Notes 15', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (16, 8, 18, 2, 2, 2, 'Routine Checkup', '2026-06-20', '2026-06-20', 'Completed', 'Notes 16', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (17, 9, 19, 3, 3, 2, 'Routine Checkup', '2026-06-21', NULL, 'Scheduled', 'Notes 17', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (18, 10, 20, 4, 1, 2, 'Routine Checkup', '2026-06-22', '2026-06-22', 'Completed', 'Notes 18', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (19, 1, 1, 5, 2, 2, 'Routine Checkup', '2026-06-23', NULL, 'Scheduled', 'Notes 19', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (20, 2, 2, 1, 3, 2, 'Routine Checkup', '2026-06-24', '2026-06-24', 'Completed', 'Notes 20', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (21, 3, 3, 2, 1, 3, 'Routine Checkup', '2026-06-25', NULL, 'Scheduled', 'Notes 21', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (22, 4, 4, 3, 2, 3, 'Routine Checkup', '2026-06-26', '2026-06-26', 'Completed', 'Notes 22', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (23, 5, 5, 4, 3, 3, 'Routine Checkup', '2026-06-27', NULL, 'Scheduled', 'Notes 23', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (24, 6, 6, 5, 1, 3, 'Routine Checkup', '2026-06-28', '2026-06-28', 'Completed', 'Notes 24', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (25, 7, 7, 1, 2, 3, 'Routine Checkup', '2026-06-29', NULL, 'Scheduled', 'Notes 25', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (26, 8, 8, 2, 3, 3, 'Routine Checkup', '2026-06-30', '2026-06-30', 'Completed', 'Notes 26', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (27, 9, 9, 3, 1, 3, 'Routine Checkup', '2026-07-01', NULL, 'Scheduled', 'Notes 27', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (28, 10, 10, 4, 2, 3, 'Routine Checkup', '2026-07-02', '2026-07-02', 'Completed', 'Notes 28', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (29, 1, 11, 5, 3, 3, 'Routine Checkup', '2026-07-03', NULL, 'Scheduled', 'Notes 29', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (30, 2, 12, 1, 1, 3, 'Routine Checkup', '2026-07-04', '2026-07-04', 'Completed', 'Notes 30', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (31, 3, 13, 2, 2, 4, 'Routine Checkup', '2026-07-05', NULL, 'Scheduled', 'Notes 31', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (32, 4, 14, 3, 3, 4, 'Routine Checkup', '2026-07-06', '2026-07-06', 'Completed', 'Notes 32', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (33, 5, 15, 4, 1, 4, 'Routine Checkup', '2026-07-07', NULL, 'Scheduled', 'Notes 33', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (34, 6, 16, 5, 2, 4, 'Routine Checkup', '2026-07-08', '2026-07-08', 'Completed', 'Notes 34', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (35, 7, 17, 1, 3, 4, 'Routine Checkup', '2026-07-09', NULL, 'Scheduled', 'Notes 35', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (36, 8, 18, 2, 1, 4, 'Routine Checkup', '2026-07-10', '2026-07-10', 'Completed', 'Notes 36', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (37, 9, 19, 3, 2, 4, 'Routine Checkup', '2026-07-11', NULL, 'Scheduled', 'Notes 37', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (38, 10, 20, 4, 3, 4, 'Routine Checkup', '2026-07-12', '2026-07-12', 'Completed', 'Notes 38', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (39, 1, 1, 5, 1, 4, 'Routine Checkup', '2026-07-13', NULL, 'Scheduled', 'Notes 39', 0);
INSERT INTO visit_schedule (visit_id, trial_id, patient_id, doctor_id, manager_id, visit_number, visit_type, scheduled_date, actual_date, visit_status, notes, version) 
            VALUES (40, 2, 2, 1, 2, 4, 'Routine Checkup', '2026-07-14', '2026-07-14', 'Completed', 'Notes 40', 0);
INSERT INTO adverse_events (event_id, trial_id, patient_id, reported_by, event_date, severity, description, status, created_by_doctor_id, created_by_doctor_name, created_at) 
            VALUES (1, 3, 3, 1, '2026-06-19', 'Moderate', 'Patient reported feeling dizzy.', 'In Review', 2, 'Dr. Meredith Grey', CURRENT_TIMESTAMP);
INSERT INTO adverse_events (event_id, trial_id, patient_id, reported_by, event_date, severity, description, status, created_by_doctor_id, created_by_doctor_name, created_at) 
            VALUES (2, 4, 4, 1, '2026-06-19', 'Severe', 'Patient reported feeling dizzy.', 'Resolved', 3, 'Dr. John Dorian', CURRENT_TIMESTAMP);
INSERT INTO adverse_events (event_id, trial_id, patient_id, reported_by, event_date, severity, description, status, created_by_doctor_id, created_by_doctor_name, created_at) 
            VALUES (3, 5, 5, 1, '2026-06-19', 'Life Threatening', 'Patient reported feeling dizzy.', 'Closed', 4, 'Dr. Elliot Reid', CURRENT_TIMESTAMP);
INSERT INTO adverse_events (event_id, trial_id, patient_id, reported_by, event_date, severity, description, status, created_by_doctor_id, created_by_doctor_name, created_at) 
            VALUES (4, 6, 6, 1, '2026-06-19', 'Mild', 'Patient reported feeling dizzy.', 'Reported', 5, 'Dr. Perry Cox', CURRENT_TIMESTAMP);
INSERT INTO adverse_events (event_id, trial_id, patient_id, reported_by, event_date, severity, description, status, created_by_doctor_id, created_by_doctor_name, created_at) 
            VALUES (5, 7, 7, 1, '2026-06-19', 'Moderate', 'Patient reported feeling dizzy.', 'In Review', 1, 'Dr. Gregory House', CURRENT_TIMESTAMP);
INSERT INTO adverse_events (event_id, trial_id, patient_id, reported_by, event_date, severity, description, status, created_by_doctor_id, created_by_doctor_name, created_at) 
            VALUES (6, 8, 8, 1, '2026-06-19', 'Severe', 'Patient reported feeling dizzy.', 'Resolved', 2, 'Dr. Meredith Grey', CURRENT_TIMESTAMP);
INSERT INTO adverse_events (event_id, trial_id, patient_id, reported_by, event_date, severity, description, status, created_by_doctor_id, created_by_doctor_name, created_at) 
            VALUES (7, 9, 9, 1, '2026-06-19', 'Life Threatening', 'Patient reported feeling dizzy.', 'Closed', 3, 'Dr. John Dorian', CURRENT_TIMESTAMP);
INSERT INTO adverse_events (event_id, trial_id, patient_id, reported_by, event_date, severity, description, status, created_by_doctor_id, created_by_doctor_name, created_at) 
            VALUES (8, 10, 10, 1, '2026-06-19', 'Mild', 'Patient reported feeling dizzy.', 'Reported', 4, 'Dr. Elliot Reid', CURRENT_TIMESTAMP);
INSERT INTO adverse_events (event_id, trial_id, patient_id, reported_by, event_date, severity, description, status, created_by_doctor_id, created_by_doctor_name, created_at) 
            VALUES (9, 1, 11, 1, '2026-06-19', 'Moderate', 'Patient reported feeling dizzy.', 'In Review', 5, 'Dr. Perry Cox', CURRENT_TIMESTAMP);
INSERT INTO adverse_events (event_id, trial_id, patient_id, reported_by, event_date, severity, description, status, created_by_doctor_id, created_by_doctor_name, created_at) 
            VALUES (10, 2, 12, 1, '2026-06-19', 'Severe', 'Patient reported feeling dizzy.', 'Resolved', 1, 'Dr. Gregory House', CURRENT_TIMESTAMP);
INSERT INTO adverse_events (event_id, trial_id, patient_id, reported_by, event_date, severity, description, status, created_by_doctor_id, created_by_doctor_name, created_at) 
            VALUES (11, 3, 13, 1, '2026-06-19', 'Life Threatening', 'Patient reported feeling dizzy.', 'Closed', 2, 'Dr. Meredith Grey', CURRENT_TIMESTAMP);
INSERT INTO adverse_events (event_id, trial_id, patient_id, reported_by, event_date, severity, description, status, created_by_doctor_id, created_by_doctor_name, created_at) 
            VALUES (12, 4, 14, 1, '2026-06-19', 'Mild', 'Patient reported feeling dizzy.', 'Reported', 3, 'Dr. John Dorian', CURRENT_TIMESTAMP);
INSERT INTO adverse_events (event_id, trial_id, patient_id, reported_by, event_date, severity, description, status, created_by_doctor_id, created_by_doctor_name, created_at) 
            VALUES (13, 5, 15, 1, '2026-06-19', 'Moderate', 'Patient reported feeling dizzy.', 'In Review', 4, 'Dr. Elliot Reid', CURRENT_TIMESTAMP);
INSERT INTO adverse_events (event_id, trial_id, patient_id, reported_by, event_date, severity, description, status, created_by_doctor_id, created_by_doctor_name, created_at) 
            VALUES (14, 6, 16, 1, '2026-06-19', 'Severe', 'Patient reported feeling dizzy.', 'Resolved', 5, 'Dr. Perry Cox', CURRENT_TIMESTAMP);
INSERT INTO adverse_events (event_id, trial_id, patient_id, reported_by, event_date, severity, description, status, created_by_doctor_id, created_by_doctor_name, created_at) 
            VALUES (15, 7, 17, 1, '2026-06-19', 'Life Threatening', 'Patient reported feeling dizzy.', 'Closed', 1, 'Dr. Gregory House', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (1, 2, 2, 2, 'Blood Test 1', '101', 'mg/dL', 'Abnormal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (2, 3, 3, 3, 'Blood Test 2', '102', 'mg/dL', 'Normal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (3, 4, 4, 4, 'Blood Test 3', '103', 'mg/dL', 'Abnormal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (4, 5, 5, 5, 'Blood Test 4', '104', 'mg/dL', 'Normal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (5, 6, 6, 1, 'Blood Test 5', '105', 'mg/dL', 'Abnormal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (6, 7, 7, 2, 'Blood Test 6', '106', 'mg/dL', 'Normal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (7, 8, 8, 3, 'Blood Test 7', '107', 'mg/dL', 'Abnormal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (8, 9, 9, 4, 'Blood Test 8', '108', 'mg/dL', 'Normal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (9, 10, 10, 5, 'Blood Test 9', '109', 'mg/dL', 'Abnormal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (10, 11, 11, 1, 'Blood Test 10', '110', 'mg/dL', 'Normal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (11, 12, 12, 2, 'Blood Test 11', '111', 'mg/dL', 'Abnormal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (12, 13, 13, 3, 'Blood Test 12', '112', 'mg/dL', 'Normal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (13, 14, 14, 4, 'Blood Test 13', '113', 'mg/dL', 'Abnormal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (14, 15, 15, 5, 'Blood Test 14', '114', 'mg/dL', 'Normal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (15, 16, 16, 1, 'Blood Test 15', '115', 'mg/dL', 'Abnormal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (16, 17, 17, 2, 'Blood Test 16', '116', 'mg/dL', 'Normal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (17, 18, 18, 3, 'Blood Test 17', '117', 'mg/dL', 'Abnormal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (18, 19, 19, 4, 'Blood Test 18', '118', 'mg/dL', 'Normal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (19, 20, 20, 5, 'Blood Test 19', '119', 'mg/dL', 'Abnormal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (20, 21, 1, 1, 'Blood Test 20', '120', 'mg/dL', 'Normal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (21, 22, 2, 2, 'Blood Test 21', '121', 'mg/dL', 'Abnormal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (22, 23, 3, 3, 'Blood Test 22', '122', 'mg/dL', 'Normal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (23, 24, 4, 4, 'Blood Test 23', '123', 'mg/dL', 'Abnormal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (24, 25, 5, 5, 'Blood Test 24', '124', 'mg/dL', 'Normal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (25, 26, 6, 1, 'Blood Test 25', '125', 'mg/dL', 'Abnormal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (26, 27, 7, 2, 'Blood Test 26', '126', 'mg/dL', 'Normal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (27, 28, 8, 3, 'Blood Test 27', '127', 'mg/dL', 'Abnormal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (28, 29, 9, 4, 'Blood Test 28', '128', 'mg/dL', 'Normal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (29, 30, 10, 5, 'Blood Test 29', '129', 'mg/dL', 'Abnormal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (30, 31, 11, 1, 'Blood Test 30', '130', 'mg/dL', 'Normal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (31, 32, 12, 2, 'Blood Test 31', '131', 'mg/dL', 'Abnormal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (32, 33, 13, 3, 'Blood Test 32', '132', 'mg/dL', 'Normal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (33, 34, 14, 4, 'Blood Test 33', '133', 'mg/dL', 'Abnormal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (34, 35, 15, 5, 'Blood Test 34', '134', 'mg/dL', 'Normal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (35, 36, 16, 1, 'Blood Test 35', '135', 'mg/dL', 'Abnormal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (36, 37, 17, 2, 'Blood Test 36', '136', 'mg/dL', 'Normal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (37, 38, 18, 3, 'Blood Test 37', '137', 'mg/dL', 'Abnormal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (38, 39, 19, 4, 'Blood Test 38', '138', 'mg/dL', 'Normal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (39, 40, 20, 5, 'Blood Test 39', '139', 'mg/dL', 'Abnormal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (40, 1, 1, 1, 'Blood Test 40', '140', 'mg/dL', 'Normal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (41, 2, 2, 2, 'Blood Test 41', '141', 'mg/dL', 'Abnormal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (42, 3, 3, 3, 'Blood Test 42', '142', 'mg/dL', 'Normal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (43, 4, 4, 4, 'Blood Test 43', '143', 'mg/dL', 'Abnormal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (44, 5, 5, 5, 'Blood Test 44', '144', 'mg/dL', 'Normal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (45, 6, 6, 1, 'Blood Test 45', '145', 'mg/dL', 'Abnormal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (46, 7, 7, 2, 'Blood Test 46', '146', 'mg/dL', 'Normal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (47, 8, 8, 3, 'Blood Test 47', '147', 'mg/dL', 'Abnormal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (48, 9, 9, 4, 'Blood Test 48', '148', 'mg/dL', 'Normal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (49, 10, 10, 5, 'Blood Test 49', '149', 'mg/dL', 'Abnormal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO test_results (result_id, visit_id, patient_id, doctor_id, test_name, result_value, unit, result_status, collected_date, created_at) 
            VALUES (50, 11, 11, 1, 'Blood Test 50', '150', 'mg/dL', 'Normal', '2026-06-22', CURRENT_TIMESTAMP);
INSERT INTO notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (1, 1, 'Notice 1', 'This is notification 1', FALSE, CURRENT_TIMESTAMP);
INSERT INTO notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (2, 1, 'Notice 2', 'This is notification 2', FALSE, CURRENT_TIMESTAMP);
INSERT INTO notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (3, 1, 'Notice 3', 'This is notification 3', FALSE, CURRENT_TIMESTAMP);
INSERT INTO notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (4, 1, 'Notice 4', 'This is notification 4', FALSE, CURRENT_TIMESTAMP);
INSERT INTO notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (5, 1, 'Notice 5', 'This is notification 5', FALSE, CURRENT_TIMESTAMP);
INSERT INTO notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (6, 1, 'Notice 6', 'This is notification 6', FALSE, CURRENT_TIMESTAMP);
INSERT INTO notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (7, 1, 'Notice 7', 'This is notification 7', FALSE, CURRENT_TIMESTAMP);
INSERT INTO notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (8, 1, 'Notice 8', 'This is notification 8', FALSE, CURRENT_TIMESTAMP);
INSERT INTO notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (9, 1, 'Notice 9', 'This is notification 9', FALSE, CURRENT_TIMESTAMP);
INSERT INTO notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (10, 1, 'Notice 10', 'This is notification 10', FALSE, CURRENT_TIMESTAMP);
INSERT INTO notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (11, 1, 'Notice 11', 'This is notification 11', FALSE, CURRENT_TIMESTAMP);
INSERT INTO notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (12, 1, 'Notice 12', 'This is notification 12', FALSE, CURRENT_TIMESTAMP);
INSERT INTO notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (13, 1, 'Notice 13', 'This is notification 13', FALSE, CURRENT_TIMESTAMP);
INSERT INTO notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (14, 1, 'Notice 14', 'This is notification 14', FALSE, CURRENT_TIMESTAMP);
INSERT INTO notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (15, 1, 'Notice 15', 'This is notification 15', FALSE, CURRENT_TIMESTAMP);
INSERT INTO notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (16, 1, 'Notice 16', 'This is notification 16', FALSE, CURRENT_TIMESTAMP);
INSERT INTO notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (17, 1, 'Notice 17', 'This is notification 17', FALSE, CURRENT_TIMESTAMP);
INSERT INTO notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (18, 1, 'Notice 18', 'This is notification 18', FALSE, CURRENT_TIMESTAMP);
INSERT INTO notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (19, 1, 'Notice 19', 'This is notification 19', FALSE, CURRENT_TIMESTAMP);
INSERT INTO notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (20, 1, 'Notice 20', 'This is notification 20', FALSE, CURRENT_TIMESTAMP);
INSERT INTO notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (21, 1, 'Notice 21', 'This is notification 21', FALSE, CURRENT_TIMESTAMP);
INSERT INTO notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (22, 1, 'Notice 22', 'This is notification 22', FALSE, CURRENT_TIMESTAMP);
INSERT INTO notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (23, 1, 'Notice 23', 'This is notification 23', FALSE, CURRENT_TIMESTAMP);
INSERT INTO notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (24, 1, 'Notice 24', 'This is notification 24', FALSE, CURRENT_TIMESTAMP);
INSERT INTO notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (25, 1, 'Notice 25', 'This is notification 25', FALSE, CURRENT_TIMESTAMP);
INSERT INTO notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (26, 1, 'Notice 26', 'This is notification 26', FALSE, CURRENT_TIMESTAMP);
INSERT INTO notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (27, 1, 'Notice 27', 'This is notification 27', FALSE, CURRENT_TIMESTAMP);
INSERT INTO notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (28, 1, 'Notice 28', 'This is notification 28', FALSE, CURRENT_TIMESTAMP);
INSERT INTO notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (29, 1, 'Notice 29', 'This is notification 29', FALSE, CURRENT_TIMESTAMP);
INSERT INTO notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (30, 1, 'Notice 30', 'This is notification 30', FALSE, CURRENT_TIMESTAMP);
INSERT INTO permissions (permission_id, permission_name) VALUES (1, 'VIEW_DASHBOARD'), (2, 'MANAGE_USERS');
INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 1), (1, 2), (2, 1);
INSERT INTO settings (setting_id, setting_key, setting_value, updated_by, updated_at) VALUES (1, 'APP_NAME', 'CTMS PRO', 1, CURRENT_TIMESTAMP);
