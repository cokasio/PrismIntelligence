# Migration: SendGrid → CloudMailin

## Why CloudMailin is Better for PrismIntelligence

1. **Purpose-built for receiving emails** (SendGrid is primarily for sending)
2. **Better attachment handling** with direct base64 content
3. **Cleaner webhook format** - no parsing needed
4. **Built-in multi-tenancy** with flexible addressing
5. **You already have it!**

## Quick Migration Steps

### 1. Update Your CloudMailin Settings

Log into CloudMailin: https://www.cloudmailin.com/accounts/ca27ba5e421c3976

Configure your address:
- **Format**: `tenant@reports.yourdomain.com` or `reports+tenant@yourdomain.com`
- **Target URL**: `https://your-api.com/api/webhooks/cloudmailin`
- **POST Format**: JSON (Normalized)

### 2. Update Environment Variables

```env
# .env - Remove SendGrid, add CloudMailin
# SENDGRID_API_KEY=xxx  # Remove this
# SENDGRID_FROM_EMAIL=xxx  # Remove this

# Add CloudMailin config
CLOUDMAILIN_ADDRESS=your-address@cloudmailin.net
CLOUDMAILIN_SECRET=your-webhook-secret  # For webhook verification
```

### 3. Replace Webhook Route

```typescript
// In src/api/routes.ts, replace the SendGrid webhook with:
import cloudmailinRouter from './cloudmailin-webhook';

// Replace this line:
// router.post('/webhooks/sendgrid/inbound', ...)

// With:
router.use('/webhooks/cloudmailin', cloudmailinRouter);
```

### 4. Update Email Service

For sending results back, you have options:

**Option A: Use SMTP (Recommended)**
```typescript
// src/services/email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // or any SMTP service
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
```

**Option B: Use CloudMailin's Outbound (if available on your plan)**
```typescript
// CloudMailin can also send emails via API
const sendEmail = async (to: string, subject: string, html: string) => {
  await fetch('https://api.cloudmailin.com/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CLOUDMAILIN_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ to, subject, html })
  });
};
```

**Option C: Remove email sending for MVP**
- Just store results in database
- Users check via web interface or API

### 5. Multi-Tenant Email Setup

CloudMailin makes multi-tenancy elegant:

```
# Single domain, multiple tenants:
tenant1@reports.yourdomain.com → Extract "tenant1"
tenant2@reports.yourdomain.com → Extract "tenant2"

# Or use plus addressing:
reports+tenant1@yourdomain.com → Extract "tenant1"
reports+tenant2@yourdomain.com → Extract "tenant2"

# Or use unique CloudMailin addresses:
abc123def@cloudmailin.net → Maps to tenant1
xyz789ghi@cloudmailin.net → Maps to tenant2
```

### 6. Test Your Setup

```bash
# 1. Start your server
npm run dev

# 2. Send a test email to your CloudMailin address
# with a PDF attachment

# 3. Check logs for webhook receipt
# 4. Verify processing pipeline runs
```

## Complete Migration Checklist

- [ ] Log into CloudMailin dashboard
- [ ] Configure webhook URL
- [ ] Update .env file
- [ ] Replace SendGrid webhook with CloudMailin webhook
- [ ] Update email service for sending (or remove for MVP)
- [ ] Test with real email
- [ ] Remove SendGrid dependencies: `npm uninstall @sendgrid/mail`
- [ ] Update documentation

## Code Changes Using Aider

```bash
# 1. Update routes to use CloudMailin
aider src/api/routes.ts src/api/cloudmailin-webhook.ts -m "Replace SendGrid webhook with CloudMailin webhook implementation"

# 2. Update email service
aider src/services/email.ts -m "Remove SendGrid, implement simple SMTP sending with nodemailer for sending results"

# 3. Update config
aider src/config/index.ts -m "Remove SendGrid config, add CloudMailin webhook secret"

# 4. Update tests
aider tests/api/sendgrid-webhook.test.ts -m "Convert to CloudMailin webhook tests"
```

## Benefits After Migration

1. **Simpler codebase** - CloudMailin's format is cleaner
2. **Better reliability** - Purpose-built for inbound email
3. **Cost effective** - No need for SendGrid's sending features
4. **Multi-tenant ready** - Built-in support for routing
5. **Fewer dependencies** - One service instead of two

## Next Steps

1. Complete the migration (30 minutes)
2. Test with your existing CloudMailin account
3. Set up tenant routing for your first customers
4. Focus on building core features instead of email infrastructure!
