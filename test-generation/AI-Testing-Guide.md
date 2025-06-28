# AI-Powered Test Generation Guide for PrismIntelligence

## Tool Overview

### 1. Aider - Interactive Coding Assistant
Best for: Generating test suites, refactoring existing tests, adding edge cases

### 2. Claude Code - Terminal-Based AI Coding
Best for: Complex test scenarios, integration tests, test strategy

### 3. Gemini CLI - Google's AI Assistant
Best for: Quick test generation, unit tests, test data creation

## Setting Up Aider for Test Generation

### Installation
```bash
# Install Aider
pip install aider-chat

# Configure with your API key
export ANTHROPIC_API_KEY="your-key-here"
```

### Using Aider for PrismIntelligence Tests

```bash
# Navigate to your project
cd C:\Dev\PrismIntelligence

# Start Aider with test files
aider src/services/claudeAnalyzer.ts tests/services/claudeAnalyzer.test.ts

# Example commands in Aider:
# > Create comprehensive unit tests for claudeAnalyzer including edge cases
# > Add integration tests for the email processing pipeline
# > Generate mock data for testing property reports
# > Create performance tests for the AI analysis functions
```

### Aider Test Generation Prompts

```bash
# 1. Generate comprehensive test suite
aider src/services/fileProcessor.ts --message "Create a complete test suite for fileProcessor.ts including:
- Unit tests for each parsing function
- Edge cases for corrupted files
- Performance tests for large files
- Mock data for PDF, Excel, and CSV formats"

# 2. Add integration tests
aider src/api/routes.ts tests/integration/api.test.ts --message "Create integration tests for all API endpoints including:
- SendGrid webhook tests with various payloads
- File upload endpoint tests
- Error handling scenarios
- Authentication and rate limiting tests"

# 3. Generate test fixtures
aider --message "Create test fixtures in tests/fixtures/ for:
- Sample property reports (PDF, Excel, CSV)
- SendGrid webhook payloads
- AI response mocks
- Database seed data"
```

## Using Claude Code for Test Development

### Setup Claude Code
```bash
# Install Claude Code (if available)
npm install -g claude-code

# Or use via Anthropic's interface
claude-code init
```

### Claude Code Test Commands

```bash
# Generate test strategy
claude-code analyze src/ --output test-strategy.md --prompt "Create a comprehensive testing strategy for a property intelligence platform including unit, integration, and e2e tests"

# Create specific test files
claude-code generate test --file src/services/ai.ts --coverage 90

# Generate test data
claude-code generate fixtures --type "property-reports" --count 20
```

### Example Claude Code Session
```bash
claude-code chat
> Analyze my PrismIntelligence codebase and create:
> 1. Unit tests for all services with 90% coverage
> 2. Integration tests for the email->AI->database pipeline
> 3. Performance benchmarks for AI processing
> 4. Mock implementations for external services
```

## Using Gemini CLI for Quick Tests

### Setup Gemini CLI
```bash
# Install Gemini CLI
npm install -g @google/gemini-cli

# Configure API key
gemini config set api_key YOUR_GEMINI_API_KEY
```

### Gemini Test Generation Examples

```bash
# Quick unit test generation
gemini generate test src/parsers/pdfParser.ts -o tests/parsers/pdfParser.test.ts

# Generate test data
gemini generate data --schema "property_report" --format json --count 50

# Create mock services
gemini generate mock src/services/email.ts -o tests/mocks/emailService.mock.ts
```

## Integrated AI Testing Workflow

### 1. Test Strategy Generation
```bash
# Use Claude Code for high-level strategy
claude-code analyze . --prompt "Create test pyramid for property intelligence platform"

# Output: test-strategy.md with:
# - Unit test requirements (70%)
# - Integration test requirements (20%)
# - E2E test requirements (10%)
```

### 2. Test Implementation
```bash
# Use Aider for interactive test creation
aider src/services/*.ts tests/services/*.test.ts --message "Implement unit tests based on test-strategy.md"

# Use Gemini for quick test generation
gemini batch generate tests src/**/*.ts --coverage-target 80
```

