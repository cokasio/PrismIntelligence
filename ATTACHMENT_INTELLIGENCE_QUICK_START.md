# 🚀 Attachment Intelligence Loop - Quick Start Guide

## Welcome to the Future of Property Management Intelligence!

You now have a working AI-powered document processing system that automatically transforms property management documents into actionable insights. This system combines Gemini AI for classification with Claude AI for business intelligence.

## 🎯 What You've Built

### **Core System Components:**
- **File Watcher**: Monitors incoming folders for new documents
- **Gemini Classifier**: Intelligently categorizes property documents
- **Claude Analyzer**: Generates business insights and recommendations
- **Multi-Format Processor**: Handles CSV, Excel, PDF, and text files
- **Supabase Database**: Stores all processed data and insights
- **Automated Archiving**: Moves processed files to organized folders

### **Supported Document Types:**
- 📊 **Financial Reports**: P&L statements, balance sheets, cash flow
- 📋 **Rent Rolls**: Tenant listings, occupancy reports, lease summaries
- 📄 **Lease Documents**: Agreements, amendments, renewals
- 🔧 **Maintenance Reports**: Work orders, repair invoices, inspections

## 🛠️ Installation & Setup

### **1. Install Dependencies**
```bash
cd C:\Dev\PrismIntelligence
npm install
```

### **2. Environment Configuration**
Create or update your `.env` file with:

```env
# Required - AI Services
ANTHROPIC_API_KEY=your-claude-api-key-here
GEMINI_API_KEY=your-gemini-api-key-here

# Required - Database
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_KEY=your-supabase-service-key
SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional - Email (for notifications)
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=reports@yourcompany.com

# Optional - Redis (for queuing)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### **3. Get Your API Keys**

#### **Anthropic Claude API**
1. Visit: https://console.anthropic.com
2. Create account and get API key
3. Add $20+ credits for testing

#### **Google Gemini API**
1. Visit: https://aistudio.google.com/apikey
2. Create API key (free tier available)
3. Copy to your .env file

#### **Supabase Database**
1. Visit: https://supabase.com
2. Create new project
3. Get URL and service key from project settings

## 🚀 Starting the System

### **Development Mode**
```bash
npm run attachment-loop:dev
```

### **Production Mode**
```bash
npm run attachment-loop
```

### **What You'll See**
```
🎉 ============================================
    PRISM INTELLIGENCE 
    Attachment Intelligence Loop
============================================

🧠 AI-Powered Property Document Processing
   - Gemini AI for document classification
   - Claude AI for business intelligence
   - Automated insights and recommendations

📂 Watching Directories:
   📊 C:/Dev/PrismIntelligence/incoming/
   💰 C:/Dev/PrismIntelligence/incoming/financial/
   📋 C:/Dev/PrismIntelligence/incoming/reports/
   📄 C:/Dev/PrismIntelligence/incoming/leases/
   🔧 C:/Dev/PrismIntelligence/incoming/maintenance/

✅ Attachment Intelligence Loop is running!
```

## 📁 How to Use

### **Step 1: Drop Files**
Place your property management documents in the appropriate folders:

- **Financial Reports** → `C:\Dev\PrismIntelligence\incoming\financial\`
- **Rent Rolls** → `C:\Dev\PrismIntelligence\incoming\reports\`
- **Lease Documents** → `C:\Dev\PrismIntelligence\incoming\leases\`
- **Maintenance Reports** → `C:\Dev\PrismIntelligence\incoming\maintenance\`

### **Step 2: Watch the Magic**
The system automatically:
1. **Detects** new files instantly
2. **Classifies** document type using Gemini AI
3. **Extracts** structured data from any format
4. **Analyzes** with Claude for business insights
5. **Generates** actionable recommendations
6. **Stores** everything in your database
7. **Archives** processed files with timestamps

### **Step 3: Review Results**
Check the console logs to see:
- Document classification results
- Extracted data summaries
- Generated insights and recommendations
- Processing time and confidence scores

## 🧪 Test with Sample Data

We've included sample files to test the system:

### **Quick Test**
```bash
# Copy sample files to incoming folder
copy "C:\Dev\PrismIntelligence\sample-data\sample-financial-report.csv" "C:\Dev\PrismIntelligence\incoming\financial\"
copy "C:\Dev\PrismIntelligence\sample-data\sample-rent-roll.csv" "C:\Dev\PrismIntelligence\incoming\reports\"
```

### **Expected Output**
For the financial report, you should see:
```
📁 File add: sample-financial-report.csv
🔄 Processing: sample-financial-report.csv
🧠 Classifying: sample-financial-report.csv
📋 Classification: financial (95% confidence)
⚙️ Extracting data: sample-financial-report.csv
💡 Generating insights: sample-financial-report.csv
💾 Stored in database: sample-financial-report.csv
📦 Archived: sample-financial-report.csv
✅ Successfully processed: sample-financial-report.csv (2340ms)
```

## 🎛️ Advanced Features

### **Database Queries**
Access your processed documents programmatically:

```typescript
import { DatabaseService } from './src/services/databaseService';

