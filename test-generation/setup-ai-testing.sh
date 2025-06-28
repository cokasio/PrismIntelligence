#!/bin/bash
# AI Test Generation Workflow for PrismIntelligence
# This script demonstrates how to use AI tools to generate comprehensive tests

echo "🤖 PrismIntelligence AI Test Generation Workflow"
echo "================================================"

# Step 1: Install AI Tools (if not already installed)
echo -e "\n📦 Step 1: Checking AI Tools Installation..."
if ! command -v aider &> /dev/null; then
    echo "Installing Aider..."
    pip install aider-chat
fi

# Step 2: Generate Test Strategy
echo -e "\n📋 Step 2: Generating Test Strategy..."
cat << 'EOF' > test-strategy-prompt.txt
Analyze the PrismIntelligence codebase and create a comprehensive testing strategy:

1. Unit Tests (70% coverage target):
   - All service methods in src/services/
   - Parser functions for PDF, Excel, CSV
   - AI analysis pipeline stages
   - Email handling functions

2. Integration Tests (20% coverage):
   - Email ingestion → Queue → Processing → Database
   - Multi-agent AI orchestration
   - File storage and retrieval
   - Report generation and delivery

3. E2E Tests (10% coverage):
   - Complete flow from email to delivered report
   - Multi-tenant scenarios
   - Error recovery paths

Include specific test examples for property management domain.
EOF

# Step 3: Generate Unit Tests with Aider
echo -e "\n🧪 Step 3: Generating Unit Tests..."
echo "Run these commands to generate tests for each service:"
echo ""
echo "# Email Service Tests"
echo "aider src/services/email.ts -m 'Create comprehensive unit tests including mocks for SendGrid'"
echo ""
echo "# AI Service Tests"  
echo "aider src/services/ai.ts src/services/claudeAnalyzer.ts -m 'Create tests for AI analysis with mock responses'"
echo ""
echo "# Parser Tests"
echo "aider src/parsers/*.ts -m 'Create unit tests for all parsers with sample property reports'"

# Step 4: Create Test Fixtures
echo -e "\n📄 Step 4: Creating Test Fixtures..."
mkdir -p tests/fixtures

cat << 'EOF' > tests/fixtures/generate-fixtures.js
// Generate realistic test data for property reports
const fixtures = {
  'standard-pnl.json': {
    reportType: 'P&L',
    property: 'Sunset Apartments',
    period: 'October 2024',
    revenue: {
      rental: 125000,
      other: 5000,
      total: 130000
    },
    expenses: {
      operating: 45000,
      maintenance: 15000,
      management: 10000,
      total: 70000
    },
    noi: 60000
  },
  'variance-report.json': {
    reportType: 'Variance Analysis',
    property: 'Downtown Tower',
    currentMonth: {
      revenue: 200000,
      expenses: 120000
    },
    previousMonth: {
      revenue: 250000,
      expenses: 100000
    },
    variances: {
      revenue: -20,
      expenses: 20
    }
  }
};

// Save fixtures
Object.entries(fixtures).forEach(([filename, data]) => {
  require('fs').writeFileSync(
    `tests/fixtures/${filename}`, 
    JSON.stringify(data, null, 2)
  );
});

console.log('✅ Test fixtures created!');
EOF

# Step 5: Integration Test Template
echo -e "\n🔗 Step 5: Creating Integration Test Template..."
cat << 'EOF' > tests/integration/pipeline.test.template.ts
// Integration Test Template for Complete Pipeline
// Use this as a starting point with AI tools

import { processEmail } from '../../src/services/emailProcessor';
import { analyzeReport } from '../../src/services/aiAnalyzer';
import { generateReport } from '../../src/services/reportGenerator';

describe('Property Report Processing Pipeline', () => {
  it('should process a complete report end-to-end', async () => {
    // 1. Simulate email arrival
    const emailData = loadFixture('inbound-email-with-report.json');
    const { reportId, fileData } = await processEmail(emailData);
    
    // 2. AI Analysis
    const analysis = await analyzeReport(fileData);
    expect(analysis.insights).toHaveLength(greaterThan(0));
    expect(analysis.actions).toHaveLength(greaterThan(0));
    
    // 3. Report Generation
    const report = await generateReport(analysis);
    expect(report.html).toContain('Executive Summary');
    expect(report.insights).toBeDefined();
  });
});
EOF

# Step 6: Performance Test Template
echo -e "\n⚡ Step 6: Creating Performance Test Template..."
cat << 'EOF' > tests/performance/ai-benchmark.test.ts
// AI Performance Benchmark Tests
describe('AI Processing Performance', () => {
  const testCases = [
    { pages: 1, maxTime: 5000 },
    { pages: 10, maxTime: 10000 },
    { pages: 50, maxTime: 30000 }
  ];

  testCases.forEach(({ pages, maxTime }) => {
    it(`should process ${pages}-page report in under ${maxTime}ms`, async () => {
      const report = generateTestReport(pages);
      const start = Date.now();
      
      await aiService.analyzeReport(report);
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(maxTime);
    });
  });
});
EOF

# Step 7: Test Execution Commands
echo -e "\n🚀 Step 7: Test Execution Commands..."
cat << 'EOF' > run-tests.sh
#!/bin/bash
# Complete test execution script

# Run all tests with coverage
echo "Running all tests with coverage..."
npm test -- --coverage

# Run specific test suites
echo -e "\nRunning unit tests..."
npm test -- tests/unit

echo -e "\nRunning integration tests..."
npm test -- tests/integration

echo -e "\nRunning performance tests..."
npm test -- tests/performance

# Generate coverage report
echo -e "\nGenerating coverage report..."
npm test -- --coverage --coverageReporters=html
echo "Coverage report available at: coverage/index.html"

# Check coverage thresholds
echo -e "\nChecking coverage thresholds..."
npm test -- --coverage --coverageThreshold='{"global":{"branches":70,"functions":70,"lines":70,"statements":70}}'
EOF

chmod +x run-tests.sh

# Step 8: AI Tool Commands Summary
echo -e "\n📝 Step 8: AI Tool Commands Reference..."
cat << 'EOF' > AI-TEST-COMMANDS.md
# AI Test Generation Commands for PrismIntelligence

## Aider Commands
```bash
# Generate comprehensive test suite
aider src/**/*.ts --test

# Fix failing tests
aider npm test --message "Fix all failing tests and add missing assertions"

# Add edge cases
aider tests/ --message "Add edge case tests for multi-tenant email processing"

# Improve coverage
aider coverage/lcov.info --message "Add tests to reach 80% coverage"
```

## Claude Code Commands (if available)
```bash
# Generate test strategy
claude-code analyze . --output test-plan.md

# Create integration tests
claude-code generate tests --type integration --context "property management platform"

# Review test quality
claude-code review tests/ --suggest-improvements
```

## Gemini CLI Commands (if available)
```bash
# Quick test generation
gemini generate test src/services/fileProcessor.ts

# Generate test data
gemini generate fixtures --type "property-reports" --count 20

# Create mocks
gemini generate mock src/services/external/sendgrid.ts
```

## Combined Workflow
1. Use Claude Code for strategy and architecture
2. Use Aider for interactive test creation
3. Use Gemini for quick fixtures and mocks
4. Review and enhance manually
EOF

echo -e "\n✅ AI Test Generation Workflow Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Review the generated test templates in tests/"
echo "2. Run the AI commands listed in AI-TEST-COMMANDS.md"
echo "3. Execute ./run-tests.sh to run all tests"
echo "4. Use 'aider --test' to generate tests for uncovered code"
echo ""
echo "Happy testing! 🎉"