### 3. Test Data & Fixtures
```bash
# Create realistic test data
claude-code generate fixtures --prompt "Create 20 realistic property reports with various edge cases:
- Missing data
- Calculation errors  
- Multiple properties
- Different time periods
- Various file formats"
```

## Best Practices for AI Test Generation

### 1. Iterative Refinement
```bash
# Start with basic tests
aider src/services/ai.ts --message "Create basic happy path tests"

# Add edge cases
aider src/services/ai.ts tests/services/ai.test.ts --message "Add edge case tests for:
- Empty reports
- Malformed data
- API failures
- Rate limiting"

# Add performance tests
aider --message "Add performance benchmarks for processing 100 reports"
```

### 2. Test Quality Verification
```bash
# Review generated tests
npm test -- --coverage

# Use AI to improve coverage
aider coverage/lcov.info --message "Analyze coverage report and add tests for uncovered branches"
```

### 3. Continuous Test Enhancement
```bash
# Weekly test review
claude-code review tests/ --prompt "Identify missing test scenarios and suggest improvements"

# Add tests for new features
aider src/features/newFeature.ts --message "Create TDD tests for the new multi-tenant feature"
```

## Example Test Generation Session

### Complete Test Suite for Email Processing

```bash
# 1. Start with the service
aider src/services/email.ts

# 2. In Aider, request comprehensive tests:
> Create a complete test suite for the email service including:
> - Unit tests for sendConfirmation, sendResults, sendError
> - Mock SendGrid API responses
> - Test various email templates
> - Edge cases: invalid emails, API failures, rate limits
> - Integration test with queue service

# 3. Generate test fixtures
> Create test fixtures for:
> - Valid inbound emails with attachments
> - Emails with multiple attachments
> - Emails with oversized attachments
> - Spam emails
> - Emails with no attachments
```

### AI Analysis Pipeline Tests

```bash
# Using Claude Code for complex scenario
claude-code generate test-scenario --prompt "
Create an end-to-end test for the complete analysis pipeline:
1. Receive email with property report
2. Extract and validate attachment
3. Parse PDF with financial data
4. Run 4-pass AI analysis
5. Store results in database
6. Send formatted results email
Include timing assertions and error handling
"
```

## Testing the AI Tools Themselves

### 1. Benchmark AI Performance
```javascript
// tests/benchmarks/ai-performance.test.ts
describe('AI Performance Benchmarks', () => {
  it('should process a standard report in under 10 seconds', async () => {
    const report = await loadFixture('standard-property-report.pdf');
    const startTime = Date.now();
    
    const result = await claudeAnalyzer.analyzeReport(report);
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(10000);
    expect(result.insights).toHaveLength(greaterThan(5));
  });
});
```

### 2. Validate AI Output Quality
```javascript
// tests/quality/ai-output.test.ts
describe('AI Output Quality', () => {
  it('should generate actionable insights', async () => {
    const report = await loadFixture('complex-variance-report.xlsx');
    const analysis = await multiPassAnalysis(report);
    
    // Check insight quality
    expect(analysis.insights).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: expect.stringMatching(/trend|anomaly|recommendation/),
          confidence: expect.any(Number),
          actionable: true
        })
      ])
    );
  });
});
```

## Continuous Testing with AI

### GitHub Actions Integration
```yaml
# .github/workflows/ai-test-generation.yml
name: AI Test Generation
on:
  schedule:
    - cron: '0 0 * * 0' # Weekly
jobs:
  generate-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Generate Missing Tests
        run: |
          aider --yes --message "Analyze code coverage and generate tests for uncovered code"
      - name: Create PR
        uses: peter-evans/create-pull-request@v5
        with:
          title: 'AI Generated Tests'
          body: 'Weekly AI-generated tests for uncovered code'
```

## Quick Start Commands

```bash
# 1. Install all AI tools
pip install aider-chat
npm install -g @google/gemini-cli claude-code

# 2. Generate initial test suite
cd C:\Dev\PrismIntelligence
aider src/**/*.ts --message "Generate comprehensive test suite with 80% coverage target"

# 3. Run and verify tests
npm test -- --coverage

# 4. Iterate and improve
aider coverage/lcov.info --message "Add tests for uncovered lines"
```

Remember: AI-generated tests are a starting point. Always review and enhance them with domain-specific knowledge about property management!