const db = new DatabaseService();

// Get recent documents
const recent = await db.getRecentDocuments(10);

// Get documents by property
const propertyDocs = await db.getDocumentsByProperty('Riverside Office Complex');

// Get processing statistics
const stats = await db.getProcessingStats();

// Search documents
const results = await db.searchDocuments('rent roll');
```

### **Processing Statistics**
The system tracks:
- Total documents processed
- Success/failure rates
- Average processing times
- Document type distribution
- Common errors and patterns

### **File Organization**
```
C:\Dev\PrismIntelligence\
├── incoming/           # Drop files here
│   ├── financial/
│   ├── reports/
│   ├── leases/
│   └── maintenance/
├── processed/          # Archived successful files
└── errors/            # Failed files for review
```

## 🔧 Troubleshooting

### **Common Issues**

#### **Environment Variables Not Set**
```
❌ Missing required environment variables:
   - ANTHROPIC_API_KEY
   - SUPABASE_URL
```
**Solution**: Update your `.env` file with the missing keys.

#### **File Processing Fails**
```
❌ Failed to process sample-report.csv:
```
**Solution**: Check file format and ensure it's not corrupted. Files moved to `errors/` folder.

#### **Database Connection Issues**
```
❌ Database connection test failed
```
**Solution**: Verify Supabase credentials and internet connection.

### **Debugging Tips**

1. **Check Logs**: All processing steps are logged in detail
2. **Verify File Formats**: Ensure CSV/Excel files are properly formatted
3. **Test API Keys**: Use the connection test features
4. **Review Error Folder**: Check failed files for common patterns

## 🚀 Production Deployment

### **Environment Setup**
```bash
# Production build
npm run build

# Start in production
npm run attachment-loop:build
```

### **Monitoring**
- Monitor console logs for processing activity
- Check database for processed document counts
- Review error rates and processing times
- Archive old processed files periodically

### **Scaling Considerations**
- Increase API rate limits for high volume
- Consider multiple processing nodes
- Implement proper error handling and retries
- Set up monitoring and alerting

## 🎯 Next Steps

### **Integration Options**
1. **Email Integration**: Connect to email systems for automatic file extraction
2. **Web Dashboard**: Build a UI to view processed documents and insights
3. **API Endpoints**: Create REST API for external system integration
4. **Webhooks**: Send notifications when documents are processed
5. **Batch Processing**: Handle multiple files simultaneously

### **Customization**
1. **Custom Parsers**: Add support for specific document formats
2. **Industry-Specific Rules**: Tailor insights for different property types
3. **Custom Metrics**: Extract specific KPIs for your business
4. **Automated Reporting**: Generate regular summary reports

## 📊 Sample Insights Generated

### **For Financial Reports:**
- Revenue performance vs. budget analysis
- Expense category trends and variances
- NOI margins and profitability insights
- Cash flow implications and forecasting
- Specific action items with priorities

### **For Rent Rolls:**
- Occupancy rates and vacancy analysis
- Rental rate optimization opportunities
- Lease expiration schedule management
- Tenant quality and risk assessment
- Revenue maximization strategies

## 🎉 Congratulations!

You now have a production-ready AI-powered property intelligence system that can:
- **Process any property document** automatically
- **Generate actionable insights** using advanced AI
- **Scale to handle thousands** of documents
- **Integrate with existing systems** easily
- **Provide competitive advantage** in property management

**Start dropping files and watch AI transform your property management operations!**

---

## 🆘 Support & Resources

- **Documentation**: Check the `/docs` folder for detailed technical docs
- **Sample Data**: Use files in `/sample-data` for testing
- **Error Logs**: Review `/errors` folder for failed processing
- **Database Schema**: See `/src/database/schema.sql` for data structure

**Happy Property Intelligence Processing!** 🏢✨
