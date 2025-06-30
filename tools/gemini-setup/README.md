# 🚀 Gemini CLI Setup for Prism Intelligence

## Quick Start (5 Minutes)

```powershell
# Run this single command to get started:
cd C:\Dev\PrismIntelligence\tools\gemini-setup
.\quick-start.bat
```

## 📁 Files in this Directory

- **`install-gemini-cli.ps1`** - PowerShell script to install Google Cloud SDK and Gemini CLI
- **`GEMINI_CLI_GUIDE.md`** - Complete usage guide with examples
- **`test-gemini-integration.ts`** - Test script to verify your setup
- **`quick-start.bat`** - One-click setup and test
- **`gemini-cli-wrapper.ts`** - TypeScript wrapper for easy integration

## 🔧 Manual Setup Steps

### 1. Install Google Cloud SDK
```powershell
.\install-gemini-cli.ps1
```

### 2. Get Your Credentials
- **Google Cloud Project**: https://console.cloud.google.com
- **Gemini API Key**: https://makersuite.google.com/app/apikey

### 3. Update .env File
```env
GOOGLE_CLOUD_PROJECT=your-project-id
GEMINI_API_KEY=your-api-key-here
```

### 4. Test Your Setup
```bash
npx ts-node test-gemini-integration.ts
```

## 🧪 Test Gemini CLI

```bash
# Check installation
gcloud --version

# Test authentication
gcloud auth list

# Test Gemini
echo "Analyze property trends" | gcloud vertex-ai models predict --region=us-central1 --model=gemini-pro
```

## 💡 Property Intelligence Examples

### Analyze Financial Report
```bash
gemini analyze --file="financial-report.csv" --prompt="Extract NOI, occupancy, and suggest improvements"
```

### Classify Documents
```bash
gemini classify --input="lease.pdf" --categories="lease,financial,maintenance,operational"
```

### Batch Processing
```bash
gemini batch --input-dir="./reports/2024/" --output-dir="./analyzed/"
```

## 🔌 Integration with Your Code

```typescript
// Use the provided wrapper
import GeminiCLIWrapper from '@/core/ai/classifiers/gemini-cli-wrapper';

const gemini = new GeminiCLIWrapper();

// Analyze a document
const result = await gemini.analyzeDocument({
  id: '123',
  type: 'financial',
  content: reportContent
});

// Extract insights
const insights = await gemini.extractInsights(
  'report.csv',
  ['revenue_trends', 'expense_analysis', 'noi_calculation']
);
```

## 📚 Resources

- [Google Cloud Console](https://console.cloud.google.com)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Full Usage Guide](./GEMINI_CLI_GUIDE.md)

## ❓ Troubleshooting

**"gcloud: command not found"**
- Run `.\install-gemini-cli.ps1` first
- Restart your terminal after installation

**"Authentication required"**
```bash
gcloud auth login
gcloud auth application-default login
```

**"Project not set"**
```bash
gcloud config set project YOUR_PROJECT_ID
```

**"API not enabled"**
- Go to [Google Cloud Console](https://console.cloud.google.com)
- Enable "Vertex AI API"

---

Ready to integrate Gemini AI into your Property Intelligence Platform! 🎉