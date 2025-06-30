# Prism Intelligence: AI-Powered Property Management Platform

Transform property management reports into actionable intelligence with the power of AI. Prism Intelligence automatically analyzes financial reports, maintenance records, and operational data to provide clear insights and specific recommendations that drive better business decisions.

## 🚀 NEW: Attachment Intelligence Loop

**Revolutionary file processing system that watches folders and automatically processes property documents using dual AI (Gemini + Claude).**

### Quick Start with Attachment Intelligence:
```bash
# Install dependencies
npm install

# Start the file watcher system
npm run attachment-loop:dev

# Drop files in C:\Dev\PrismIntelligence\incoming\ and watch AI process them!
```

**Features:**
- 🧠 **Dual AI Processing**: Gemini for classification, Claude for insights
- 📁 **Automatic File Watching**: Drop files, get instant AI analysis
- 🎯 **Property-Specific Intelligence**: Understands rent rolls, P&Ls, leases
- 💾 **Complete Data Storage**: All insights stored in Supabase
- 📊 **Multi-Format Support**: CSV, Excel, PDF, text files

👉 **[Complete Attachment Intelligence Guide →](./ATTACHMENT_INTELLIGENCE_QUICK_START.md)**

## Vision Statement

Prism Intelligence democratizes sophisticated property analysis by replacing million-dollar BI implementations with an AI-powered platform that costs 1% as much while delivering superior insights. We're building the nervous system for the property management industry - sensing data from every source, processing it intelligently, and triggering the right actions at the right time.

## How It Works

Property managers simply forward their reports to a designated email address. Our AI system automatically extracts data, performs multi-dimensional analysis, identifies patterns and anomalies, generates actionable insights, and delivers clear recommendations via email. No complex integrations, no training required, no analysts needed.

## Key Features

**Automated Report Processing**: Handles Excel, CSV, and PDF files automatically with intelligent data extraction that understands property management contexts and relationships.

**Multi-Pass AI Analysis**: Claude performs comprehensive analysis including data validation, trend identification, variance explanation, performance benchmarking, and risk assessment across multiple dimensions.

**Actionable Insights**: Every analysis includes specific, prioritized recommendations with clear reasoning and expected outcomes, not just data visualization.

**Continuous Learning**: The system builds institutional memory, recognizing patterns across time and portfolios to provide increasingly sophisticated insights.

**Universal Compatibility**: Works with any existing property management system through simple email forwarding - no APIs, integrations, or system changes required.

## Technology Stack

Built on modern, scalable technologies that provide enterprise-grade reliability at startup-friendly costs. Our architecture uses Supabase for flexible data storage, Claude AI for intelligent analysis, Redis for reliable queue management, and N8N for workflow automation, all deployed with Docker for consistent environments.

## Quick Start

Getting started with Prism Intelligence development takes less than five minutes with our automated setup scripts that handle all the complex configuration work.
## Installation and Setup

### Prerequisites

Before setting up Prism Intelligence, ensure you have these tools installed on your development machine. These prerequisites form the foundation that everything else builds upon.

**Node.js 18 or higher**: The JavaScript runtime that powers the entire application. Node.js provides the environment where your server-side code executes, handles file operations, and manages network communications.

**Docker Desktop**: Essential for containerized development and deployment. Docker ensures that your application runs consistently across different environments, eliminating the classic "it works on my machine" problem.

**Git**: Version control system for managing code changes and collaboration. Even if you're working alone initially, Git provides crucial benefits like change tracking and backup capabilities.

### Environment Configuration

Prism Intelligence requires several API keys and configuration values to function properly. These credentials connect your application to essential external services that provide AI capabilities, email handling, and data storage.

Create a copy of the example environment file and customize it with your specific credentials:

```bash
cp .env.example .env
```

The most critical configuration values you'll need to set include your Anthropic API key for Claude integration, which you can obtain from the Anthropic Console. This key enables all the intelligent analysis capabilities that make Prism Intelligence special. You'll also need a SendGrid API key for email processing, since email serves as both the input mechanism for receiving reports and the output mechanism for delivering insights.

Your Supabase connection details provide the database foundation where all reports, insights, and system data are stored. The Redis URL enables the background job processing that handles report analysis without blocking other operations.

### Automated Setup

The fastest way to get Prism Intelligence running is with our automated setup scripts. These scripts handle all the tedious configuration work, dependency installation, and service startup procedures.

For Unix-like systems (Mac, Linux, WSL):
```bash
chmod +x scripts/setup-dev.sh
./scripts/setup-dev.sh
```

