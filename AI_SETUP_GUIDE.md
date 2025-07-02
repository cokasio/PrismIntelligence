# 🤖 AI Integration Setup Guide

## Quick Start (5 minutes)

### 1. Get Your API Keys

#### Claude (Anthropic) API Key:
1. Go to https://console.anthropic.com/
2. Sign up or login
3. Go to API Keys section
4. Create new key
5. Copy the key starting with `sk-ant-...`

#### Gemini API Key:
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key

### 2. Add Keys to Your .env File

```bash
# In C:\Dev\PrismIntelligence\.env add:
ANTHROPIC_API_KEY=sk-ant-your-key-here
GEMINI_API_KEY=your-gemini-key-here
```

### 3. Install Dependencies

```bash
cd C:\Dev\PrismIntelligence\apps\attachment-loop
npm install
```

### 4. Test Your Setup

```bash
# Start the service
cd C:\Dev\PrismIntelligence
npm run dev

# Copy a test file
copy data\samples\sample-financial-report.csv incoming\

# Watch the magic happen!
```

## What You'll See

With AI connected, when you drop a file:

```
📎 NEW FILE DETECTED: sample-financial-report.csv
📄 Document parsed: 2,847 characters
🔍 [Gemini] Document type: financial_report (92% confidence)
🧠 [Claude] Processing business intelligence...
⏱️ Processing completed in 3.5s

📊 ANALYSIS RESULTS:
📝 Summary: Property shows strong financial performance with 5.2% NOI growth...

📈 Key Metrics:
   - NOI: $125,000 (up - 5.2% increase from last period)
   - Occupancy: 94.5% (stable - Above market average)

💡 Insights:
   [HIGH] Utility costs increased 15% - investigate usage patterns
   [MEDIUM] Rent collection improved to 98.5%

🎯 Recommended Actions:
   1. Audit HVAC systems → 15% reduction in utility costs
   2. Review market rents → 3-5% rent increase opportunity

✅ File processing complete!
```

## Cost Estimates

- **Claude Opus**: ~$0.01-0.02 per document
- **Gemini Pro**: Free tier includes 60 queries/minute
- **Monthly cost for 1000 docs**: ~$10-20

## Troubleshooting

**"API Key not found" error:**
- Make sure .env file is in project root
- Check for typos in key names
- Restart the service after adding keys

**"Rate limit exceeded" error:**
- Add delay between file processing
- Upgrade API plan if needed
- Use mock mode for testing

**Files not being detected:**
- Check incoming folder path
- Ensure file isn't still being written
- Try with simple CSV files first

## Next Steps

Once working:
1. Test with your real property files
2. Adjust prompts in claude.service.ts for your needs
3. Connect to Supabase to save insights
4. Show results in dashboard

## 🎉 You're Ready!

Your AI is now connected. Drop a property management file in the incoming folder and watch real AI analysis happen!
