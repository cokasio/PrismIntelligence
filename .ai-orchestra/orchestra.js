#!/usr/bin/env node

/**
 * AI Orchestra for PrismIntelligence
 * Coordinates multiple AI tools to supercharge development
 * 
 * Usage: node .ai-orchestra/orchestra.js [command] [description]
 * Example: node .ai-orchestra/orchestra.js feature "add dashboard analytics"
 */

const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Tool configurations
const TOOLS = {
  aider: {
    command: (prompt, files = '') => `aider ${files} -m "${prompt}"`,
    available: checkCommand('aider --version'),
    strength: 'Direct file editing, git integration, incremental changes'
  },
  claude: {
    command: (prompt) => `echo "${prompt}"`, // This represents you (Claude)
    available: true,
    strength: 'Architecture, complex reasoning, project understanding'
  },
  claudeCode: {
    command: (prompt) => `claude-code "${prompt}"`,
    available: checkCommand('claude-code --version'),
    strength: 'Terminal operations, multi-file analysis'
  },
  gemini: {
    command: (prompt) => `gemini generate "${prompt}"`,
    available: checkCommand('gemini --version'),
    strength: 'Quick generation, mocks, interfaces'
  },
  openmanus: {
    command: (prompt) => `openmanus execute "${prompt}"`,
    available: checkCommand('openmanus --version'),
    strength: 'Multi-agent coordination, autonomous execution'
  }
};

// Project-specific context
const PROJECT_CONTEXT = {
  name: 'PrismIntelligence',
  type: 'typescript-node',
  framework: 'express',
  database: 'supabase',
  email: 'cloudmailin',
  ai: ['claude', 'gemini'],
  testing: 'jest',
  key_features: [
    'Property report processing',
    'Multi-tenant architecture',
    'AI-powered analysis',
    'Email ingestion via CloudMailin',
    'Queue-based processing with Bull'
  ],
  directories: {
    source: 'src',
    services: 'src/services',
    api: 'src/api',
    tests: 'tests',
    config: 'src/config'
  }
};

// Workflow definitions for PrismIntelligence
const WORKFLOWS = {
  feature: {
    name: 'New Feature Development',
    steps: [
      {
        tool: 'claude',
        prompt: 'Design the architecture for: {input}. Consider the existing PrismIntelligence structure with TypeScript, Supabase, CloudMailin, and Bull queues.',
        output: 'architecture'
      },
      {
        tool: 'aider',
        prompt: 'Create the file structure and interfaces based on this architecture: {architecture}',
        files: 'src/',
        output: 'structure'
      },
      {
        tool: 'gemini',
        prompt: 'Generate TypeScript types and interfaces for: {input}',
        parallel: true,
        output: 'types'
      },
      {
        tool: 'aider',
        prompt: 'Implement the core functionality for: {input}. Use the types: {types}',
        files: 'src/services/',
        output: 'implementation'
      },
      {
        tool: 'aider',
        prompt: 'Create comprehensive tests for the new feature: {input}',
        files: 'tests/',
        output: 'tests'
      }
    ]
  },
  
  fix: {
    name: 'Bug Fix',
    steps: [
      {
        tool: 'claude',
        prompt: 'Analyze this bug in PrismIntelligence: {input}. Check the relevant services and identify the root cause.',
        output: 'analysis'
      },
      {
        tool: 'aider',
        prompt: 'Fix the bug based on this analysis: {analysis}',
        files: '{files}',
        output: 'fix'
      },
      {
        tool: 'aider',
        prompt: 'Add tests to prevent this bug from recurring: {input}',
        files: 'tests/',
        output: 'tests'
      }
    ]
  },
  
  tenant: {
    name: 'Multi-Tenant Enhancement',
    steps: [
      {
        tool: 'claude',
        prompt: 'Design multi-tenant implementation for: {input}. Consider CloudMailin routing, Supabase RLS, and tenant isolation.',
        output: 'design'
      },
      {
        tool: 'aider',
        prompt: 'Implement tenant isolation in the database layer based on: {design}',
        files: 'src/services/database.ts src/database/schema.sql',
        output: 'database'
      },
      {
        tool: 'aider',
        prompt: 'Update API routes for multi-tenant support: {design}',
        files: 'src/api/routes.ts',
        output: 'api'
      }
    ]
  },
  
  ai: {
    name: 'AI Analysis Enhancement',
    steps: [
      {
        tool: 'claude',
        prompt: 'Design improved AI analysis for: {input}. Consider the 4-pass analysis system and property management context.',
        output: 'design'
      },
      {
        tool: 'aider',
        prompt: 'Update the AI analysis service with: {design}',
        files: 'src/services/claudeAnalyzer.ts src/services/geminiClassifier.ts',
        output: 'implementation'
      },
      {
        tool: 'gemini',
        prompt: 'Generate test fixtures for property reports to test: {input}',
        output: 'fixtures'
      }
    ]
  },
  
  email: {
    name: 'Email Processing Enhancement',
    steps: [
      {
        tool: 'aider',
        prompt: 'Enhance CloudMailin webhook for: {input}',
        files: 'src/api/routes.ts src/services/email.ts',
        output: 'webhook'
      },
      {
        tool: 'aider',
        prompt: 'Update email templates for: {input}',
        files: 'src/services/email.ts',
        output: 'templates'
      }
    ]
  },
  
  optimize: {
    name: 'Performance Optimization',
    steps: [
      {
        tool: 'claude',
        prompt: 'Analyze performance bottlenecks for: {input} in PrismIntelligence',
        output: 'analysis'
      },
      {
        tool: 'claudeCode',
        prompt: 'Profile and optimize: {analysis}',
        output: 'optimizations'
      },
      {
        tool: 'aider',
        prompt: 'Implement these optimizations: {optimizations}',
        files: '{files}',
        output: 'implementation'
      }
    ]
  },
  
  test: {
    name: 'Test Generation',
    steps: [
      {
        tool: 'aider',
        prompt: 'Generate comprehensive tests for: {input}',
        files: '{files} tests/',
        output: 'tests'
      },
      {
        tool: 'gemini',
        prompt: 'Generate test fixtures and mocks for: {input}',
        output: 'fixtures'
      }
    ]
  }
};