For Windows:
```bash
scripts\setup-dev.bat
```

These setup scripts perform several important operations automatically. They verify that all prerequisites are installed and properly configured, install all Node.js dependencies using npm, create the environment configuration file if it doesn't exist, build the TypeScript application for the first time, start all supporting services using Docker Compose, run database setup and migrations, execute the test suite to verify everything works correctly, and provide clear next steps for development.

The automated approach eliminates most common setup problems and gets you productive immediately rather than spending hours troubleshooting configuration issues.

## Development Workflow

### Starting the Development Environment

Once your initial setup is complete, your daily development workflow becomes straightforward and efficient. The development environment is designed to provide immediate feedback and streamline your coding process.

Start the development server with automatic reloading:
```bash
npm run dev
```

This command starts your application in development mode, which includes several developer-friendly features. The server automatically restarts when you make code changes, TypeScript compilation happens in real-time with immediate error reporting, detailed logging shows you exactly what's happening in your application, and source maps provide accurate debugging information that points to your original TypeScript code rather than compiled JavaScript.

### Running Tests

Testing is crucial for maintaining code quality and preventing regressions as your application grows. The test suite covers all major components and provides examples of how to test different aspects of the system.

Execute the complete test suite:
```bash
npm test
```

Run tests in watch mode during development:
```bash
npm run test:watch
```

The watch mode is particularly useful during development because it automatically re-runs tests when you modify code, providing immediate feedback about whether your changes break existing functionality.

### Code Quality and Linting

Consistent code quality is maintained through automated linting and formatting tools. These tools act like helpful colleagues who review your code and suggest improvements, ensuring that the entire codebase maintains professional standards.

Check code quality with ESLint:
```bash
npm run lint
```

Automatically fix common issues:
```bash
npm run lint:fix
```

Format code with Prettier:
```bash
npm run format
```

### Database Operations

The database serves as the foundation for all data storage and retrieval operations. Understanding how to manage database schema changes and migrations is essential for maintaining data integrity as your application evolves.

Set up the database schema:
```bash
npm run db:setup
```

Run database migrations:
```bash
npm run db:migrate
```

Reset the database (useful for testing):
```bash
npm run db:reset
```

### Working with Docker

Docker containers provide consistent, isolated environments for your application and its dependencies. Understanding Docker operations helps you manage your development environment and prepare for deployment.

View running containers:
```bash
docker-compose ps
```

View service logs:
```bash
docker-compose logs -f
```

Restart specific services:
```bash
docker-compose restart app
```

Stop all services:
```bash
docker-compose down
```

Rebuild and restart everything:
```bash
docker-compose up --build
```

## API Usage and Integration

### Email Processing Workflow

The heart of Prism Intelligence lies in its elegant email-based workflow that eliminates the complexity of traditional API integrations. This approach makes the system accessible to any property management company, regardless of their technical sophistication.

When a property manager forwards a report to your designated email address, several sophisticated processes happen automatically behind the scenes. The system receives the email and immediately places it in a processing queue, ensuring that multiple reports can be handled simultaneously without any delays or conflicts.

The intelligent document parser examines the attached files and determines the best processing approach based on file type, content structure, and naming patterns. This contextual awareness means that a financial summary gets analyzed differently than a maintenance report, even though both might be Excel files.

Claude performs multi-pass analysis on the extracted data, first validating the information for completeness and accuracy, then identifying trends and patterns that might not be obvious to human reviewers. The AI generates specific, actionable insights rather than generic observations, providing recommendations that property managers can implement immediately.

### Health Monitoring

Robust health monitoring ensures that your Prism Intelligence system operates reliably and provides early warning of potential issues. The health check system operates like having a dedicated system administrator who continuously monitors all critical components.

Check overall system health:
```bash
curl http://localhost:3000/health
```

The health endpoint returns detailed information about each system component, including database connectivity, Redis queue status, and AI service availability. This granular reporting helps you quickly identify and resolve issues before they impact your users.

Monitor specific services:
```bash
curl http://localhost:3000/health/database
curl http://localhost:3000/health/redis  
curl http://localhost:3000/health/ai
```

### Configuration Management

Prism Intelligence uses environment-based configuration that adapts automatically to different deployment contexts. This approach means the same codebase works seamlessly in development, staging, and production environments with appropriate settings for each context.

Key configuration categories include database connections that specify where your data is stored and how to access it securely, AI service settings that control which Claude model to use and how to optimize for cost versus performance, email processing configuration that determines how incoming reports are received and outgoing insights are delivered, and queue management settings that control how background processing is handled and scaled.

