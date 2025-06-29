-- Property Intelligence Platform - Supabase Schema
-- Version: 1.0.0
-- Description: Complete database schema with pgvector for AI-powered property management

-- Enable the pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create enum types for better data integrity
CREATE TYPE property_type AS ENUM ('residential', 'commercial', 'industrial', 'mixed_use');
CREATE TYPE report_type AS ENUM ('financial', 'operational', 'maintenance', 'compliance', 'lease');
CREATE TYPE entity_type AS ENUM ('property', 'tenant', 'report', 'insight', 'action_item');

-- Companies table (multi-tenant support)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT UNIQUE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Properties table - core entities in your platform
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    property_type property_type,
    square_footage INTEGER,    units_count INTEGER,
    metadata JSONB DEFAULT '{}', -- Store custom fields, market data, etc.
    
    -- Vector embedding for semantic search and relationships
    embedding VECTOR(1536), -- OpenAI ada-002 embedding size
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tenants table
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_info JSONB DEFAULT '{}',
    credit_score INTEGER,
    lease_history JSONB DEFAULT '[]',
    
    -- Vector for tenant profile similarity
    embedding VECTOR(1536),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table - stores all uploaded/processed reports
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    report_type report_type,
    period_start DATE,
    period_end DATE,
    
    -- Original content and processed data
    raw_content TEXT, -- Original report text/data
    processed_data JSONB DEFAULT '{}', -- Structured extracted data
    
    -- AI-generated content
    summary TEXT,
    key_insights TEXT[],
    
    -- Vector embedding for semantic search across reports
    embedding VECTOR(1536),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insights table - AI-generated insights from reports
CREATE TABLE insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    
    title TEXT NOT NULL,    description TEXT,
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    category TEXT, -- 'financial', 'operational', 'maintenance', etc.
    
    -- The actual insight content
    insight_data JSONB DEFAULT '{}',
    
    -- Vector embedding for finding related insights
    embedding VECTOR(1536),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Action items table - specific actions generated from insights
CREATE TABLE action_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    insight_id UUID REFERENCES insights(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    
    title TEXT NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 3, -- 1 (high) to 5 (low)
    due_date DATE,
    status TEXT DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    
    assigned_to TEXT, -- Could be email or user ID
    
    -- Vector embedding for finding similar actions
    embedding VECTOR(1536),    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Relationships table - explicit connections between entities
CREATE TABLE entity_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Source entity
    source_id UUID NOT NULL,
    source_type entity_type NOT NULL,
    
    -- Target entity  
    target_id UUID NOT NULL,
    target_type entity_type NOT NULL,
    
    -- Relationship metadata
    relationship_type TEXT NOT NULL, -- 'owns', 'manages', 'related_to', 'caused_by', etc.
    strength DECIMAL(3,2) DEFAULT 1.0, -- Relationship strength 0.00 to 1.00
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate relationships
    UNIQUE(source_id, source_type, target_id, target_type, relationship_type)
);

-- Knowledge base table - stores processed insights for the AICREATE TABLE knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    tags TEXT[],
    
    -- References to source entities
    source_entities JSONB DEFAULT '[]', -- Array of {id, type} objects
    
    -- Vector embedding for semantic search
    embedding VECTOR(1536),
    
    -- Metadata for learning and improvement
    usage_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
-- Standard B-tree indexes
CREATE INDEX idx_properties_company_id ON properties(company_id);
CREATE INDEX idx_reports_company_id ON reports(company_id);
CREATE INDEX idx_reports_property_id ON reports(property_id);
CREATE INDEX idx_insights_company_id ON insights(company_id);
CREATE INDEX idx_insights_report_id ON insights(report_id);
CREATE INDEX idx_action_items_company_id ON action_items(company_id);CREATE INDEX idx_relationships_company_id ON entity_relationships(company_id);
CREATE INDEX idx_knowledge_base_company_id ON knowledge_base(company_id);

