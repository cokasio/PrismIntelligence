// Live Demo: Claude Orchestrating Gemini CLI
// Run this to see the AI orchestration in action!

import AIOrchestrator from '../../core/ai/orchestrators/claude-gemini-orchestrator';
import * as readline from 'readline';
import * as fs from 'fs/promises';
import * as path from 'path';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class OrchestrationDemo {
  private orchestrator: AIOrchestrator;
  private rl: readline.Interface;

  constructor() {
    this.orchestrator = new AIOrchestrator();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async start() {
    this.printHeader();
    await this.checkSetup();
    await this.runDemo();
  }

  private printHeader() {
    console.log('\n' + colors.bright + colors.cyan + '='.repeat(60) + colors.reset);
    console.log(colors.bright + colors.cyan + '    🤖 Claude + Gemini CLI Orchestration Demo' + colors.reset);
    console.log(colors.bright + colors.cyan + '='.repeat(60) + colors.reset + '\n');
  }

  private async checkSetup() {
    console.log(colors.yellow + '📋 Checking setup...' + colors.reset);
    
    // Check for API keys
    const hasGeminiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key';
    const hasProjectId = process.env.GOOGLE_CLOUD_PROJECT && process.env.GOOGLE_CLOUD_PROJECT !== 'your-project-id';
    
    if (!hasGeminiKey || !hasProjectId) {
      console.log(colors.red + '\n❌ Setup incomplete!' + colors.reset);
      console.log('Please update your .env file with:');
      if (!hasGeminiKey) console.log('  - GEMINI_API_KEY');
      if (!hasProjectId) console.log('  - GOOGLE_CLOUD_PROJECT');
      console.log('\nRun: ' + colors.cyan + '.\\tools\\gemini-setup\\quick-start.bat' + colors.reset);
      process.exit(1);
    }
    
    console.log(colors.green + '✅ Setup looks good!\n' + colors.reset);
  }

  private async runDemo() {
    console.log(colors.bright + '🎯 Demonstration Scenarios:' + colors.reset);
    console.log('\n1. ' + colors.cyan + 'Financial Analysis' + colors.reset);
    console.log('   Example: "Analyze the financial performance of Sunset Plaza"');
    
    console.log('\n2. ' + colors.cyan + 'Document Classification' + colors.reset);
    console.log('   Example: "Sort these property documents by type"');
    
    console.log('\n3. ' + colors.cyan + 'Lease Extraction' + colors.reset);
    console.log('   Example: "Extract key dates from lease agreements"');
    
    console.log('\n4. ' + colors.cyan + 'Property Comparison' + colors.reset);
    console.log('   Example: "Compare our top 3 properties"');
    
    console.log('\n5. ' + colors.cyan + 'Custom Analysis' + colors.reset);
    console.log('   Example: "Find maintenance patterns across all properties"');
    
    console.log('\n' + colors.dim + 'Type "exit" to quit' + colors.reset + '\n');
    
    await this.interactiveLoop();
  }

  private async interactiveLoop() {
    while (true) {
      const input = await this.prompt(colors.bright + '\n🎤 What would you like me to do? ' + colors.reset);
      
      if (input.toLowerCase() === 'exit') {
        console.log('\n' + colors.cyan + 'Thanks for using the orchestration demo!' + colors.reset);
        this.rl.close();
        break;
      }
      
      await this.processRequest(input);
    }
  }

  private async processRequest(request: string) {
    console.log('\n' + colors.yellow + '🤖 Claude: Understanding your request...' + colors.reset);
    
    // Simulate context gathering
    const context = await this.gatherContext(request);
    
    console.log(colors.yellow + '🔄 Claude: Orchestrating Gemini CLI...' + colors.reset);
    
    try {
      // Process through orchestrator
      const result = await this.orchestrator.executeUserIntent(request, context);
      
      // Display results
      this.displayResults(result);
      
    } catch (error) {
      console.log(colors.red + '\n❌ Error: ' + error.message + colors.reset);
      console.log(colors.dim + 'This might be a demo limitation. In production, this would execute the actual Gemini CLI.' + colors.reset);
    }
  }

  private async gatherContext(request: string): Promise<any> {
    // In a real scenario, this would gather actual file paths and data
    const context: any = {};
    
    if (request.toLowerCase().includes('sunset plaza')) {
      context.propertyName = 'Sunset Plaza';
      context.filePath = 'data/samples/sunset-plaza-financial.csv';
      context.propertyData = {
        'Sunset Plaza': {
          occupancy: 0.92,
          monthly_revenue: 125000,
          noi: 85000
        }
      };
    }
    
    if (request.toLowerCase().includes('document')) {
      context.documents = [
        { id: '1', type: 'unknown', content: 'Sample lease document...' },
        { id: '2', type: 'unknown', content: 'Financial report...' },
        { id: '3', type: 'unknown', content: 'Maintenance request...' }
      ];
    }
    
    return context;
  }

  private displayResults(result: any) {
    console.log('\n' + colors.green + '✅ Operation Complete!' + colors.reset);
    console.log(colors.bright + '\n📊 Results:' + colors.reset);
    
    // Show the Gemini command that would be executed
    if (result.geminiCommand) {
      console.log('\n' + colors.cyan + 'Gemini CLI Command:' + colors.reset);
      console.log(colors.dim + result.geminiCommand + colors.reset);
    }
    
    // Show the action taken
    console.log('\n' + colors.cyan + 'Action:' + colors.reset + ' ' + result.action);
    
    // Show sample results
    if (result.result) {
      console.log('\n' + colors.cyan + 'Analysis:' + colors.reset);
      console.log(this.formatResult(result.result));
    }
    
    // Show interpretation
    if (result.interpretation) {
      console.log('\n' + colors.cyan + 'Claude\'s Interpretation:' + colors.reset);
      console.log(this.formatResult(result.interpretation));
    }
    
    // Show recommendations
    if (result.recommendations) {
      console.log('\n' + colors.cyan + 'Recommendations:' + colors.reset);
      console.log(this.formatResult(result.recommendations));
    }
  }

  private formatResult(data: any): string {
    if (typeof data === 'string') {
      return '  ' + data;
    }
    return JSON.stringify(data, null, 2).split('\n').map(line => '  ' + line).join('\n');
  }

  private prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }
}

// Example requests to demonstrate
const exampleRequests = [
  "Analyze January's financial report and highlight any concerns",
  "Compare Sunset Plaza with Downtown Towers performance",
  "Extract all lease renewal dates for Q2",
  "Find properties with maintenance costs over budget",
  "What's our best performing property this month?",
  "Classify these documents: lease.pdf, invoice.pdf, maintenance.pdf",
  "Generate a market analysis for our downtown properties",
  "Identify trends in tenant complaints",
  "Which properties need immediate attention?",
  "Create a summary of all maintenance issues this week"
];

// Run the demo
async function main() {
  console.log(colors.dim + '\nStarting orchestration demo...' + colors.reset);
  console.log(colors.dim + 'Example requests you can try:' + colors.reset);
  exampleRequests.forEach((req, i) => {
    console.log(colors.dim + `${i + 1}. "${req}"` + colors.reset);
  });
  
  const demo = new OrchestrationDemo();
  await demo.start();
}

// Start the demo
main().catch(console.error);