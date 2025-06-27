-- Prism Intelligence Database Schema
-- This schema defines the structure for storing all property management intelligence
-- Designed for PostgreSQL (via Supabase)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector"; -- For AI embeddings

-- Create custom types for better data integrity
CREATE TYPE report_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE report_type AS ENUM ('financial', 'operational', 'rent_roll', 'maintenance', 'other');
CREATE TYPE insight_category AS ENUM ('revenue', 'expense', 'occupancy', 'maintenance', 'risk', 'opportunity');
CREATE TYPE action_priority AS ENUM ('urgent', 'high', 'medium', 'low');
CREATE TYPE action_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- Organizations table (for multi-tenant support)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email_domain VARCHAR(255),
    settings JSONB DEFAULT '{}',
    subscription_tier VARCHAR(50) DEFAULT 'starter',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX idx_organizations_email_domain ON organizations(email_domain);

-- Users table (property managers, analysts, etc.)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'viewer',
    preferences JSONB DEFAULT '{}',
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
-- Properties table (the buildings/assets being managed)
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    external_id VARCHAR(255), -- ID from client's system
    name VARCHAR(255) NOT NULL,
    address JSONB NOT NULL, -- Structured address data
    property_type VARCHAR(100),
    total_units INTEGER,
    total_square_feet INTEGER,
    metadata JSONB DEFAULT '{}', -- Flexible storage for property-specific data
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX idx_properties_organization ON properties(organization_id);
CREATE INDEX idx_properties_external_id ON properties(external_id);
CREATE INDEX idx_properties_name ON properties(name);

-- Reports table (stores information about each uploaded report)
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Report metadata
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- pdf, excel, csv
    file_size_bytes BIGINT NOT NULL,
    file_url TEXT NOT NULL, -- Secure URL to stored file
    
    -- Processing information
    status report_status NOT NULL DEFAULT 'pending',
    report_type report_type,
    report_period_start DATE,
    report_period_end DATE,
    
    -- Tracking fields
    processing_started_at TIMESTAMP WITH TIME ZONE,
    processing_completed_at TIMESTAMP WITH TIME ZONE,
    processing_duration_ms INTEGER,
    error_message TEXT,
    
    -- Email tracking
    sender_email VARCHAR(255),
    email_subject TEXT,
    confirmation_sent BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX idx_reports_organization ON reports(organization_id);
