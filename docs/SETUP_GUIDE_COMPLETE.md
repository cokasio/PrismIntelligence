# 🚀 Step-by-Step Migration & Setup Guide

## Step 1: Apply Migrations to Supabase

### A. Open Supabase SQL Editor
1. Go to https://app.supabase.com
2. Open your project (wxesdralkicmqedqegpb)
3. Click "SQL Editor" in the left sidebar
4. Click "New query"

### B. Run Migrations in Order

#### 1️⃣ Migration Tracking Table
```sql
-- Copy and run from: supabase/migrations/00000000000000_create_migration_table.sql
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
Click **RUN** ✅

#### 2️⃣ Multi-Tenant Foundation
```sql
-- Copy ENTIRE contents of: supabase/migrations/20250128160000_multi_tenant_foundation.sql
-- This creates investors, properties, users tables
```
Click **RUN** ✅

**Record it:**
```sql
INSERT INTO schema_migrations (version) VALUES ('20250128160000_multi_tenant_foundation.sql');
```

#### 3️⃣ Financial Pipeline Tables
```sql
-- Copy ENTIRE contents of: supabase/migrations/20250128150000_financial_pipeline_tables.sql
-- This creates report processing tables
```
Click **RUN** ✅

**Record it:**
```sql
INSERT INTO schema_migrations (version) VALUES ('20250128150000_financial_pipeline_tables.sql');
```

#### 4️⃣ Update Financial Tables
```sql
-- Copy ENTIRE contents of: supabase/migrations/20250128161000_update_financial_tables.sql
-- This updates tables for multi-tenancy
```
Click **RUN** ✅

**Record it:**
```sql
INSERT INTO schema_migrations (version) VALUES ('20250128161000_update_financial_tables.sql');
```

### C. Verify Everything Worked
```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- You should see:
-- email_attachments
-- email_messages
-- financial_data_raw
-- financial_metrics
-- investors
-- properties
-- users
-- ... and more
```

### D. Create Test Investor & Property
```sql
-- Create test investor
INSERT INTO investors (
  name, 
  entity_type, 
  primary_email,
  status,
  subscription_tier
) VALUES (
  'Demo Investor LLC',
  'llc',
  'demo@example.com',
  'active',
  'trial'
) RETURNING id;

-- Save the returned ID, then create property
-- Replace 'INVESTOR_ID' with the actual UUID from above
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
  'INVESTOR_ID', -- Replace with actual ID
  'Demo Property',
  'residential',
  '123 Test St',
  'Test City',
  'CA',
  'demo-property@prismintel.cloudmailin.net',
  'active'
) RETURNING id;
```

---

## Step 2: Set Up CloudMailin

### A. Create CloudMailin Account
1. Go to https://www.cloudmailin.com
2. Sign up for free account (25 emails/month free)
3. Verify your email

### B. Create Your First Address
1. Dashboard → "Add Address"
2. Choose format: `demo-property@prismintel.cloudmailin.net`
   (or use your custom domain if you have one)
3. Settings:
   - **Format**: JSON (Normalized)
   - **POST Format**: JSON
   - **Include Attachments**: Yes, as Base64
   - **HTTP POST URL**: 
     - Development: `https://your-ngrok-url.ngrok.io/webhook/cloudmailin`
     - Production: `https://your-app.com/webhook/cloudmailin`

### C. Configure Webhook Security
1. In CloudMailin → Your Address → Settings
2. Find "HTTP Basic Auth" or "Secret"
3. Set a secret: `your-webhook-secret-123`
4. Update your `.env`:
```env
CLOUDMAILIN_SECRET=your-webhook-secret-123
CLOUDMAILIN_USERNAME=your-cloudmailin-username
```

### D. Test CloudMailin is Working
Send a test email to your CloudMailin address and check the "Message Log" in CloudMailin dashboard.

---

## Step 3: Test Email Flow End-to-End

I'll create test scripts to verify everything works:

### E. Test Email Flow Locally

#### Option 1: Automated Test (Recommended)

**Windows:**
```bash
# Run the automated test
test-email-flow.bat
```

**Mac/Linux:**
```bash
# Make executable and run
chmod +x test-email-flow.sh
./test-email-flow.sh
```

