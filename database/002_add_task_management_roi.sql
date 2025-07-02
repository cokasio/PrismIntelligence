-- Task Management and ROI Tracking Migration
-- Version: 2.0.0
-- Description: Adds task management, outcomes tracking, and ROI metrics

-- Create enum types for task management
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled', 'overdue');
CREATE TYPE task_priority AS ENUM ('urgent', 'high', 'medium', 'low');
CREATE TYPE assigned_role AS ENUM ('CFO', 'PropertyManager', 'Maintenance', 'Accounting', 'Leasing', 'Other');

-- Tasks table - stores all AI-generated tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    insight_id UUID REFERENCES insights(id) ON DELETE CASCADE,
    
    -- Task details
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority INTEGER CHECK (priority >= 1 AND priority <= 5), -- 1=urgent, 5=low
    assigned_role assigned_role NOT NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL, -- Specific user assignment
    
    -- Timing
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    estimated_hours DECIMAL(5,2) DEFAULT 1.0,
    actual_hours DECIMAL(5,2),
    
    -- Value tracking
    potential_value DECIMAL(12,2) DEFAULT 0, -- Estimated value/savings
    source_insight TEXT NOT NULL, -- Which insight triggered this task
    
    -- Status tracking
    status task_status DEFAULT 'pending',
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task outcomes table - track what happened when task was completed
CREATE TABLE task_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Outcome details
    outcome_description TEXT NOT NULL,
    success_rating INTEGER CHECK (success_rating >= 1 AND success_rating <= 5), -- 1=failed, 5=exceeded
    
    -- Value realization
    actual_value_realized DECIMAL(12,2) DEFAULT 0,
    time_saved_hours DECIMAL(5,2) DEFAULT 0,
    
    -- Impact tracking
    metrics_before JSONB DEFAULT '{}', -- Metrics before task completion
    metrics_after JSONB DEFAULT '{}', -- Metrics after task completion
    
    -- Learning
    lessons_learned TEXT,
    should_repeat BOOLEAN DEFAULT true,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- ROI metrics table - aggregate metrics for ROI tracking
CREATE TABLE roi_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    
    -- Time period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    period_type TEXT CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    
    -- Analysis metrics
    total_analyses INTEGER DEFAULT 0,
    total_documents_processed INTEGER DEFAULT 0,
    ai_processing_time_seconds INTEGER DEFAULT 0,
    estimated_manual_time_hours DECIMAL(8,2) DEFAULT 0,
    time_saved_hours DECIMAL(8,2) DEFAULT 0,
    
    -- Task metrics
    tasks_generated INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    tasks_completion_rate DECIMAL(5,2) DEFAULT 0, -- Percentage
    avg_task_completion_hours DECIMAL(5,2) DEFAULT 0,
    
    -- Value metrics
    total_potential_value DECIMAL(12,2) DEFAULT 0,
    total_realized_value DECIMAL(12,2) DEFAULT 0,
    value_realization_rate DECIMAL(5,2) DEFAULT 0, -- Percentage
    
    -- Insight metrics
    total_insights_generated INTEGER DEFAULT 0,
    insights_converted_to_tasks INTEGER DEFAULT 0,
    insight_to_task_rate DECIMAL(5,2) DEFAULT 0, -- Percentage
    high_priority_insights INTEGER DEFAULT 0,
    
    -- User satisfaction
    user_satisfaction_score DECIMAL(3,2), -- 1-5 scale
    feedback_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analysis summary table - track ROI per analysis session
CREATE TABLE analysis_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    
    -- Processing metrics
    document_name TEXT NOT NULL,
    document_type TEXT,
    processing_started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    processing_completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    processing_duration_seconds INTEGER,
    
    -- AI metrics
    models_used TEXT[] DEFAULT '{}', -- ['claude', 'gemini', etc]
    total_tokens_used INTEGER DEFAULT 0,
    api_cost_estimate DECIMAL(6,4) DEFAULT 0,
    
    -- Time savings
    estimated_manual_analysis_hours DECIMAL(5,2) DEFAULT 2.0, -- Default 2 hours
    actual_ai_processing_minutes DECIMAL(5,2),
    time_saved_hours DECIMAL(5,2),
    
    -- Results
    insights_count INTEGER DEFAULT 0,
    high_priority_insights_count INTEGER DEFAULT 0,
    tasks_generated_count INTEGER DEFAULT 0,
    total_potential_value DECIMAL(12,2) DEFAULT 0,
    
    -- Metadata
    user_feedback TEXT,
    was_helpful BOOLEAN,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_assigned_role ON tasks(assigned_role);
