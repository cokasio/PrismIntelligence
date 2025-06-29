-- Rollback migration for Financial Pipeline Tables
-- Use this if you need to remove the pipeline tables

-- Drop indexes first
DROP INDEX IF EXISTS idx_financial_raw_embedding;
DROP INDEX IF EXISTS idx_metrics_embedding;
DROP INDEX IF EXISTS idx_audit_created;
DROP INDEX IF EXISTS idx_audit_ingestion;
DROP INDEX IF EXISTS idx_metrics_name;
DROP INDEX IF EXISTS idx_metrics_period;
DROP INDEX IF EXISTS idx_metrics_company_property;
DROP INDEX IF EXISTS idx_financial_raw_type;
DROP INDEX IF EXISTS idx_financial_raw_period;
DROP INDEX IF EXISTS idx_financial_raw_property;
DROP INDEX IF EXISTS idx_financial_raw_company;
DROP INDEX IF EXISTS idx_attachments_type;
DROP INDEX IF EXISTS idx_attachments_hash;
DROP INDEX IF EXISTS idx_attachments_ingestion;
DROP INDEX IF EXISTS idx_ingestions_created;
DROP INDEX IF EXISTS idx_ingestions_company_status;

-- Drop functions
DROP FUNCTION IF EXISTS find_similar_financial_reports;
DROP FUNCTION IF EXISTS calculate_data_quality_score;

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS ingestion_audit_log;
DROP TABLE IF EXISTS field_mapping_templates;
DROP TABLE IF EXISTS financial_metrics;
DROP TABLE IF EXISTS financial_data_raw;
DROP TABLE IF EXISTS report_attachments;
DROP TABLE IF EXISTS report_ingestions;

-- Remove from migration tracking
DELETE FROM schema_migrations 
WHERE version = '20250128150000_financial_pipeline_tables.sql';