// Helper functions
function checkCommand(command) {
  try {
    execSync(command, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function printHeader() {
  console.log('\n🎭 AI Orchestra for PrismIntelligence');
  console.log('=====================================\n');
}

function printAvailableTools() {
  console.log('Available AI Tools:');
  Object.entries(TOOLS).forEach(([name, tool]) => {
    const status = tool.available ? '✅' : '❌';
    console.log(`  ${status} ${name} - ${tool.strength}`);
  });
  console.log();
}

function printWorkflows() {
  console.log('Available Workflows:');
  Object.entries(WORKFLOWS).forEach(([key, workflow]) => {
    console.log(`  ${key.padEnd(10)} - ${workflow.name}`);
  });
  console.log('\nProject Context:', PROJECT_CONTEXT.name);
  console.log('Key Features:', PROJECT_CONTEXT.key_features.join(', '));
}

async function executeStep(step, context) {
  const tool = TOOLS[step.tool];
  if (!tool.available && step.tool !== 'claude') {
    console.log(`  ⚠️  ${step.tool} not available, skipping...`);
    return null;
  }

  // Replace variables in prompt
  let prompt = step.prompt;
  Object.entries(context).forEach(([key, value]) => {
    prompt = prompt.replace(`{${key}}`, value);
  });

  console.log(`\n🎯 ${step.tool}: ${prompt.substring(0, 80)}...`);

  if (step.tool === 'claude') {
    // Special handling for Claude (you)
    console.log('\n📋 Claude Task:');
    console.log(prompt);
    console.log('\n💡 Please provide your response for the next step...');
    
    // In a real implementation, this would integrate with Claude API
    // For now, we'll pause for manual input
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    return new Promise((resolve) => {
      rl.question('Enter Claude\'s response (or press Enter to continue): ', (answer) => {
        rl.close();
        resolve(answer || 'Architecture designed based on requirements');
      });
    });
  }

  // Execute other tools
  const files = step.files ? step.files.replace('{files}', context.files || '') : '';
  const command = tool.command(prompt, files);
  
  console.log(`  Executing: ${command.substring(0, 100)}...`);
  
  // In production, actually execute the command
  // For now, we'll simulate
  return `${step.tool} completed: ${step.output}`;
}

async function runWorkflow(workflowName, input, options = {}) {
  const workflow = WORKFLOWS[workflowName];
  if (!workflow) {
    console.error(`❌ Unknown workflow: ${workflowName}`);
    console.log('\nAvailable workflows:', Object.keys(WORKFLOWS).join(', '));
    return;
  }

  console.log(`\n🚀 Starting ${workflow.name}`);
  console.log(`📝 Task: ${input}\n`);

  const context = {
    input,
    files: options.files || '',
    ...PROJECT_CONTEXT
  };

  // Execute steps
  for (const step of workflow.steps) {
    const result = await executeStep(step, context);
    if (result && step.output) {
      context[step.output] = result;
    }
  }

  console.log('\n✅ Workflow completed!');
}

// Quick command shortcuts
const QUICK_COMMANDS = {
  'add-service': (name) => runWorkflow('feature', `add ${name} service to src/services/`),
  'add-route': (name) => runWorkflow('feature', `add ${name} route to src/api/routes.ts`),
  'fix-test': (name) => runWorkflow('fix', `fix failing test in ${name}`),
  'add-tenant': (feature) => runWorkflow('tenant', `add multi-tenant support to ${feature}`),
  'improve-ai': (aspect) => runWorkflow('ai', `improve AI analysis for ${aspect}`),
  'add-email': (type) => runWorkflow('email', `add ${type} email template`),
  'optimize': (service) => runWorkflow('optimize', `optimize ${service} performance`),
  'test': (component) => runWorkflow('test', `create tests for ${component}`)
};

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  printHeader();

  if (args.length === 0) {
    printAvailableTools();
    printWorkflows();
    console.log('\nUsage:');
    console.log('  node .ai-orchestra/orchestra.js [workflow] "description"');
    console.log('  node .ai-orchestra/orchestra.js feature "add real-time notifications"');
    console.log('  node .ai-orchestra/orchestra.js fix "email service not sending"');
    console.log('  node .ai-orchestra/orchestra.js tenant "user management"');
    console.log('\nQuick commands:');
    Object.keys(QUICK_COMMANDS).forEach(cmd => {
      console.log(`  node .ai-orchestra/orchestra.js ${cmd} [name]`);
    });
    return;
  }

  const [command, ...descriptionParts] = args;
  const description = descriptionParts.join(' ');

  // Check for quick commands
  if (QUICK_COMMANDS[command]) {
    await QUICK_COMMANDS[command](description);
  } else if (WORKFLOWS[command]) {
    await runWorkflow(command, description);
  } else {
    // Default to feature workflow
    await runWorkflow('feature', args.join(' '));
  }
}

// Run the orchestrator
main().catch(console.error);
