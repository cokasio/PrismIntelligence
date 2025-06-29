-- Insert test data to verify everything works
-- Run this in Supabase SQL Editor after your schema is set up

-- 1. Create a test company
INSERT INTO companies (name, domain) 
VALUES ('Acme Property Management', 'acme-properties.com')
RETURNING id, name;

-- Save the company ID from above for the next queries
-- Replace 'YOUR-COMPANY-ID' with the actual UUID returned

-- 2. Create test properties
INSERT INTO properties (company_id, name, address, property_type, square_footage, units_count)
VALUES 
  ('YOUR-COMPANY-ID', 'Sunset Tower', '123 Main St, Los Angeles, CA', 'residential', 50000, 50),
  ('YOUR-COMPANY-ID', 'Downtown Plaza', '456 Market St, San Francisco, CA', 'commercial', 75000, 25),
  ('YOUR-COMPANY-ID', 'Harbor View Apartments', '789 Ocean Blvd, San Diego, CA', 'residential', 40000, 40);

-- 3. Create a test report
INSERT INTO reports (company_id, property_id, title, report_type, period_start, period_end, summary)
VALUES (
  'YOUR-COMPANY-ID',
  (SELECT id FROM properties WHERE name = 'Sunset Tower' LIMIT 1),
  'Q4 2024 Financial Report',
  'financial',
  '2024-10-01',
  '2024-12-31',
  'Strong quarter with 95% occupancy and improved NOI.'
);

-- 4. Create a test insight
INSERT INTO insights (company_id, report_id, property_id, title, description, confidence_score, category)
VALUES (
  'YOUR-COMPANY-ID',
  (SELECT id FROM reports WHERE title = 'Q4 2024 Financial Report' LIMIT 1),
  (SELECT id FROM properties WHERE name = 'Sunset Tower' LIMIT 1),
  'Occupancy Trend Positive',
  'Occupancy has increased 5% QoQ, suggesting strong market demand',
  0.92,
  'operational'
);

-- 5. Create a test action item
INSERT INTO action_items (company_id, insight_id, property_id, title, description, priority, due_date, status)
VALUES (
  'YOUR-COMPANY-ID',
  (SELECT id FROM insights WHERE title = 'Occupancy Trend Positive' LIMIT 1),
  (SELECT id FROM properties WHERE name = 'Sunset Tower' LIMIT 1),
  'Review Rental Rates',
  'Consider 3-5% rate increase for renewals given high occupancy',
  2,
  CURRENT_DATE + INTERVAL '30 days',
  'pending'
);

-- Verify your data
SELECT 'Companies:' as table_name, COUNT(*) as count FROM companies
UNION ALL
SELECT 'Properties:', COUNT(*) FROM properties
UNION ALL
SELECT 'Reports:', COUNT(*) FROM reports
UNION ALL
SELECT 'Insights:', COUNT(*) FROM insights
UNION ALL
SELECT 'Action Items:', COUNT(*) FROM action_items;