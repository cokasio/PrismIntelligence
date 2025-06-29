-- Financial Pipeline Tables Migration
-- Generated: 2025-01-28
-- Description: Adds tables for the AI-driven financial report ingestion pipeline

-- Report ingestion tracking
CREATE TABLE report_ingestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  email_id TEXT,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attachment processing
CREATE TABLE report_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingestion_id UUID REFERENCES report_ingestions(id),
  filename TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  file_hash TEXT UNIQUE,
  storage_path TEXT,
  
  -- Classification results
  report_type TEXT,
  structure_type TEXT, -- structured, semi_structured, unstructured
  classification_confidence DECIMAL(3,2),
  classification_metadata JSONB DEFAULT '{}',
  
  -- Processing status
  extraction_status TEXT DEFAULT 'pending',
  extraction_started_at TIMESTAMP WITH TIME ZONE,
  extraction_completed_at TIMESTAMP WITH TIME ZONE,
  extraction_metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Extracted financial data (flexible schema)
CREATE TABLE financial_data_raw (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attachment_id UUID REFERENCES report_attachments(id),
  company_id UUID REFERENCES companies(id),
  property_id UUID REFERENCES properties(id),
  
  -- Flexible data storage
  data_type TEXT NOT NULL, -- income_statement, balance_sheet, etc.
  period_start DATE,
  period_end DATE,
  currency TEXT DEFAULT 'USD',
  
  -- Raw extracted data (original format)
  raw_data JSONB NOT NULL,
  
  -- Normalized data (standardized schema)
  normalized_data JSONB,
  
  -- Quality metrics
  quality_score DECIMAL(3,2),
  completeness_score DECIMAL(3,2),
  validation_results JSONB DEFAULT '{}',
  manual_review_required BOOLEAN DEFAULT false,
  
  -- Embeddings for search
  embedding VECTOR(1536),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Standardized financial metrics (normalized KPIs)
CREATE TABLE financial_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  property_id UUID REFERENCES properties(id),
  source_id UUID REFERENCES financial_data_raw(id),
  
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(20,2),
  metric_unit TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Context and lineage
  calculation_method TEXT,
  confidence_score DECIMAL(3,2),
  is_derived BOOLEAN DEFAULT false,
  derivation_formula TEXT,
  
  -- For semantic search
  embedding VECTOR(1536),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique metrics per period
  UNIQUE(company_id, property_id, metric_name, period_start, period_end)
);

-- Field mapping templates (learns from usage)
CREATE TABLE field_mapping_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  report_type TEXT NOT NULL,
  source_field TEXT NOT NULL,
  target_field TEXT NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 1.0,
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique mapping per company and report type
  UNIQUE(company_id, report_type, source_field)
);

-- Audit trail for compliance
CREATE TABLE ingestion_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingestion_id UUID REFERENCES report_ingestions(id),
  attachment_id UUID REFERENCES report_attachments(id),
  action TEXT NOT NULL,
  action_type TEXT, -- classification, extraction, validation, storage
  details JSONB DEFAULT '{}',
  performed_by TEXT,
  ai_model_used TEXT,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_ingestions_company_status ON report_ingestions(company_id, status);
CREATE INDEX idx_ingestions_created ON report_ingestions(created_at DESC);

CREATE INDEX idx_attachments_ingestion ON report_attachments(ingestion_id);
CREATE INDEX idx_attachments_hash ON report_attachments(file_hash);
CREATE INDEX idx_attachments_type ON report_attachments(report_type);

CREATE INDEX idx_financial_raw_company ON financial_data_raw(company_id);
CREATE INDEX idx_financial_raw_property ON financial_data_raw(property_id);
CREATE INDEX idx_financial_raw_period ON financial_data_raw(period_start, period_end);
CREATE INDEX idx_financial_raw_type ON financial_data_raw(data_type);

CREATE INDEX idx_metrics_company_property ON financial_metrics(company_id, property_id);
CREATE INDEX idx_metrics_period ON financial_metrics(period_start, period_end);
CREATE INDEX idx_metrics_name ON financial_metrics(metric_name);

CREATE INDEX idx_audit_ingestion ON ingestion_audit_log(ingestion_id);
CREATE INDEX idx_audit_created ON ingestion_audit_log(created_at DESC);

-- Vector indexes for similarity search
CREATE INDEX idx_financial_raw_embedding ON financial_data_raw USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_metrics_embedding ON financial_metrics USING hnsw (embedding vector_cosine_ops);

-- Enable RLS
ALTER TABLE report_ingestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_data_raw ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_mapping_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingestion_audit_log ENABLE ROW LEVEL SECURITY;

-- Add triggers for updated_at
CREATE TRIGGER update_ingestions_updated_at BEFORE UPDATE ON report_ingestions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attachments_updated_at BEFORE UPDATE ON report_attachments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_raw_updated_at BEFORE UPDATE ON financial_data_raw
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate quality score
CREATE OR REPLACE FUNCTION calculate_data_quality_score(
    completeness DECIMAL,
    validation_passed INTEGER,
    validation_total INTEGER,
    confidence DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
    RETURN ROUND(
        (completeness * 0.4 + 
         (validation_passed::DECIMAL / NULLIF(validation_total, 0)) * 0.4 + 
         confidence * 0.2)::DECIMAL, 
        2
    );
END;
$$ LANGUAGE plpgsql;

-- Function to find similar financial reports
CREATE OR REPLACE FUNCTION find_similar_financial_reports(
    target_embedding VECTOR(1536),
    company_filter UUID,
    report_type_filter TEXT DEFAULT NULL,
    similarity_threshold FLOAT DEFAULT 0.8,
    max_results INTEGER DEFAULT 10
)
RETURNS TABLE(
    id UUID,
    attachment_id UUID,
    data_type TEXT,
    period_start DATE,
    period_end DATE,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.attachment_id,
        f.data_type,
        f.period_start,
        f.period_end,
        1 - (f.embedding <=> target_embedding) as similarity
    FROM financial_data_raw f
    WHERE f.company_id = company_filter
    AND (report_type_filter IS NULL OR f.data_type = report_type_filter)
    AND f.embedding IS NOT NULL
    AND 1 - (f.embedding <=> target_embedding) > similarity_threshold
    ORDER BY f.embedding <=> target_embedding
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;