ALTER TABLE patients
DROP COLUMN IF EXISTS medical_history_document_name;

ALTER TABLE patients
ADD COLUMN medical_document_name VARCHAR(255),
ADD COLUMN medical_document_path VARCHAR(500),
ADD COLUMN medical_document_size BIGINT,
ADD COLUMN uploaded_date TIMESTAMP;
