-- Update the test property to use your real CloudMailin address
UPDATE properties 
SET cloudmailin_address = '38fab3b51608018af887@cloudmailin.net'
WHERE name = 'Demo Property';

-- Or if you want to create a new property with this address:
INSERT INTO properties (
  investor_id,
  name,
  property_type,
  address_line1,
  city,
  state,
  cloudmailin_address,
  status
) VALUES (
  (SELECT id FROM investors WHERE name = 'Demo Investor LLC' LIMIT 1),
  'Test Property 1',
  'residential',
  '123 Test St',
  'Los Angeles',
  'CA',
  '38fab3b51608018af887@cloudmailin.net',
  'active'
) ON CONFLICT (cloudmailin_address) DO UPDATE 
  SET name = EXCLUDED.name;

-- Check which property has this CloudMailin address
SELECT 
  p.name as property_name,
  p.cloudmailin_address,
  i.name as investor_name
FROM properties p
JOIN investors i ON i.id = p.investor_id
WHERE p.cloudmailin_address = '38fab3b51608018af887@cloudmailin.net';