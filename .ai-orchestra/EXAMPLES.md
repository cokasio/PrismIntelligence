# 🎭 AI Orchestra Examples for PrismIntelligence

## Real-World Usage Examples

### 1. Add Support for Rent Roll Reports

```bash
# This will create a complete parser for rent roll Excel files
ai-orchestra workflow add-parser "rent roll" "excel"

# The AI Orchestra will:
# 1. Claude: Analyze rent roll structure and fields
# 2. Aider: Create parser in src/parsers/rentroll.ts
# 3. Gemini: Generate TypeScript types
# 4. Aider: Add AI prompts for analysis
# 5. Aider: Create comprehensive tests
```

### 2. Add Tenant Dashboard Feature

```bash
# Multi-tenant dashboard with proper isolation
ai-orchestra tenant "dashboard with property metrics"

# This coordinates:
# 1. Claude: Design tenant-isolated dashboard architecture
# 2. Aider: Update database schema with RLS
# 3. Aider: Create dashboard service
# 4. Aider: Add API routes with tenant validation
# 5. Aider: Generate tests for tenant isolation
```

### 3. Fix Email Processing Bug

```bash
# Intelligent bug fixing with root cause analysis
ai-orchestra fix "CloudMailin webhook not processing Excel attachments"

# Process:
# 1. Claude: Analyze the issue in the webhook code
# 2. Aider: Fix the bug in src/api/routes.ts
# 3. Aider: Add tests to prevent regression
```

### 4. Optimize AI Analysis Performance

```bash
# Performance optimization workflow
ai-orchestra optimize "AI analysis taking too long for large PDFs"

# Steps:
# 1. Claude: Analyze performance bottlenecks
# 2. Claude Code: Profile the code
# 3. Aider: Implement optimizations
# 4. Aider: Add performance benchmarks
```

### 5. Add New Email Template

```bash
# Quick email template addition
ai-orchestra email "monthly summary with charts"

# Coordinates:
# 1. Aider: Update email service with new template
# 2. Aider: Add chart generation logic
# 3. Gemini: Create test data
```

### 6. Comprehensive Test Generation

```bash
# Generate tests for existing code
ai-orchestra test "src/services/claudeAnalyzer.ts"

# Creates:
# - Unit tests with mocked dependencies
# - Integration tests
# - Performance tests
# - Test fixtures
```

## 🚀 Advanced Usage

### Chaining Commands

```bash
# Add feature and immediately test it
ai-orchestra feature "add budget variance alerts" && ai-orchestra test "budget variance"
```

### Custom Workflows

Create `.ai-orchestra/workflows/budget-alerts.yaml`:

```yaml
name: Budget Variance Alerts
steps:
  - tool: claude
    prompt: Design budget variance detection for property reports
  - tool: aider
    files: src/services/analysis/
    prompt: Implement variance calculation service
  - tool: aider
    files: src/services/email.ts
    prompt: Add email alerts for variances over threshold
  - tool: aider
    files: tests/
    prompt: Create tests for variance detection
```

Run with:
```bash
ai-orchestra workflow budget-alerts
```

## 💡 Tips for PrismIntelligence

1. **Always include tenant context** when adding features
2. **Reference existing patterns** in your prompts
3. **Use the `ai` workflow** for AI-specific enhancements
4. **Test multi-tenant isolation** with every new feature
5. **Leverage CloudMailin routing** for tenant-specific features

## 🎯 Quick Reference

```bash
# Most common commands for your project
ai-orchestra feature "feature description"    # New feature
ai-orchestra fix "bug description"           # Bug fix
ai-orchestra tenant "feature name"           # Multi-tenant feature
ai-orchestra test "component name"           # Generate tests
ai-orchestra ai "enhancement description"    # AI improvements
ai-orchestra optimize "what to optimize"     # Performance
```

---

Remember: AI Orchestra adapts to available tools. If some aren't installed, it uses alternatives or guides you through manual steps.
