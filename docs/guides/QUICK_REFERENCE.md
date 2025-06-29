# 🎯 Quick Reference - Multi-Tenant Email System

## Essential Info

**Your Supabase Project**: wxesdralkicmqedqegpb
**Test Property Email**: demo-property@prismintel.cloudmailin.net
**Webhook URL**: http://localhost:3000/webhook/cloudmailin

## Key Commands

### Start Test Server
```bash
npx ts-node test/test-server.ts
```

### Run Email Test
```bash
npx ts-node test/test-email-flow.ts
```

### Quick Test (Windows)
```bash
test-email-flow.bat
```

### Quick Test (Mac/Linux)
```bash
./test-email-flow.sh
```

## Database Queries

### Check Recent Emails
```sql
SELECT * FROM email_messages 
ORDER BY received_at DESC 
LIMIT 10;
```

### Check Properties
```sql
SELECT 
  p.name,
  p.cloudmailin_address,
  i.name as investor_name
FROM properties p
JOIN investors i ON i.id = p.investor_id;
```

### Check Processing Status
```sql
SELECT 
  ea.filename,
  ea.is_processed,
  em.subject
FROM email_attachments ea
JOIN email_messages em ON em.id = ea.email_message_id
WHERE ea.attachment_type = 'financial_report'
ORDER BY ea.created_at DESC;
```

## CloudMailin Setup

1. **Webhook URL Format**: 
   - Dev: `https://[ngrok-id].ngrok.io/webhook/cloudmailin`
   - Prod: `https://[your-domain]/webhook/cloudmailin`

2. **Email Format**: `[property-name]@[your-subdomain].cloudmailin.net`

3. **Settings**:
   - Format: JSON (Normalized)
   - Attachments: Base64
   - HTTP POST

## File Locations

```
src/
├── handlers/CloudMailinHandler.ts   # Webhook handler
├── routes/multi-tenant.ts          # API routes
├── types/multi-tenant.ts           # TypeScript types
└── pipeline/FinancialPipeline.ts   # Processing pipeline

test/
├── test-server.ts                  # Test server
├── test-email-flow.ts              # E2E test
└── mock-cloudmailin-payload.json   # Test data

supabase/migrations/
├── 20250128160000_multi_tenant_foundation.sql
└── 20250128161000_update_financial_tables.sql
```

## Environment Variables

```env
# Required for email processing
CLOUDMAILIN_SECRET=your-secret
CLOUDMAILIN_USERNAME=your-username

# Already configured
SUPABASE_URL=https://wxesdralkicmqedqegpb.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
ANTHROPIC_API_KEY=your-api-key
```

## Next Steps Checklist

- [ ] Set up Supabase Storage for attachments
- [ ] Complete PDF/CSV extractors
- [ ] Test with real CloudMailin emails
- [ ] Build investor dashboard UI
- [ ] Deploy to production
- [ ] Configure custom domain (optional)

---

**Everything is working! Send test emails to demo-property@prismintel.cloudmailin.net** 🚀