#### Option 2: Manual Testing

**Step 1: Start Test Server**
```bash
# Terminal 1
npx ts-node test/test-server.ts

# You should see:
# 🚀 Server running on http://localhost:3000
# 📧 CloudMailin webhook: http://localhost:3000/webhook/cloudmailin
# ❤️  Health check: http://localhost:3000/health
```

**Step 2: Test with Mock Payload**
```bash
# Terminal 2
npx ts-node test/test-email-flow.ts

# You should see:
# ✅ Found property: Demo Property
# ✅ Email stored
# ✅ Attachment found
# 🎉 Email flow test complete!
```

#### Option 3: Test with Real Email

**Step 1: Set up ngrok (for local testing)**
```bash
# Install ngrok: https://ngrok.com/download
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

**Step 2: Update CloudMailin webhook**
1. Go to CloudMailin dashboard
2. Update your address webhook URL to: `https://abc123.ngrok.io/webhook/cloudmailin`
3. Save

**Step 3: Send real email**
1. Send an email to: `demo-property@prismintel.cloudmailin.net`
2. Attach a financial report (Excel or PDF)
3. Check your terminal for processing logs
4. Check database for stored records

### F. Verify Everything Works

Run these queries in Supabase SQL Editor:

```sql
-- Check recent emails
SELECT 
  em.id,
  em.subject,
  em.from_address,
  em.received_at,
  p.name as property_name,
  COUNT(ea.id) as attachment_count
FROM email_messages em
JOIN properties p ON p.id = em.property_id
LEFT JOIN email_attachments ea ON ea.email_message_id = em.id
GROUP BY em.id, p.name
ORDER BY em.received_at DESC
LIMIT 10;

-- Check attachments
SELECT 
  ea.filename,
  ea.attachment_type,
  ea.is_processed,
  em.subject,
  p.name as property_name
FROM email_attachments ea
JOIN email_messages em ON em.id = ea.email_message_id
JOIN properties p ON p.id = em.property_id
ORDER BY ea.created_at DESC
LIMIT 10;

-- Check processing queue
SELECT 
  ri.status,
  ri.started_at,
  ri.completed_at,
  ra.filename,
  p.name as property_name
FROM report_ingestions ri
LEFT JOIN report_attachments ra ON ra.ingestion_id = ri.id
LEFT JOIN properties p ON p.id = ri.property_id
ORDER BY ri.created_at DESC
LIMIT 10;
```

---

## 🎉 Success Checklist

- [ ] **Database Setup**
  - [ ] All migrations applied
  - [ ] Test investor created
  - [ ] Test property created with CloudMailin address

- [ ] **CloudMailin Setup**
  - [ ] Account created
  - [ ] Email address configured
  - [ ] Webhook URL set
  - [ ] Secret configured

- [ ] **Email Flow Testing**
  - [ ] Test server runs successfully
  - [ ] Mock email processed
  - [ ] Email stored in database
  - [ ] Attachments tracked
  - [ ] Financial reports detected

## 🚨 Troubleshooting

### "Server not running"
```bash
# Make sure dependencies installed
npm install express @supabase/supabase-js axios

# Check if port 3000 is in use
netstat -an | grep 3000
```

### "Unknown property email"
- Check CloudMailin address exactly matches database
- Ensure property status is 'active'
- Verify investor exists

### "No emails stored"
- Check CloudMailin webhook logs
- Verify webhook URL is correct
- Check server console for errors

### "Webhook signature invalid"
- For testing, temporarily disable signature verification
- Update CLOUDMAILIN_SECRET in .env

## 🎯 Next Steps

Now that email flow is working:

1. **Connect Financial Pipeline**
   - Implement PDF/Excel extractors
   - Enable AI classification
   - Test report processing

2. **Build UI**
   - Investor dashboard
   - Property list
   - Email/report viewer

3. **Production Setup**
   - Deploy to hosting
   - Configure production webhook
   - Set up monitoring

---

**Congratulations! Your multi-tenant email ingestion system is working!** 🚀

Each property can now receive emails at its unique address, attachments are automatically detected, and financial reports are queued for AI processing.