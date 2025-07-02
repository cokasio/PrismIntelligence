-- Quick setup script to run the migration
-- Run this in your Supabase SQL editor

-- First, check if the users table exists (it might not in some setups)
-- If it doesn't exist, create a simple version
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Now run the main migration
\i 002_add_task_management_roi.sql

-- Insert a default company for testing
INSERT INTO companies (id, name, domain)
VALUES ('default-company-id', 'Default Company', 'example.com')
ON CONFLICT (id) DO NOTHING;

-- Insert a default property for testing
INSERT INTO properties (id, company_id, name, address, property_type)
VALUES ('default-property-id', 'default-company-id', 'Default Property', '123 Main St', 'residential')
ON CONFLICT (id) DO NOTHING;

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('tasks', 'task_outcomes', 'roi_metrics', 'analysis_summaries')
ORDER BY table_name;