The configuration system validates all settings at startup, providing clear error messages if any required values are missing or invalid. This validation prevents the frustrating experience of deploying code that fails in production due to configuration issues that could have been caught earlier.

### Security Considerations

Security is built into every layer of Prism Intelligence, protecting both your system and your customers' sensitive property data. The platform implements multiple security measures that work together to create a robust defense system.

All API communications use HTTPS encryption to prevent data interception during transmission. Rate limiting protects against abuse and ensures fair resource usage among all users. Input validation and sanitization prevent malicious data from entering your system. Role-based access controls ensure that users can only see data they're authorized to access.

Database security relies on Supabase Row Level Security policies that enforce access controls at the database layer, providing an additional security barrier even if application-level security is somehow bypassed. This defense-in-depth approach means that multiple security measures would need to fail simultaneously for a breach to occur.

## Deployment

### Production Deployment

Deploying Prism Intelligence to production involves several considerations that ensure your system operates reliably at scale while maintaining security and performance standards. The deployment process transforms your development code into a robust system capable of handling real customer workloads.

Build the production application:
```bash
npm run build
```

This command compiles your TypeScript code into optimized JavaScript, removes development-only features, and creates a production-ready package that runs efficiently in server environments.

Create a production Docker image:
```bash
docker build -t prism-intelligence:latest .
```

The Docker image encapsulates your entire application along with its runtime environment, ensuring consistent behavior regardless of where it's deployed. This containerized approach eliminates environment-specific issues and simplifies scaling operations.

Deploy with Docker Compose for production:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables for Production

Production environments require different configuration values than development environments, particularly around security, performance, and external service connections. These differences ensure that your production system operates securely and efficiently.

Essential production environment variables include NODE_ENV set to "production" to enable performance optimizations and disable development features, secure database connection strings with proper authentication credentials, production API keys for all external services, and SSL certificate paths for secure HTTPS communications.

Log levels should be set appropriately for production monitoring without overwhelming your log storage systems. Rate limiting configurations typically need adjustment to handle production traffic volumes while still protecting against abuse.

### Monitoring and Observability

Production systems require comprehensive monitoring to ensure reliability and performance. Effective monitoring acts like having a team of specialists continuously watching your system and alerting you to any issues before they impact customers.

The health check endpoints provide real-time status information that monitoring systems can use to determine system health. Application logs capture detailed information about system operations, errors, and performance metrics. Error tracking services can aggregate and analyze errors to help you identify and resolve issues quickly.

Performance monitoring tracks response times, throughput, and resource usage to help you optimize system performance and plan for scaling needs. User experience monitoring ensures that the actual customer experience meets your quality standards.

### Scaling Considerations

As Prism Intelligence grows and processes more reports, you'll need to scale different components appropriately. Understanding how to scale effectively ensures that your system continues to perform well as demand increases.

The queue system can be scaled horizontally by adding more worker processes to handle increased report processing volume. Database performance can be optimized through proper indexing, connection pooling, and read replicas for heavy query workloads.

The AI service calls to Claude can be optimized through request batching, caching of similar analyses, and intelligent retry mechanisms that handle temporary service unavailability gracefully.

Container orchestration platforms like Kubernetes can automate much of the scaling process, automatically adding or removing server capacity based on actual demand patterns.

## Troubleshooting

### AI Service Timeouts

If you experience frequent timeouts when interacting with the AI service, it's possible that you're hitting the rate limits of your API plan. The free or lower-tier plans for services like Anthropic's Claude have stricter limits on the number of requests you can make in a given period.

If you suspect this is the case, you should:

1.  **Check your API plan:** Log in to your Anthropic account and check your current plan and usage.
2.  **Upgrade your plan:** If you're consistently hitting the rate limits, you may need to upgrade to a higher-tier plan.
3.  **Implement batching:** If you're sending many small prompts in quick succession, consider batching them into a single, larger API call. This can help you stay within the rate limits and may also be more cost-effective.

### Common Issues and Solutions

Even well-designed systems encounter occasional issues, especially during initial deployment and setup phases. Understanding common problems and their solutions helps you resolve issues quickly and maintain system reliability.

**Database Connection Issues**: These often result from incorrect connection strings, network connectivity problems, or authentication failures. Verify that your database URL is correct, check that your database server is accessible from your application server, and ensure that authentication credentials are valid and have appropriate permissions.

**AI Service Timeouts**: Claude API calls occasionally timeout due to network issues or service load. Implement retry logic with exponential backoff, monitor API response times, and consider request queuing during high-demand periods.

