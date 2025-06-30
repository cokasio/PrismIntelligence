# 🚀 Gemini CLI Complete Usage Guide for Prism Intelligence

## 📋 Table of Contents
1. [Prerequisites & Installation](#prerequisites--installation)
2. [Basic CLI Commands](#basic-cli-commands)
3. [Property Intelligence Use Cases](#property-intelligence-use-cases)
4. [Advanced Features](#advanced-features)
5. [Integration with Your Project](#integration-with-your-project)
6. [Security Best Practices](#security-best-practices)

---

## 🔧 Prerequisites & Installation

### Step 1: Run the Installation Script
```powershell
# Navigate to your project
cd C:\Dev\PrismIntelligence

# Run the installation script
.\tools\gemini-setup\install-gemini-cli.ps1
```

### Step 2: Get Your API Credentials

1. **Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable "Vertex AI API"
   - Note your Project ID

2. **Gemini API Key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Click "Create API Key"
   - Copy your API key

### Step 3: Configure Environment
```bash
# Update your .env file with:
GOOGLE_CLOUD_PROJECT=your-project-id
GEMINI_API_KEY=your-api-key-here
```

---

## 🎯 Basic CLI Commands

### Authentication & Setup
```bash
# Login to Google Cloud
gcloud auth login

# Set default project
gcloud config set project YOUR_PROJECT_ID

# List available models
gcloud vertex-ai models list --region=us-central1

# Test Gemini access
gcloud vertex-ai models predict \
  --region=us-central1 \
  --model=gemini-pro \
  --json-request=test-request.json
```

### Direct Gemini CLI Usage
```bash
# Install Gemini CLI tool (if not included)
pip install google-generativeai

# Simple text generation
gemini generate "Analyze this property report for key insights"

# With specific model
gemini generate "Summarize financial data" --model=gemini-1.5-pro

# With file input
gemini generate --file=report.pdf "Extract key metrics from this property report"
```

---

## 🏢 Property Intelligence Use Cases

### 1. Financial Report Analysis
```bash
# Analyze a property financial report
gemini analyze-financial \
  --input="january-financial-summary.csv" \
  --output="analysis.json" \
  --prompt="Identify key financial metrics, trends, and action items"
```

### 2. Lease Document Processing
```bash
# Extract lease information
gemini extract-lease \
  --input="lease-agreement.pdf" \
  --template="lease-extraction-template.json" \
  --output="lease-data.json"
```

### 3. Maintenance Report Classification
```bash
# Classify maintenance requests
gemini classify \
  --input="maintenance-reports/*.txt" \
  --categories="emergency,routine,preventive,tenant-caused" \
  --output="classified-maintenance.json"
```

### 4. Market Analysis
```bash
# Compare property performance
gemini market-analysis \
  --property-data="property-metrics.json" \
  --market-data="regional-benchmarks.json" \
  --prompt="Compare performance against market and suggest improvements"
```

---

## 🚀 Advanced Features

### Batch Processing
```bash
# Process multiple files
gemini batch \
  --input-dir="./reports/2024/" \
  --output-dir="./analyzed/" \
  --template="analysis-template.json" \
  --parallel=4
```

### Custom Model Fine-tuning
```bash
# Fine-tune for property management
gemini fine-tune \
  --base-model="gemini-1.5-pro" \
  --training-data="property-training-data.jsonl" \
  --output-model="property-gemini-v1"
```

### Streaming Responses
```bash
# Real-time analysis with streaming
gemini stream \
  --input="live-property-feed.json" \
  --prompt="Monitor for urgent issues" \
  --webhook="https://your-app.com/gemini-webhook"
```

---

## 🔌 Integration with Your Project

### Using Gemini CLI in Your Code

#### TypeScript Integration
```typescript
// C:\Dev\PrismIntelligence\core\ai\classifiers\gemini-cli.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class GeminiCLI {
  private projectId: string;
  private region: string;

  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT!;
    this.region = process.env.GOOGLE_CLOUD_REGION || 'us-central1';
  }

  async analyzeDocument(filePath: string, prompt: string): Promise<any> {
    const command = `gemini analyze --file="${filePath}" --prompt="${prompt}" --format=json`;
    
    try {
      const { stdout } = await execAsync(command);
      return JSON.parse(stdout);
    } catch (error) {
      console.error('Gemini CLI error:', error);
      throw error;
    }
  }

  async classifyDocument(content: string, categories: string[]): Promise<string> {
    const tempFile = await this.writeTempFile(content);
    const command = `gemini classify --input="${tempFile}" --categories="${categories.join(',')}"`;
    
    const { stdout } = await execAsync(command);
    return stdout.trim();
  }
}
```

#### Integration with Existing Workflow
```typescript
// Update your existing gemini.ts
import { GeminiCLI } from './gemini-cli';

export class GeminiClassifier {
  private cli: GeminiCLI;
  
  constructor() {
    this.cli = new GeminiCLI();
  }
  
  async classifyWithCLI(document: any) {
    // Use CLI for complex operations
    const cliResult = await this.cli.analyzeDocument(
      document.path,
      "Classify this property document"
    );
    
    // Combine with existing API approach
    return this.combineResults(cliResult, apiResult);
  }
}
```

---

## 🔐 Security Best Practices

### 1. Credential Management
```bash
# Never commit credentials
echo "GEMINI_API_KEY" >> .gitignore
echo "GOOGLE_APPLICATION_CREDENTIALS" >> .gitignore

# Use environment variables
export GEMINI_API_KEY=$(cat ~/.gemini/api-key)
```

### 2. Rate Limiting
```typescript
// Implement rate limiting
const rateLimiter = new RateLimiter({
  tokensPerInterval: 60,
  interval: "minute"
});

async function callGeminiCLI(command: string) {
  await rateLimiter.removeTokens(1);
  return execAsync(command);
}
```

### 3. Input Validation
```typescript
// Always validate input
function sanitizeFilePath(path: string): string {
  // Remove potentially dangerous characters
  return path.replace(/[;&|`$]/g, '');
}
```

### 4. Secure Storage
```bash
# Encrypt sensitive outputs
gemini analyze --input="financial.csv" | \
  openssl enc -aes-256-cbc -salt -out analysis.enc
```

---

## 🧪 Testing Gemini CLI

### Create Test Script
```bash
# C:\Dev\PrismIntelligence\tools\gemini-setup\test-gemini.sh
#!/bin/bash

echo "🧪 Testing Gemini CLI Setup..."

# Test 1: Authentication
echo "Test 1: Checking authentication..."
gcloud auth list

# Test 2: Model listing
echo "Test 2: Listing available models..."
gcloud vertex-ai models list --region=us-central1 --limit=5

# Test 3: Simple generation
echo "Test 3: Testing text generation..."
echo '{"prompt": "List 3 key metrics for property management"}' > test-prompt.json
gcloud vertex-ai models predict \
  --region=us-central1 \
  --model=gemini-pro \
  --json-request=test-prompt.json

# Test 4: Property-specific test
echo "Test 4: Property intelligence test..."
gemini generate "What are the top 5 KPIs for property management?" \
  --model=gemini-1.5-pro \
  --max-tokens=500

echo "✅ All tests completed!"
```

---

## 📊 Property Intelligence Templates

### Financial Analysis Template
```json
{
  "model": "gemini-1.5-pro",
  "prompt_template": "Analyze the financial report and provide:\n1. Key metrics summary\n2. Month-over-month changes\n3. Areas of concern\n4. Recommended actions\n\nReport data: {report_content}",
  "parameters": {
    "temperature": 0.3,
    "max_tokens": 2000,
    "top_p": 0.9
  }
}
```

### Lease Extraction Template
```json
{
  "model": "gemini-1.5-pro",
  "extraction_schema": {
    "tenant_name": "string",
    "lease_start": "date",
    "lease_end": "date", 
    "monthly_rent": "number",
    "security_deposit": "number",
    "special_clauses": ["string"]
  }
}
```

---

## 🎯 Next Steps

1. **Run Installation**: `.\tools\gemini-setup\install-gemini-cli.ps1`
2. **Configure Credentials**: Update `.env` with your API keys
3. **Test Setup**: Run the test script to verify everything works
4. **Integrate**: Update your existing code to use CLI features
5. **Monitor Usage**: Track API calls and costs in Google Cloud Console

---

## 📞 Troubleshooting

### Common Issues:

**Authentication Error**:
```bash
gcloud auth application-default login
```

**Model Not Found**:
```bash
# List available models
gcloud vertex-ai models list --region=us-central1
```

**Permission Denied**:
```bash
# Grant necessary permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT \
  --member="user:your-email@domain.com" \
  --role="roles/aiplatform.user"
```

---

## 🚀 Quick Start Command

```powershell
# One command to test everything
cd C:\Dev\PrismIntelligence
.\tools\gemini-setup\install-gemini-cli.ps1
echo "Test Gemini" | gemini generate --model=gemini-pro
```

Your Gemini CLI is now ready for property intelligence! 🎉