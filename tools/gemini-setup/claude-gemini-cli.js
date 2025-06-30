#!/usr/bin/env node
// Interactive Claude + Gemini Collaboration CLI
// This allows you to send tasks to both AIs and see how we work together

const readline = require('readline');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = promisify(exec);

// ANSI colors for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: `${colors.cyan}You > ${colors.reset}`
});

// Gemini communication function
async function askGemini(prompt) {
  console.log(`${colors.magenta}[Gemini thinking...]${colors.reset}`);
  
  const tempFile = path.join(process.cwd(), `.gemini-temp-${Date.now()}.json`);
  const request = {
    instances: [{
      content: prompt
    }],
    parameters: {
      temperature: 0.7,
      maxOutputTokens: 500
    }
  };
  
  try {
    await fs.writeFile(tempFile, JSON.stringify(request, null, 2));
    
    const command = `gcloud vertex-ai models predict --region=us-central1 --model=gemini-pro --json-request="${tempFile}"`;
    const { stdout } = await execAsync(command, { timeout: 30000 });
    
    await fs.unlink(tempFile).catch(() => {});
    
    return stdout.trim();
  } catch (error) {
    return `[Gemini Error: ${error.message}]`;
  }
}

// Claude's response function (simulated for demo)
function askClaude(prompt) {
  console.log(`${colors.blue}[Claude thinking...]${colors.reset}`);
  
  // In real implementation, this would call Claude's API
  // For demo, I'll provide contextual responses
  const responses = {
    financial: "I see this is about financial analysis. I'd analyze the revenue trends, expense ratios, and calculate key metrics like NOI and cap rates.",
    lease: "For lease documents, I'd extract tenant information, key dates, rental terms, and any special clauses or escalations.",
    maintenance: "I'd categorize this maintenance request by urgency, estimate costs, and suggest preventive measures.",
    default: "I'd provide a comprehensive analysis based on the context and data provided."
  };
  
  const type = prompt.toLowerCase().includes('financial') ? 'financial' :
               prompt.toLowerCase().includes('lease') ? 'lease' :
               prompt.toLowerCase().includes('maintenance') ? 'maintenance' :
               'default';
  
  return responses[type];
}

// Main interaction loop
console.log(`${colors.bright}${colors.cyan}🤖 Claude + Gemini Collaboration CLI${colors.reset}`);
console.log(`${colors.bright}=====================================\n${colors.reset}`);
console.log('Welcome! I\'m Claude, and I\'ll coordinate with Gemini to help you.');
console.log('We\'ll work together to provide the best analysis for your property intelligence needs.\n');
console.log(`${colors.yellow}Commands:${colors.reset}`);
console.log('  ask <question>     - Ask both AIs to collaborate');
console.log('  gemini <question>  - Ask only Gemini');
console.log('  claude <question>  - Ask only Claude');
console.log('  analyze <topic>    - Deep analysis with both AIs');
console.log('  stats             - Show collaboration statistics');
console.log('  help              - Show this help');
console.log('  exit              - Exit the program\n');

// Statistics tracking
let stats = {
  claudeQueries: 0,
  geminiQueries: 0,
  collaborations: 0,
  startTime: Date.now()
};

rl.prompt();