CREATE INDEX idx_reports_property ON reports(property_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created ON reports(created_at DESC);
-- Insights table (AI-generated insights from reports)
CREATE TABLE insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    
    -- The actual insight
    insight_text TEXT NOT NULL,
    insight_summary VARCHAR(500), -- Brief version for dashboards
    category insight_category NOT NULL,
    
    -- Importance and confidence
    priority INTEGER CHECK (priority >= 1 AND priority <= 5), -- 5 being highest
    confidence_score DECIMAL(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    
    -- Supporting data
    supporting_data JSONB DEFAULT '{}', -- Numbers, calculations that support the insight
    compared_to_previous JSONB, -- Comparison with previous period
    
    -- For AI learning and improvement
    embedding vector(1536), -- For semantic search and similarity
    was_helpful BOOLEAN, -- User feedback
    user_notes TEXT, -- User can add context
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient querying and search
CREATE INDEX idx_insights_report ON insights(report_id);
CREATE INDEX idx_insights_organization ON insights(organization_id);
CREATE INDEX idx_insights_property ON insights(property_id);
CREATE INDEX idx_insights_category ON insights(category);
CREATE INDEX idx_insights_priority ON insights(priority DESC);
CREATE INDEX idx_insights_created ON insights(created_at DESC);

-- Create index for vector similarity search (for finding similar insights)
CREATE INDEX idx_insights_embedding ON insights USING ivfflat (embedding vector_cosine_ops);

-- Actions table (AI-recommended actions based on insights)
CREATE TABLE actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    insight_id UUID REFERENCES insights(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    
    -- The action details
    action_text TEXT NOT NULL,
    action_type VARCHAR(100), -- maintenance, financial, tenant_relations, etc.
    priority action_priority NOT NULL,
    status action_status DEFAULT 'pending',
    
    -- Assignment and timing
    assigned_to VARCHAR(255), -- Email or role
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID REFERENCES users(id),
    
    -- Expected impact
    expected_impact TEXT,
    estimated_value DECIMAL(12, 2), -- Potential $ impact
    
    -- Tracking
    notes TEXT,
    attachments JSONB DEFAULT '[]', -- Links to relevant documents
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for action management
CREATE INDEX idx_actions_report ON actions(report_id);
CREATE INDEX idx_actions_insight ON actions(insight_id);
CREATE INDEX idx_actions_organization ON actions(organization_id);
CREATE INDEX idx_actions_property ON actions(property_id);
CREATE INDEX idx_actions_status ON actions(status);
CREATE INDEX idx_actions_priority ON actions(priority);
CREATE INDEX idx_actions_due_date ON actions(due_date);
CREATE INDEX idx_actions_assigned ON actions(assigned_to);
-- Extracted metrics table (raw numbers pulled from reports for trending)
CREATE TABLE extracted_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    
    -- Metric identification
    metric_name VARCHAR(255) NOT NULL, -- e.g., "total_revenue", "occupancy_rate"
    metric_category VARCHAR(100), -- revenue, expense, occupancy, maintenance
    
    -- The actual values
    metric_value DECIMAL(20, 4),
    metric_unit VARCHAR(50), -- dollars, percentage, count, etc.
    
    -- Context
    period_start DATE,
    period_end DATE,
    is_calculated BOOLEAN DEFAULT false, -- Was this derived vs directly extracted?
    calculation_method TEXT, -- How it was calculated if derived
    
    -- For data quality
    confidence_score DECIMAL(3, 2),
    source_location TEXT, -- Where in the report this came from
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for trending and analysis
CREATE INDEX idx_metrics_report ON extracted_metrics(report_id);
CREATE INDEX idx_metrics_organization ON extracted_metrics(organization_id);
CREATE INDEX idx_metrics_property ON extracted_metrics(property_id);
CREATE INDEX idx_metrics_name ON extracted_metrics(metric_name);
CREATE INDEX idx_metrics_category ON extracted_metrics(metric_category);
CREATE INDEX idx_metrics_period ON extracted_metrics(period_start, period_end);

-- Processing logs table (detailed audit trail of report processing)
CREATE TABLE processing_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    
    -- What happened
    stage VARCHAR(100) NOT NULL, -- ingestion, parsing, ai_pass_1, etc.
    status VARCHAR(50) NOT NULL, -- started, completed, failed
    
    -- Details
    message TEXT,
    error_details JSONB,
    
    -- Performance tracking
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,
    
    -- Resource usage (for optimization)
    tokens_used INTEGER,
    api_calls_made INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for debugging and monitoring
CREATE INDEX idx_processing_logs_report ON processing_logs(report_id);
CREATE INDEX idx_processing_logs_stage ON processing_logs(stage);
CREATE INDEX idx_processing_logs_status ON processing_logs(status);
CREATE INDEX idx_processing_logs_created ON processing_logs(created_at DESC);

-- Email communications table (track all emails sent)
CREATE TABLE email_communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Email details
    recipient_email VARCHAR(255) NOT NULL,
    email_type VARCHAR(50) NOT NULL, -- confirmation, report_ready, error_notification
    subject TEXT NOT NULL,
    
    -- Tracking
    sent_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    sendgrid_message_id VARCHAR(255),
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, sent, delivered, failed
    error_message TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_emails_report ON email_communications(report_id);
CREATE INDEX idx_emails_organization ON email_communications(organization_id);
CREATE INDEX idx_emails_recipient ON email_communications(recipient_email);
CREATE INDEX idx_emails_type ON email_communications(email_type);

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to all tables with updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_insights_updated_at BEFORE UPDATE ON insights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_actions_updated_at BEFORE UPDATE ON actions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Add table comments for documentation
COMMENT ON TABLE organizations IS 'Property management companies using Prism Intelligence';
COMMENT ON TABLE users IS 'Individual users within organizations';
COMMENT ON TABLE properties IS 'Properties being managed by organizations';
COMMENT ON TABLE reports IS 'Uploaded property management reports awaiting or completed processing';
COMMENT ON TABLE insights IS 'AI-generated insights extracted from processed reports';
COMMENT ON TABLE actions IS 'Recommended actions based on insights, with tracking';
COMMENT ON TABLE extracted_metrics IS 'Raw numerical data extracted from reports for trending';
COMMENT ON TABLE processing_logs IS 'Detailed audit trail of report processing steps';
COMMENT ON TABLE email_communications IS 'Track all email communications sent by the system';

-- Grant appropriate permissions (adjust based on your Supabase setup)
-- This ensures Row Level Security (RLS) works properly
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE extracted_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_communications ENABLE ROW LEVEL SECURITY;