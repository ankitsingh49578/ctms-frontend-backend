ALTER TABLE consent_forms
ADD COLUMN document_name VARCHAR(255),
ADD COLUMN document_path VARCHAR(500),
ADD COLUMN document_size BIGINT,
ADD COLUMN uploaded_by VARCHAR(100),
ADD COLUMN uploaded_date TIMESTAMP;