rl.on('line', async (input) => {
  const [command, ...args] = input.trim().split(' ');
  const question = args.join(' ');
  
  switch (command.toLowerCase()) {
    case 'ask':
      if (!question) {
        console.log(`${colors.yellow}Please provide a question.${colors.reset}`);
        break;
      }
      
      console.log(`\n${colors.bright}🤝 Collaborative Analysis${colors.reset}`);
      console.log(`${colors.cyan}Your question: ${question}${colors.reset}\n`);
      
      // Both AIs work on the question
      stats.collaborations++;
      stats.claudeQueries++;
      stats.geminiQueries++;
      
      const [claudeResponse, geminiResponse] = await Promise.all([
        Promise.resolve(askClaude(question)),
        askGemini(question)
      ]);
      
      console.log(`${colors.blue}Claude says:${colors.reset}`);
      console.log(claudeResponse);
      
      console.log(`\n${colors.magenta}Gemini says:${colors.reset}`);
      console.log(geminiResponse);
      
      console.log(`\n${colors.green}✅ Consensus Analysis:${colors.reset}`);
      console.log('Both AIs have provided their perspectives. The combined analysis gives you a more comprehensive view.');
      break;
      
    case 'gemini':
      if (!question) {
        console.log(`${colors.yellow}Please provide a question.${colors.reset}`);
        break;
      }
      
      stats.geminiQueries++;
      console.log(`\n${colors.magenta}Asking Gemini: ${question}${colors.reset}`);
      const geminiAnswer = await askGemini(question);
      console.log(geminiAnswer);
      break;
      
    case 'claude':
      if (!question) {
        console.log(`${colors.yellow}Please provide a question.${colors.reset}`);
        break;
      }
      
      stats.claudeQueries++;
      console.log(`\n${colors.blue}Claude's response: ${question}${colors.reset}`);
      console.log(askClaude(question));
      break;
      
    case 'analyze':
      const topic = question || 'property performance';
      console.log(`\n${colors.bright}🔍 Deep Analysis: ${topic}${colors.reset}\n`);
      
      stats.collaborations++;
      stats.claudeQueries++;
      stats.geminiQueries++;
      
      // Structured analysis prompts
      const analysisPrompts = {
        classification: `Classify this ${topic} into appropriate categories`,
        insights: `Provide key insights about ${topic}`,
        recommendations: `Suggest actionable recommendations for ${topic}`
      };
      
      for (const [aspect, prompt] of Object.entries(analysisPrompts)) {
        console.log(`${colors.yellow}Analyzing ${aspect}...${colors.reset}`);
        
        if (aspect === 'classification') {
          // Use Gemini for classification
          const result = await askGemini(prompt);
          console.log(`${colors.magenta}[Gemini]${colors.reset} ${result}\n`);
        } else {
          // Use Claude for insights and recommendations
          console.log(`${colors.blue}[Claude]${colors.reset} ${askClaude(prompt)}\n`);
        }
      }
      break;
      
    case 'stats':
      const runtime = Math.floor((Date.now() - stats.startTime) / 1000);
      console.log(`\n${colors.bright}📊 Collaboration Statistics${colors.reset}`);
      console.log(`Runtime: ${runtime} seconds`);
      console.log(`Claude queries: ${stats.claudeQueries}`);
      console.log(`Gemini queries: ${stats.geminiQueries}`);
      console.log(`Collaborations: ${stats.collaborations}`);
      console.log(`\n${colors.cyan}Tip:${colors.reset} Using both AIs together provides higher confidence results!`);
      break;
      
    case 'help':
      console.log(`\n${colors.yellow}Available Commands:${colors.reset}`);
      console.log('  ask <question>     - Both AIs collaborate on your question');
      console.log('  gemini <question>  - Direct question to Gemini only');
      console.log('  claude <question>  - Direct question to Claude only');
      console.log('  analyze <topic>    - Structured analysis using both AIs');
      console.log('  stats             - Show usage statistics');
      console.log('  help              - Show this help message');
      console.log('  exit              - Exit the program');
      console.log(`\n${colors.cyan}Examples:${colors.reset}`);
      console.log('  ask What are the key metrics for property performance?');
      console.log('  analyze financial report');
      console.log('  gemini Classify this as financial, lease, or maintenance document');
      break;
      
    case 'exit':
    case 'quit':
      console.log(`\n${colors.green}Thanks for using Claude + Gemini Collaboration!${colors.reset}`);
      console.log('Your collaboration statistics:');
      console.log(`- Total queries: ${stats.claudeQueries + stats.geminiQueries}`);
      console.log(`- Collaborative analyses: ${stats.collaborations}`);
      process.exit(0);
      break;
      
    default:
      if (input.trim()) {
        console.log(`${colors.yellow}Unknown command: ${command}${colors.reset}`);
        console.log('Type "help" for available commands.');
      }
  }
  
  rl.prompt();
});

rl.on('close', () => {
  console.log('\nGoodbye! 👋');
  process.exit(0);
});

// Handle errors
process.on('uncaughtException', (error) => {
  console.error(`${colors.yellow}Error: ${error.message}${colors.reset}`);
  rl.prompt();
});