-- Vector similarity indexes using HNSW algorithm for fast similarity search
CREATE INDEX idx_properties_embedding ON properties USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_tenants_embedding ON tenants USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_reports_embedding ON reports USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_insights_embedding ON insights USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_action_items_embedding ON action_items USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_knowledge_base_embedding ON knowledge_base USING hnsw (embedding vector_cosine_ops);

-- Composite indexes for common queries
CREATE INDEX idx_reports_date_range ON reports(period_start, period_end);
CREATE INDEX idx_action_items_status_priority ON action_items(status, priority);
CREATE INDEX idx_relationships_source ON entity_relationships(source_id, source_type);
CREATE INDEX idx_relationships_target ON entity_relationships(target_id, target_type);

-- Row Level Security (RLS) policies for multi-tenancy
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- Example RLS policy (you'll need to adapt based on your auth setup)
CREATE POLICY "Users can only access their company's data" ON properties
    FOR ALL USING (company_id = (current_setting('app.current_company_id'))::UUID);
-- Add similar policies for other tables...

-- Functions for common operations

-- Function to find similar entities using vector similarity
CREATE OR REPLACE FUNCTION find_similar_entities(
    target_embedding VECTOR(1536),
    entity_table TEXT,
    company_filter UUID,
    similarity_threshold FLOAT DEFAULT 0.8,
    max_results INTEGER DEFAULT 10
)
RETURNS TABLE(
    id UUID,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY EXECUTE format(
        'SELECT id, 1 - (embedding <=> $1) as similarity 
         FROM %I 
         WHERE company_id = $2 
         AND 1 - (embedding <=> $1) > $3
         ORDER BY embedding <=> $1
         LIMIT $4',
        entity_table
    ) USING target_embedding, company_filter, similarity_threshold, max_results;
END;
$$ LANGUAGE plpgsql;

-- Function to create automatic relationships based on vector similarityCREATE OR REPLACE FUNCTION create_similarity_relationships(
    source_entity_id UUID,
    source_entity_type entity_type,
    company_filter UUID,
    similarity_threshold FLOAT DEFAULT 0.85
)
RETURNS INTEGER AS $$
DECLARE
    source_embedding VECTOR(1536);
    similar_record RECORD;
    relationships_created INTEGER := 0;
BEGIN
    -- Get the source entity's embedding
    EXECUTE format(
        'SELECT embedding FROM %s WHERE id = $1 AND company_id = $2',
        source_entity_type || 's'  -- Add 's' for table name
    ) INTO source_embedding USING source_entity_id, company_filter;
    
    -- Find similar entities across all relevant tables
    FOR similar_record IN
        SELECT 'property' as entity_type, id, 1 - (embedding <=> source_embedding) as similarity
        FROM properties 
        WHERE company_id = company_filter 
        AND id != source_entity_id
        AND 1 - (embedding <=> source_embedding) > similarity_threshold
        
        UNION ALL
        
        SELECT 'report' as entity_type, id, 1 - (embedding <=> source_embedding) as similarity        FROM reports 
        WHERE company_id = company_filter 
        AND id != source_entity_id
        AND 1 - (embedding <=> source_embedding) > similarity_threshold
        
        -- Add other entity types as needed
    LOOP
        -- Insert relationship if it doesn't exist
        INSERT INTO entity_relationships (
            company_id, source_id, source_type, target_id, target_type, 
            relationship_type, strength
        ) VALUES (
            company_filter, source_entity_id, source_entity_type, 
            similar_record.id, similar_record.entity_type::entity_type,
            'similar_to', similar_record.similarity
        ) ON CONFLICT DO NOTHING;
        
        relationships_created := relationships_created + 1;
    END LOOP;
    
    RETURN relationships_created;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;END;
$$ LANGUAGE plpgsql;

-- Apply the timestamp trigger to relevant tables
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_action_items_updated_at BEFORE UPDATE ON action_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON knowledge_base
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant appropriate permissions (adjust based on your roles)
-- GRANT USAGE ON SCHEMA public TO authenticated;
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
-- GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Schema setup complete!
-- Next steps: Configure RLS policies based on your authentication setup