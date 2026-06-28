-- Migration for Issue 1: Database Exception value too long for type character varying(12)
-- Drop restrictive constraints if they exist
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_document_type_check;

-- Alter existing document_type column to support longer strings (100)
ALTER TABLE documents ALTER COLUMN document_type TYPE VARCHAR(100);

-- Add new columns for document metadata
ALTER TABLE documents ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS original_file_name VARCHAR(255);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS document_category VARCHAR(100);
