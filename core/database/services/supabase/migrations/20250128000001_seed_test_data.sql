-- Test Data Migration for Property Intelligence Platform
-- Generated: 2025-01-28
-- Description: Seeds initial test data for development and testing

-- Note: This migration is optional and should only be run in development environments

-- 1. Create a test company
INSERT INTO companies (id, name, domain) 
VALUES ('11111111-1111-1111-1111-111111111111', 'Acme Property Management', 'acme-properties.com')
ON CONFLICT (id) DO NOTHING;

-- 2. Create test properties
INSERT INTO properties (company_id, name, address, property_type, square_footage, units_count)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Sunset Tower', '123 Main St, Los Angeles, CA', 'residential', 50000, 50),
  ('11111111-1111-1111-1111-111111111111', 'Downtown Plaza', '456 Market St, San Francisco, CA', 'commercial', 75000, 25),
  ('11111111-1111-1111-1111-111111111111', 'Harbor View Apartments', '789 Ocean Blvd, San Diego, CA', 'residential', 40000, 40)
ON CONFLICT DO NOTHING;

-- 3. Create test tenants
INSERT INTO tenants (company_id, name, contact_info, credit_score)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'ABC Corporation', '{"email": "contact@abc-corp.com", "phone": "555-0100"}', 750),
  ('11111111-1111-1111-1111-111111111111', 'John Doe', '{"email": "john.doe@email.com", "phone": "555-0101"}', 720),
  ('11111111-1111-1111-1111-111111111111', 'XYZ Enterprises', '{"email": "info@xyz.com", "phone": "555-0102"}', 800)
ON CONFLICT DO NOTHING;

-- 4. Create a test report
INSERT INTO reports (
    company_id, 
    property_id, 
    title, 
    report_type, 
    period_start, 
    period_end, 
    summary,
    key_insights
)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  (SELECT id FROM properties WHERE name = 'Sunset Tower' AND company_id = '11111111-1111-1111-1111-111111111111' LIMIT 1),
  'Q4 2024 Financial Report',
  'financial',
  '2024-10-01',
  '2024-12-31',
  'Strong quarter with 95% occupancy and improved NOI. Total revenue increased 8% YoY.',
  ARRAY['Occupancy rate at 95%', 'NOI improved by 12%', 'Maintenance costs down 5%']
)
ON CONFLICT DO NOTHING;

-- 5. Create test insights
INSERT INTO insights (
    company_id, 
    report_id, 
    property_id, 
    title, 
    description, 
    confidence_score, 
    category,
    insight_data
)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  (SELECT id FROM reports WHERE title = 'Q4 2024 Financial Report' AND company_id = '11111111-1111-1111-1111-111111111111' LIMIT 1),
  (SELECT id FROM properties WHERE name = 'Sunset Tower' AND company_id = '11111111-1111-1111-1111-111111111111' LIMIT 1),
  'Occupancy Trend Positive',
  'Occupancy has increased 5% QoQ, suggesting strong market demand. This is above market average of 3% growth.',
  0.92,
  'operational',
  '{"trend": "increasing", "change_percent": 5, "market_comparison": "above_average"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- 6. Create test action items
INSERT INTO action_items (
    company_id, 
    insight_id, 
    property_id, 
    title, 
    description, 
    priority, 
    due_date, 
    status,
    assigned_to
)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  (SELECT id FROM insights WHERE title = 'Occupancy Trend Positive' AND company_id = '11111111-1111-1111-1111-111111111111' LIMIT 1),
  (SELECT id FROM properties WHERE name = 'Sunset Tower' AND company_id = '11111111-1111-1111-1111-111111111111' LIMIT 1),
  'Review Rental Rates',
  'Consider 3-5% rate increase for renewals given high occupancy and market conditions',
  2,
  CURRENT_DATE + INTERVAL '30 days',
  'pending',
  'property.manager@acme-properties.com'
)
ON CONFLICT DO NOTHING;

-- 7. Add some knowledge base entries
INSERT INTO knowledge_base (
    company_id,
    title,
    content,
    category,
    tags
)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Optimal Occupancy Rate Guidelines',
  'Based on historical data, properties perform best with 92-96% occupancy. Above 96% suggests potential for rate increases.',
  'operational',
  ARRAY['occupancy', 'pricing', 'guidelines']
)
ON CONFLICT DO NOTHING;

-- Verify test data was inserted
DO $$
BEGIN
    RAISE NOTICE 'Test data migration complete. Counts:';
    RAISE NOTICE 'Companies: %', (SELECT COUNT(*) FROM companies WHERE id = '11111111-1111-1111-1111-111111111111');
    RAISE NOTICE 'Properties: %', (SELECT COUNT(*) FROM properties WHERE company_id = '11111111-1111-1111-1111-111111111111');
    RAISE NOTICE 'Reports: %', (SELECT COUNT(*) FROM reports WHERE company_id = '11111111-1111-1111-1111-111111111111');
    RAISE NOTICE 'Insights: %', (SELECT COUNT(*) FROM insights WHERE company_id = '11111111-1111-1111-1111-111111111111');
    RAISE NOTICE 'Action Items: %', (SELECT COUNT(*) FROM action_items WHERE company_id = '11111111-1111-1111-1111-111111111111');
END $$;