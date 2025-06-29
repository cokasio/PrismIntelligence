-- Update Financial Pipeline Tables for Multi-Tenant Structure
-- Generated: 2025-01-28
-- Description: Updates existing financial tables to use investor/property structure

-- First, we need to handle existing data if any
-- This assumes you haven't deployed yet. If you have, we'd need data migration logic

-- 1. Update report_ingestions
ALTER TABLE report_ingestions 
    RENAME COLUMN company_id TO investor_id;

ALTER TABLE report_ingestions 
    ADD COLUMN property_id UUID REFERENCES properties(id) ON DELETE CASCADE;

-- Add index for common queries
CREATE INDEX idx_report_ingestions_property ON report_ingestions(property_id);

-- 2. Update report_attachments (no changes needed, links through ingestion)

-- 3. Update financial_data_raw
ALTER TABLE financial_data_raw 
    RENAME COLUMN company_id TO investor_id;

-- Property ID already exists, just need to add constraint
ALTER TABLE financial_data_raw
    ADD CONSTRAINT financial_data_raw_property_fk 
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;

-- 4. Update financial_metrics
ALTER TABLE financial_metrics 
    RENAME COLUMN company_id TO investor_id;

ALTER TABLE financial_metrics
    ADD CONSTRAINT financial_metrics_property_fk 
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;

-- Update unique constraint
ALTER TABLE financial_metrics 
    DROP CONSTRAINT IF EXISTS financial_metrics_company_id_property_id_metric_name_peri_key;

ALTER TABLE financial_metrics
    ADD CONSTRAINT financial_metrics_investor_property_metric_period_key
    UNIQUE(investor_id, property_id, metric_name, period_start, period_end);

-- 5. Update field_mapping_templates
ALTER TABLE field_mapping_templates 
    RENAME COLUMN company_id TO investor_id;

-- Add property-specific mappings
ALTER TABLE field_mapping_templates
    ADD COLUMN property_id UUID REFERENCES properties(id) ON DELETE CASCADE;

-- Update unique constraint to allow investor and property-level mappings
ALTER TABLE field_mapping_templates
    DROP CONSTRAINT IF EXISTS field_mapping_templates_company_id_report_type_source_field_key;

ALTER TABLE field_mapping_templates
    ADD CONSTRAINT field_mapping_templates_unique_key
    UNIQUE(investor_id, property_id, report_type, source_field);

-- 6. Update audit log
ALTER TABLE ingestion_audit_log
    ADD COLUMN investor_id UUID REFERENCES investors(id) ON DELETE CASCADE;

ALTER TABLE ingestion_audit_log
    ADD COLUMN property_id UUID REFERENCES properties(id) ON DELETE CASCADE;

-- 7. Update the old reports, insights, action_items tables
ALTER TABLE reports 
    RENAME COLUMN company_id TO investor_id;

ALTER TABLE insights 
    RENAME COLUMN company_id TO investor_id;

ALTER TABLE action_items 
    RENAME COLUMN company_id TO investor_id;

ALTER TABLE entity_relationships 
    RENAME COLUMN company_id TO investor_id;

ALTER TABLE knowledge_base 
    RENAME COLUMN company_id TO investor_id;

-- 8. Drop the old companies table and related items
DROP TABLE IF EXISTS tenants CASCADE;  -- from earlier attempt
DROP TABLE IF EXISTS companies CASCADE; -- original table

-- 9. Update RLS policies for financial tables
CREATE POLICY "Users can view financial data for their investors" ON financial_data_raw
    FOR SELECT USING (
        investor_id IN (
            SELECT investor_id 
            FROM user_investor_access 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view metrics for their investors" ON financial_metrics
    FOR SELECT USING (
        investor_id IN (
            SELECT investor_id 
            FROM user_investor_access 
            WHERE user_id = auth.uid()
        )
    );

-- 10. Create email management tables
CREATE TABLE email_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    
    -- CloudMailin fields
    cloudmailin_id TEXT UNIQUE,
    to_address TEXT NOT NULL, -- The CloudMailin address it was sent to
    from_address TEXT NOT NULL,
    from_name TEXT,
    subject TEXT,
    
    -- Message content
    plain_body TEXT,
    html_body TEXT,
    headers JSONB,
    
    -- Attachments count
    attachment_count INTEGER DEFAULT 0,
    has_financial_attachments BOOLEAN DEFAULT false,
    
    -- Processing status
    status TEXT DEFAULT 'received', -- received, processing, processed, failed
    processed_at TIMESTAMP WITH TIME ZONE,
    processing_error TEXT,
    
    -- Metadata
    spam_score DECIMAL(3,2),
    virus_scanned BOOLEAN DEFAULT false,
    size_bytes INTEGER,
    
    received_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE email_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_message_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
    investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    
    -- Attachment info
    filename TEXT NOT NULL,
    content_type TEXT,
    file_size INTEGER,
    file_hash TEXT,
    
    -- Storage
    storage_path TEXT, -- S3 or local path
    storage_provider TEXT DEFAULT 'supabase', -- supabase, s3, local
    
    -- Classification
    attachment_type TEXT, -- financial_report, image, document, other
    report_type TEXT, -- income_statement, balance_sheet, etc.
    
    -- Processing link
    report_attachment_id UUID REFERENCES report_attachments(id),
    
    -- Status
    is_processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_email_attachments_email (email_message_id),
    INDEX idx_email_attachments_hash (file_hash)
);

-- Indexes for email tables
CREATE INDEX idx_email_messages_investor ON email_messages(investor_id);
CREATE INDEX idx_email_messages_property ON email_messages(property_id);
CREATE INDEX idx_email_messages_to_address ON email_messages(to_address);
CREATE INDEX idx_email_messages_received ON email_messages(received_at DESC);
CREATE INDEX idx_email_messages_status ON email_messages(status);

-- Enable RLS
ALTER TABLE email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_attachments ENABLE ROW LEVEL SECURITY;

-- Email RLS policies
CREATE POLICY "Users can view emails for their investors" ON email_messages
    FOR SELECT USING (
        investor_id IN (
            SELECT investor_id 
            FROM user_investor_access 
            WHERE user_id = auth.uid()
        )
    );