# 🎭 AI Orchestra for PrismIntelligence

A drop-in AI coordination system that orchestrates Claude, Aider, Claude Code, Gemini, and OpenManus to supercharge your development workflow.

## 🚀 Quick Start

```bash
# See available commands
ai-orchestra

# Add a new feature
ai-orchestra feature "add dashboard analytics"

# Fix a bug
ai-orchestra fix "email service not sending confirmations"

# Add multi-tenant support
ai-orchestra tenant "reporting module"

# Generate tests
ai-orchestra test "email service"
```

## 📁 What's Included

```
.ai-orchestra/
├── orchestra.js        # Main orchestrator
├── config.yaml        # Project configuration
└── workflows/         # Custom workflows
    ├── add-parser.yaml      # Add new report parser
    ├── multi-tenant.yaml    # Multi-tenant features
    └── ...more
```

## 🎯 Available Workflows

### Core Workflows
- **feature** - Complete feature development (design → implement → test)
- **fix** - Bug fixing with root cause analysis
- **test** - Comprehensive test generation
- **optimize** - Performance optimization

### PrismIntelligence Specific
- **tenant** - Add multi-tenant functionality
- **ai** - Enhance AI analysis capabilities
- **email** - Email processing improvements
- **parser** - Add new report format support

## 🛠️ How It Works

1. **Analyzes** your request using Claude for architecture
2. **Implements** changes using Aider for direct file editing
3. **Generates** supporting code with Gemini for speed
4. **Coordinates** everything for maximum efficiency

## 💡 Quick Commands

```bash
# Shortcuts for common tasks
ai-orchestra add-service "notification"      # New service
ai-orchestra add-route "analytics"           # New API route
ai-orchestra add-tenant "billing"            # Multi-tenant feature
ai-orchestra improve-ai "report analysis"    # AI enhancement
ai-orchestra optimize "queue processing"     # Performance

# Or use the batch file
ai-orchestra.bat feature "add real-time updates"
```

## 🔧 Configuration

Edit `.ai-orchestra/config.yaml` to customize:
- Tool preferences for different tasks
- Project-specific context
- Custom workflows
- Quick command aliases

## 📋 Example: Add Dashboard Feature

```bash
ai-orchestra feature "add real-time dashboard"
```

This will:
1. 🧠 Claude designs the architecture
2. 🔨 Aider creates the file structure
3. ⚡ Gemini generates TypeScript interfaces
4. 🔧 Aider implements the functionality
5. 🧪 Aider creates comprehensive tests

## 🎨 Custom Workflows

Create your own workflows in `.ai-orchestra/workflows/`:

```yaml
name: My Custom Workflow
steps:
  - tool: claude
    prompt: "Design solution for: {input}"
  - tool: aider
    prompt: "Implement the design"
    files: src/
```

## 🚦 Prerequisites

- **Required**: Node.js
- **Recommended**: 
  - Aider (`pip install aider-chat`)
  - Claude API key
  - Other AI tools as needed

## 🏗️ Project Context

The orchestrator knows about your project:
- TypeScript + Express backend
- Supabase database with RLS
- CloudMailin for email ingestion
- Bull/Redis for queue processing
- Multi-tenant architecture
- AI-powered report analysis

## 💪 Power Tips

1. **Batch Operations**: Process multiple features
   ```bash
   ai-orchestra feature "add logging" && ai-orchestra test "logging service"
   ```

2. **Specific Files**: Target specific files
   ```bash
   ai-orchestra fix "database connection issue" --files src/services/database.ts
   ```

3. **Combine Tools**: Use tool strengths
   - Claude for planning
   - Aider for implementation
   - Gemini for quick generation

## 🎯 Real Examples for PrismIntelligence

```bash
# Add support for new report type
ai-orchestra workflow add-parser "cash flow" "excel"

# Add tenant-specific feature
ai-orchestra workflow multi-tenant "custom branding"

# Improve AI analysis
ai-orchestra ai "better variance detection"

# Add new email template
ai-orchestra email "weekly summary"
```

## 🔄 Workflow Process

Each workflow follows smart patterns:
1. **Understand** - Analyze the request
2. **Design** - Create architecture
3. **Implement** - Build the solution
4. **Test** - Ensure quality
5. **Integrate** - Connect with existing system

---

Built specifically for PrismIntelligence - your AI-powered property management platform! 🏢✨