**Email Processing Problems**: Email delivery issues can result from authentication problems, rate limiting, or content filtering. Verify API keys and sender authentication, monitor sending quotas and rate limits, and ensure email content meets deliverability standards.

**Queue Processing Delays**: Background job processing can slow down due to resource constraints or error accumulation. Monitor queue length and processing times, ensure adequate worker processes are running, and implement proper error handling to prevent job failures from blocking the queue.

### Debugging Tools and Techniques

Effective debugging requires the right tools and systematic approaches to identify and resolve issues efficiently. Good debugging practices save hours of frustration and help you understand your system more deeply.

Application logs provide the most immediate insight into system behavior. Log entries should include sufficient context to understand what was happening when issues occurred. Structured logging with consistent formats makes it easier to search and analyze log data.

Database query logging helps identify performance bottlenecks and errors in data operations. Monitor slow queries and connection issues that might indicate database optimization opportunities.

Health check endpoints provide real-time system status that helps you quickly identify which components are experiencing problems during incident response.

Local reproduction of production issues often requires creating test data that matches production conditions. The sample data files in your project provide starting points for creating realistic test scenarios.

## Contributing

### Development Guidelines

Prism Intelligence follows established patterns and conventions that ensure code quality and maintainability as the project grows. These guidelines help maintain consistency across different contributors and make the codebase easier to understand and modify.

All code should include appropriate TypeScript types to prevent runtime errors and provide better development tooling support. Functions and classes should include JSDoc comments that explain their purpose, parameters, and return values.

Test coverage should include unit tests for individual functions, integration tests for service interactions, and end-to-end tests for complete workflows. New features should include tests that verify both expected behavior and edge cases.

Code reviews should focus on correctness, performance, security, and maintainability. Reviews provide opportunities for knowledge sharing and continuous improvement of development practices.

### Project Structure Understanding

Understanding the project structure helps you navigate the codebase efficiently and make appropriate modifications. The organization follows common Node.js and TypeScript conventions while adding domain-specific organization for property management concepts.

The services directory contains the core business logic organized by functional areas like document parsing, AI analysis, and email processing. Utilities provide shared functions used across multiple services. Middleware handles cross-cutting concerns like error handling and rate limiting.

Configuration management centralizes all environment-specific settings in a single location with validation and type safety. The database directory contains schema definitions and migration scripts that track data model evolution over time.

Thank you for choosing Prism Intelligence to transform your property management operations. This platform represents a new paradigm in property analysis that combines the power of AI with the simplicity that busy property managers need. As you implement and use the system, you'll discover that intelligent automation can dramatically improve both operational efficiency and decision-making quality.

For support, questions, or contributions, visit our project repository or reach out to our development team. We're committed to continuously improving Prism Intelligence and helping you succeed in transforming property management through intelligent automation.

## 📋 Development Setup

### Cursor Rules & Quick Reference
- **`.cursorrules`** - Comprehensive development guidelines and project structure
- **`QUICK_REFERENCE.md`** - Quick command reference for common tasks

## ✅ Fixed and Ready!

I've successfully fixed the backend crash and created batch files to manage your Prism Intelligence services. Here's what I did:

### 🔧 Fixes Applied:

1. **Fixed Backend Crash**:
   - Created missing `services/attachmentIntelligenceLoop.ts` 
   - Created missing `utils/logger.ts`
   - Added `chokidar` dependency to package.json
   - Backend now starts successfully as a file watcher service

2. **Fixed Frontend Warning**:
   - Removed deprecated `appDir` option from `next.config.js`
   - Next.js 15 uses app directory by default

### 📁 Batch Files Created:

1. **start-prism-unified.bat** - Starts both services in one window (recommended)
2. **start-prism-separate.bat** - Starts services in separate windows
3. **stop-prism.bat** - Stops all running services
4. **restart-prism.bat** - Restarts all services
5. **BATCH_FILES_README.md** - Documentation for all batch files

### 🚀 To Start Fresh:

```batch
# First, stop any running services
stop-prism.bat

# Then start fresh
start-prism-unified.bat
```

Your services should now start successfully:
- **Frontend**: http://localhost:3000 (Next.js Dashboard)
- **Backend**: File watcher monitoring `C:/Dev/PrismIntelligence/incoming/`

The backend will watch for property management files dropped in the incoming folders and process them with AI. The frontend provides the web interface for viewing results.

Try dropping a file in `C:/Dev/PrismIntelligence/incoming/` to see the file watcher in action! 🎉
