// Test Gemini CLI Integration for Prism Intelligence
// This script tests your Gemini setup with property management examples

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

async function testGeminiCLI() {
  console.log(`${colors.cyan}${colors.bright}🧪 Testing Gemini CLI Integration...${colors.reset}\n`);

  // Test 1: Check if gcloud is installed
  console.log(`${colors.yellow}Test 1: Checking Google Cloud SDK...${colors.reset}`);
  try {
    const { stdout } = await execAsync('gcloud --version');
    console.log(`${colors.green}✅ Google Cloud SDK installed:${colors.reset}`);
    console.log(stdout);
  } catch (error) {
    console.log(`${colors.red}❌ Google Cloud SDK not found. Please run install-gemini-cli.ps1 first${colors.reset}`);
    return;
  }
  // Test 2: Check authentication
  console.log(`\n${colors.yellow}Test 2: Checking authentication...${colors.reset}`);
  try {
    const { stdout } = await execAsync('gcloud auth list --format="value(account)"');
    if (stdout.trim()) {
      console.log(`${colors.green}✅ Authenticated as: ${stdout.trim()}${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ Not authenticated. Run: gcloud auth login${colors.reset}`);
      return;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Authentication check failed${colors.reset}`);
    return;
  }

  // Test 3: Check project configuration
  console.log(`\n${colors.yellow}Test 3: Checking project configuration...${colors.reset}`);
  try {
    const { stdout } = await execAsync('gcloud config get-value project');
    if (stdout.trim()) {
      console.log(`${colors.green}✅ Project set to: ${stdout.trim()}${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ No project set. Run: gcloud config set project YOUR_PROJECT_ID${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Project check failed${colors.reset}`);
  }

  // Test 4: Property Intelligence Example
  console.log(`\n${colors.yellow}Test 4: Testing Property Intelligence Analysis...${colors.reset}`);
  
  // Create test data
  const testReport = {
    property: "Sunset Plaza Apartments",
    month: "January 2024",
    metrics: {
      occupancy_rate: 92.5,
      total_revenue: 125000,
      maintenance_costs: 8500,
      noi: 85000
    }
  };
  // Save test data to file
  const testDataPath = path.join(process.cwd(), 'tools', 'gemini-setup', 'test-property-data.json');
  await fs.writeFile(testDataPath, JSON.stringify(testReport, null, 2));

  // Create Gemini request
  const geminiRequest = {
    instances: [{
      content: `Analyze this property report and provide:
1. Performance summary
2. Key insights
3. Recommended actions

Property Data: ${JSON.stringify(testReport, null, 2)}`
    }],
    parameters: {
      temperature: 0.3,
      maxOutputTokens: 500
    }
  };

  const requestPath = path.join(process.cwd(), 'tools', 'gemini-setup', 'test-request.json');
  await fs.writeFile(requestPath, JSON.stringify(geminiRequest, null, 2));

  try {
    console.log(`${colors.cyan}Sending property data to Gemini for analysis...${colors.reset}`);
    
    // Try using gcloud CLI
    const { stdout } = await execAsync(
      `gcloud vertex-ai models predict --region=us-central1 --model=gemini-pro --json-request="${requestPath}"`
    );
    
    console.log(`${colors.green}✅ Gemini Analysis Result:${colors.reset}`);
    console.log(stdout);
  } catch (error) {
    console.log(`${colors.yellow}⚠️  Gemini API call failed. This might be due to:${colors.reset}`);
    console.log("   - Project not enabled for Vertex AI");
    console.log("   - Missing API credentials");
    console.log("   - Region not available");
    console.log(`\n${colors.cyan}Alternative: Using direct API approach...${colors.reset}`);
  }
}
// Test integration with existing Prism Intelligence code
async function testExistingIntegration() {
  console.log(`\n${colors.cyan}${colors.bright}🔌 Testing Integration with Existing Code...${colors.reset}\n`);
  
  // Check if Gemini API key is set
  const envPath = path.join(process.cwd(), '.env');
  try {
    const envContent = await fs.readFile(envPath, 'utf-8');
    if (envContent.includes('GEMINI_API_KEY=your-gemini-api-key')) {
      console.log(`${colors.yellow}⚠️  Please update GEMINI_API_KEY in .env file${colors.reset}`);
      console.log(`   Get your API key from: https://makersuite.google.com/app/apikey`);
    } else if (envContent.includes('GEMINI_API_KEY=')) {
      console.log(`${colors.green}✅ GEMINI_API_KEY found in .env${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ GEMINI_API_KEY not found in .env${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Could not read .env file${colors.reset}`);
  }
  
  // Check existing classifier
  const classifierPath = path.join(process.cwd(), 'core', 'ai', 'classifiers', 'gemini.ts');
  try {
    await fs.access(classifierPath);
    console.log(`${colors.green}✅ Gemini classifier found at: core/ai/classifiers/gemini.ts${colors.reset}`);
  } catch {
    console.log(`${colors.red}❌ Gemini classifier not found${colors.reset}`);
  }
  
  // Test sample data
  console.log(`\n${colors.cyan}Sample property classifications:${colors.reset}`);
  const sampleDocs = [
    { name: "Rent Roll Report", expectedType: "financial" },
    { name: "Lease Agreement", expectedType: "lease" },
    { name: "HVAC Maintenance Log", expectedType: "maintenance" },
    { name: "Tenant Complaint Form", expectedType: "operational" }
  ];
  
  for (const doc of sampleDocs) {
    console.log(`  📄 ${doc.name} → Expected: ${doc.expectedType}`);
  }
}

// Main execution
async function main() {
  console.log(`${colors.bright}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}Prism Intelligence - Gemini CLI Integration Test${colors.reset}`);
  console.log(`${colors.bright}${'='.repeat(60)}${colors.reset}\n`);
  
  await testGeminiCLI();
  await testExistingIntegration();
  
  console.log(`\n${colors.bright}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.green}${colors.bright}✅ Test Complete!${colors.reset}`);
  console.log(`\n${colors.cyan}Next Steps:${colors.reset}`);
  console.log("1. Update your .env file with Google Cloud project ID and Gemini API key");
  console.log("2. Enable Vertex AI API in your Google Cloud project");
  console.log("3. Run: npm install @google-cloud/aiplatform google-generative-ai");
  console.log("4. Test with: ts-node tools/gemini-setup/test-gemini-integration.ts");
  console.log(`${colors.bright}${'='.repeat(60)}${colors.reset}\n`);
}

// Run tests
main().catch(console.error);
