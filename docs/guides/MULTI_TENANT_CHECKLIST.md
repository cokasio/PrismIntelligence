# 🚀 Multi-Tenant Implementation Checklist

## ✅ What's Been Built

### Database Structure
- [x] `investors` table - Property owners/investment firms
- [x] `properties` table - Individual assets with unique emails
- [x] `users` table - Platform users
- [x] `user_investor_access` - Flexible permissions
- [x] `email_messages` - Track all incoming emails
- [x] `email_attachments` - Track all attachments
- [x] Updated all financial tables to use `investor_id`
- [x] Complete RLS policies

### Code Implementation
- [x] TypeScript types (`src/types/multi-tenant.ts`)
- [x] CloudMailin handler (`src/handlers/CloudMailinHandler.ts`)
- [x] API routes (`src/routes/multi-tenant.ts`)
- [x] Documentation (`docs/MULTI_TENANT_ARCHITECTURE.md`)

## 📋 Implementation Steps

### Day 1: Database Setup (2 hours)

1. **Apply migrations in Supabase**
   ```sql
   -- Run in this order:
   1. 00000000000000_create_migration_table.sql
   2. 20250128160000_multi_tenant_foundation.sql
   3. 20250128150000_financial_pipeline_tables.sql
   4. 20250128161000_update_financial_tables.sql
   ```

2. **Verify tables created**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

3. **Create first test investor**
   ```sql
   INSERT INTO investors (name, entity_type, primary_email)
   VALUES ('Test Investor LLC', 'llc', 'test@example.com')
   RETURNING id;
   ```

### Day 2: CloudMailin Setup (4 hours)

1. **Create CloudMailin account**
   - Sign up at cloudmailin.com
   - Choose HTTP POST format
   - Set webhook URL: `https://yourapp.com/webhook/cloudmailin`

2. **Configure addresses**
   - Create format: `[property-name]@[yourdomain].cloudmailin.net`
   - Update properties table with addresses

3. **Test webhook**
   ```bash
   curl -X POST http://localhost:3000/webhook/cloudmailin \
     -H "Content-Type: application/json" \
     -d @test-email.json
   ```

### Day 3: Connect Everything (4 hours)

1. **Wire up Express routes**
   ```typescript
   // In your main server file
   import multiTenantRoutes from './routes/multi-tenant';
   app.use(multiTenantRoutes);
   ```

2. **Test email flow**
   - Send test email to property address
   - Verify webhook receives it
   - Check database records created
   - Confirm attachment queued for processing

3. **Build basic UI**
   - Investor dashboard
   - Property list
   - Recent emails view
   - Processing status

### Day 4: Authentication (4 hours)

1. **Set up Supabase Auth**
   ```typescript
   // Configure auth with RLS
   const { user } = await supabase.auth.signIn({
     email,
     password
   });
   ```

2. **Implement permission checks**
   ```typescript
   // Check user has access to investor
   const hasAccess = await checkUserAccess(userId, investorId);
   ```

3. **Update RLS policies**
   - Test policies work correctly
   - Users only see their data

### Day 5: Testing & Polish (4 hours)

1. **End-to-end test**
   - Create investor
   - Add properties
   - Send emails
   - Process reports
   - View results

2. **Error handling**
   - Invalid email addresses
   - Missing properties
   - Failed processing

3. **Monitoring**
   - Log all webhook calls
   - Track processing times
   - Alert on failures

## 🔧 Configuration Needed

### Environment Variables
```env
# Add to your .env file
CLOUDMAILIN_SECRET=your-webhook-secret
CLOUDMAILIN_FORWARD_ADDRESS=default@yourdomain.com
```

### CloudMailin Settings
1. **HTTP POST Target**: Your webhook URL
2. **Format**: JSON (Normalized)
3. **Attachments**: Include as Base64
4. **SPF Check**: Recommended

### Supabase Settings
1. **Enable pgvector extension**
2. **Configure storage for attachments**
3. **Set up auth providers**

## 📊 Testing Queries

### Find all properties for an investor
```sql
SELECT * FROM properties 
WHERE investor_id = 'xxx' 
ORDER BY name;
```

### Get recent emails for a property
```sql
SELECT em.*, COUNT(ea.id) as attachments
FROM email_messages em
LEFT JOIN email_attachments ea ON ea.email_message_id = em.id
WHERE em.property_id = 'xxx'
GROUP BY em.id
ORDER BY em.received_at DESC
LIMIT 10;
```

### Check processing status
```sql
SELECT 
  p.name as property,
  em.subject,
  em.received_at,
  ea.filename,
  ea.is_processed
FROM email_attachments ea
JOIN email_messages em ON em.id = ea.email_message_id
JOIN properties p ON p.id = em.property_id
WHERE ea.attachment_type = 'financial_report'
AND ea.is_processed = false
ORDER BY em.received_at;
```

## 🎯 Success Metrics

- [ ] Can create investor with properties
- [ ] Each property has unique email
- [ ] Emails are received and stored
- [ ] Financial attachments are detected
- [ ] Pipeline processes reports
- [ ] Users see only their authorized data
- [ ] System handles 100+ emails/day

## 🚨 Common Issues

1. **"Unknown property email"**
   - Check CloudMailin address matches exactly
   - Ensure property status is 'active'

2. **"Permission denied"**
   - Check RLS policies
   - Verify user has access grant

3. **"Attachment not processed"**
   - Check file type is supported
   - Verify pipeline is running
   - Check for processing errors

## 🎉 When Complete

You'll have:
- Multi-tenant system with proper isolation
- Automatic email ingestion per property
- AI-powered financial processing
- Complete audit trail
- Scalable architecture

**Ready to onboard your first real investor!** 🚀