CREATE INDEX idx_tasks_property_id ON tasks(property_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

CREATE INDEX idx_task_outcomes_task_id ON task_outcomes(task_id);
CREATE INDEX idx_task_outcomes_created_at ON task_outcomes(created_at);

CREATE INDEX idx_roi_metrics_period ON roi_metrics(period_start, period_end);
CREATE INDEX idx_roi_metrics_company_id ON roi_metrics(company_id);
CREATE INDEX idx_roi_metrics_property_id ON roi_metrics(property_id);

CREATE INDEX idx_analysis_summaries_report_id ON analysis_summaries(report_id);
CREATE INDEX idx_analysis_summaries_created_at ON analysis_summaries(created_at);

-- Create views for easy reporting
CREATE OR REPLACE VIEW v_active_tasks AS
SELECT 
    t.*,
    p.name as property_name,
    r.title as report_title,
    i.title as insight_title,
    CASE 
        WHEN t.due_date < NOW() AND t.status != 'completed' THEN 'overdue'
        WHEN t.due_date < NOW() + INTERVAL '1 day' THEN 'due_soon'
        ELSE 'on_track'
    END as urgency_status
FROM tasks t
LEFT JOIN properties p ON t.property_id = p.id
LEFT JOIN reports r ON t.report_id = r.id
LEFT JOIN insights i ON t.insight_id = i.id
WHERE t.status IN ('pending', 'in_progress');

CREATE OR REPLACE VIEW v_roi_dashboard AS
SELECT 
    company_id,
    property_id,
    SUM(time_saved_hours) as total_time_saved,
    SUM(total_realized_value) as total_value_realized,
    AVG(tasks_completion_rate) as avg_completion_rate,
    SUM(tasks_generated) as total_tasks_generated,
    SUM(tasks_completed) as total_tasks_completed
FROM roi_metrics
WHERE period_start >= NOW() - INTERVAL '30 days'
GROUP BY company_id, property_id;

-- Create functions for automatic ROI calculation
CREATE OR REPLACE FUNCTION calculate_time_saved(
    ai_processing_seconds INTEGER,
    document_type TEXT
) RETURNS DECIMAL AS $$
BEGIN
    -- Estimate manual processing time based on document type
    CASE document_type
        WHEN 'financial_report' THEN RETURN 3.0 - (ai_processing_seconds / 3600.0);
        WHEN 'rent_roll' THEN RETURN 2.0 - (ai_processing_seconds / 3600.0);
        WHEN 'maintenance_report' THEN RETURN 1.5 - (ai_processing_seconds / 3600.0);
        ELSE RETURN 2.0 - (ai_processing_seconds / 3600.0); -- Default 2 hours
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update ROI metrics when tasks are completed
CREATE OR REPLACE FUNCTION update_roi_on_task_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Update or insert ROI metrics for the current period
        INSERT INTO roi_metrics (
            company_id,
            property_id,
            period_start,
            period_end,
            period_type,
            tasks_completed,
            total_potential_value
        )
        VALUES (
            NEW.company_id,
            NEW.property_id,
            DATE_TRUNC('month', NOW()),
            DATE_TRUNC('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 day',
            'monthly',
            1,
            NEW.potential_value
        )
        ON CONFLICT (company_id, property_id, period_start, period_type)
        DO UPDATE SET
            tasks_completed = roi_metrics.tasks_completed + 1,
            total_potential_value = roi_metrics.total_potential_value + NEW.potential_value,
            updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_roi_on_task_completion
    AFTER UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_roi_on_task_completion();

-- Grant permissions (adjust based on your roles)
GRANT SELECT, INSERT, UPDATE ON tasks TO authenticated;
GRANT SELECT, INSERT ON task_outcomes TO authenticated;
GRANT SELECT ON roi_metrics TO authenticated;
GRANT SELECT, INSERT ON analysis_summaries TO authenticated;
GRANT SELECT ON v_active_tasks TO authenticated;
GRANT SELECT ON v_roi_dashboard TO authenticated;