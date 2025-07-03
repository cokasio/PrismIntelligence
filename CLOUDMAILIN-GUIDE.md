# CloudMailin Integration Guide for Prism Intelligence

## 🚀 Quick Setup

Your CloudMailin accounts are configured and ready! Here's how to connect them to Prism Intelligence:

### CloudMailin Account Details
- **Account 1**: cokasiotesting (ID: 7d5f948c506dea73)
- **Account 2**: cokasiotesting (ID: 4236dea731b2f948)
- **SMTP Host**: smtp.cloudmla.net

### Step 1: Configure CloudMailin Webhook

1. Go to CloudMailin Dashboard
2. Click "Manage" on one of your accounts
3. Set the Target URL to:
   ```
   http://YOUR-SERVER-URL:3000/cloudmailin/webhook
   ```
   
   For local testing use ngrok:
   ```bash
   ngrok http 3000
   # Use the generated URL like: https://abc123.ngrok.io/cloudmailin/webhook
   ```

4. Configure these settings:
   - **Format**: Multipart (normalized)
   - **Attachment Store**: Include attachments
   - **Plain Text**: Yes
   - **HTML**: Yes (optional)

### Step 2: Test Email Processing

Send an email with attachments to your CloudMailin address:
```
[YOUR-ID]@cloudmailin.net
```

Example test emails:

1. **Financial Report Test**:
   - To: 7d5f948c506dea73@cloudmailin.net
   - Subject: Q4 2024 Financial Report - Urgent Review
   - Attach: Any Excel or PDF file

2. **Maintenance Alert Test**:
   - To: 4236dea731b2f948@cloudmailin.net
   - Subject: URGENT: HVAC System Maintenance Required
   - Attach: Maintenance report or work order

### Step 3: Monitor Processing

1. Check API logs:
   ```bash
   # You'll see:
   📧 Received email from CloudMailin
   📎 Processing attachment: filename.xlsx (financial)
   ```

2. Check the dashboard at http://localhost:3001/demo
   - Insights should appear within 10-30 seconds
   - Email metadata saved in `incoming/emails/`

## 📧 Email Processing Flow

```
Email Sent → CloudMailin → Webhook → Prism Intelligence
                ↓                           ↓
           Extracts Files            AI Processing
                                           ↓
                                    Insights in UI
```

## 🔧 Configuration Options

### Environment Variables
Add to your `.env` file:
```env
# CloudMailin Configuration
CLOUDMAILIN_USERNAME=cokasiotesting
CLOUDMAILIN_PASSWORD=your-password
API_URL=https://your-domain.com

# For local development
USE_NGROK=true
```

### Supported File Types
- **Excel**: .xlsx, .xls (Financial reports, rent rolls)
- **PDF**: .pdf (Leases, reports, invoices)
- **CSV**: .csv (Data exports, tenant lists)
- **Text**: .txt (Notes, maintenance reports)

### Auto-Classification Rules
The system automatically classifies documents based on:

1. **Filename Keywords**:
   - Financial: "ledger", "gl", "p&l", "budget", "financial"
   - Lease: "lease", "rental", "tenant"
   - Maintenance: "maintenance", "repair", "work order"

2. **Email Subject Keywords**:
   - Financial: "financial", "budget", "report"
   - Lease: "lease", "renewal", "tenant"
   - Maintenance: "maintenance", "urgent", "repair"

## 🧪 Testing Scenarios

### Scenario 1: Financial Alert
```
To: [your-id]@cloudmailin.net
Subject: URGENT: Q4 Variance Report - Covenant Risk
Body: Please review the attached variance report. DSCR is below threshold.
Attachment: Budget-Variance-Q4-2024.xlsx
```

Expected Result:
- FinanceBot analyzes variance
- RiskBot flags covenant breach
- Alert appears in dashboard

### Scenario 2: Maintenance Emergency
```
To: [your-id]@cloudmailin.net
Subject: Emergency Maintenance Required - Building A
Body: HVAC system showing critical failure signs. See attached report.
Attachment: Maintenance-Report.pdf
```

Expected Result:
- MaintenanceBot prioritizes repair
- FinanceBot analyzes budget impact
- Agents debate urgency

### Scenario 3: Batch Processing
```
To: [your-id]@cloudmailin.net
Subject: Monthly Financial Package
Attachments: 
- General-Ledger.xlsx
- Rent-Roll.csv
- P&L-Statement.pdf
```

Expected Result:
- All documents processed in parallel
- Cross-document insights generated
- Comprehensive analysis in dashboard

## 🚨 Troubleshooting

### "Email not received"
1. Check CloudMailin logs in dashboard
2. Verify webhook URL is correct
3. Ensure API server is running
4. Check ngrok is active (for local testing)

### "Attachments not processing"
1. Verify file size < 25MB
2. Check supported file types
3. Look for errors in API logs
4. Ensure integration orchestrator is running

### "No insights generated"
1. Wait 30-60 seconds for processing
2. Check browser console for errors
3. Verify WebSocket connection
4. Check mock AI service is enabled

## 📊 Monitoring & Analytics

Track email processing metrics:
- Total emails received
- Attachments processed
- Average processing time
- Success/failure rates

View in the logs:
```bash
tail -f logs/email-processing.log
```

## 🔐 Security Notes

1. **Webhook Security**: 
   - CloudMailin signs requests
   - Verify signatures in production
   - Use HTTPS for webhook URL

2. **File Security**:
   - Files scanned for type validation
   - Size limits enforced (25MB)
   - Sandboxed processing

3. **Data Privacy**:
   - Emails stored temporarily
   - Attachments processed and deleted
   - Audit trail maintained

## 🎯 Next Steps

1. **Production Setup**:
   - Deploy API to cloud
   - Configure production webhook URL
   - Set up CloudMailin production account

2. **Advanced Features**:
   - Email reply automation
   - Scheduled report processing
   - Multi-tenant email routing
   - Custom email templates

3. **Monitoring**:
   - Set up email processing alerts
   - Track processing metrics
   - Monitor for failed emails

---

**Your CloudMailin integration is ready! Send a test email to see it in action.** 📧✨
