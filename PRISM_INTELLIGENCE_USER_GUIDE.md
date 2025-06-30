# Prism Intelligence User Guide

![Prism Intelligence Logo](https://via.placeholder.com/800x200/3498db/ffffff?text=Prism+Intelligence)

## Table of Contents
- [Introduction](#introduction)
- [System Requirements](#system-requirements)
- [Quick Start](#quick-start)
- [Components Overview](#components-overview)
- [Installation and Setup](#installation-and-setup)
- [Using Prism Intelligence](#using-prism-intelligence)
- [Understanding the Results](#understanding-the-results)
- [Best Practices](#best-practices)
- [Advanced Features](#advanced-features)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

## Introduction

Prism Intelligence is an AI-powered property management platform that transforms complex property management reports into actionable intelligence. By leveraging advanced AI models (Claude and Gemini), Prism Intelligence automatically analyzes financial reports, maintenance records, and operational data to provide clear insights and specific recommendations that drive better business decisions.

### What Makes Prism Intelligence Special?

- **Automated Analysis**: No more manual data entry or spreadsheet analysis
- **Multi-AI Processing**: Uses Gemini for document classification and Claude for deep analysis
- **Simple Integration**: Works via email or file drop - no complex integrations required
- **Property-Specific Intelligence**: Understands the nuances of property management
- **Actionable Insights**: Provides clear recommendations, not just data

## System Requirements

### For Development Environment
- **Node.js**: Version 18 or higher
- **Docker**: Latest stable version (for containerized development)
- **Git**: For version control
- **Storage**: At least 4GB of free disk space
- **RAM**: Minimum 8GB recommended

### For Production Deployment
- **Server**: Any cloud provider (AWS, Azure, GCP) or dedicated hosting
- **Database**: Supabase (PostgreSQL)
- **Memory**: Minimum 4GB RAM recommended
- **Storage**: Depends on volume of documents processed (start with 20GB)
- **Network**: Reliable internet connection for AI API calls

## Quick Start

The fastest way to get started with Prism Intelligence is using the automated setup script:

```bash
# Start the unified development environment
start.bat
```

This script checks for prerequisites, installs dependencies if needed, creates required configuration files, and starts all services:

- Frontend: http://localhost:3000
- API: http://localhost:3001
- Email processor and AI backend run in the background

## Components Overview

Prism Intelligence consists of several interconnected components:

### 1. Next.js Frontend
The user interface for interacting with the platform, viewing insights, and managing settings. Built with Next.js for fast, responsive performance.

### 2. AI Backend
Processes documents using dual AI approach:
- **Gemini**: Handles document classification and complex layout extraction
- **Claude**: Performs business intelligence analysis and generates insights

### 3. API Server
Provides endpoints for integration with other systems and facilitates communication between components.

### 4. Email Processing
Handles incoming emails with attachments, extracting files for analysis.

### 5. Attachment Intelligence Loop
Monitors designated folders for new files and processes them automatically.

## Installation and Setup

### Prerequisites Installation

1. **Install Node.js**:
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **Install Git**:
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify installation: `git --version`

3. **Install Docker** (optional but recommended):
   - Download from [docker.com](https://www.docker.com/products/docker-desktop)
   - Verify installation: `docker --version`

### Project Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-org/prism-intelligence.git
   cd prism-intelligence
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   - Create a `.env.local` file by copying the template:
     ```bash
     cp .env.example .env.local
     ```
   - Edit `.env.local` to add your API keys and configuration:
     - `NEXT_PUBLIC_APP_URL`: Your application URL (default: http://localhost:3000)
     - `CLOUDMAILIN_ADDRESS`: Your CloudMailin email address
     - `DATABASE_URL`: Your Supabase database URL

4. **Start the development environment**:
   ```bash
   npm run dev
   # or
   start.bat
   ```

## Using Prism Intelligence

### Processing Documents via Email

The simplest way to use Prism Intelligence is to forward property management reports to your designated email address:

1. Forward an email with property reports attached to: `your-configured-email@cloudmailin.net`
2. Prism Intelligence will automatically:
   - Extract the attachments
   - Classify the document types
   - Process and analyze the data
   - Generate insights and recommendations
   - Store the results for viewing

### Processing Documents via File Drop

For local testing or batch processing:

1. Drop files into the monitored folder:
   - Default location: `C:\Dev\PrismIntelligence\incoming\`
   - Create subfolders for better organization (optional):
     - `financial/`: For financial reports
     - `leases/`: For lease documents
     - `maintenance/`: For maintenance reports

2. The Attachment Intelligence Loop will automatically detect and process the files

### Viewing Results

1. **Open the Dashboard**:
   - Navigate to http://localhost:3000 in your browser
   - Log in if required

2. **Navigate to the Emails Tab**:
   - View processed emails and their attachments
   - See the status of processing (pending, processing, completed, failed)

3. **View Analysis Results**:
   - Click on a processed email to see the extracted data and insights
   - Review key metrics, trends, and recommendations

4. **Export or Share**:
   - Download reports as PDF or CSV
   - Share insights via email directly from the platform

## Understanding the Results

Prism Intelligence provides several layers of intelligence from your documents:

### 1. Document Classification

Each document is classified by type:
- Financial Statement (P&L, Balance Sheet, Cash Flow)
- Rent Roll
- Lease Document
- Maintenance Report
- Market Analysis

### 2. Data Extraction

Structured data is extracted from documents:
- Financial metrics (revenue, expenses, NOI, etc.)
- Property information (units, occupancy, square footage)
- Lease details (terms, rates, tenants)
- Maintenance issues and costs

### 3. Analysis and Insights

AI-generated analysis includes:
- Performance trends (increasing/decreasing metrics)
- Variance explanations (why numbers changed)
- Benchmark comparisons (against targets or industry standards)
- Risk assessments (potential issues identified)

### 4. Actionable Recommendations

Specific actions to consider:
- Prioritized by potential impact
- With clear reasoning for each recommendation
- Linked to specific data points for context

## Best Practices

### Document Preparation

For optimal results:
- **Consistent Formatting**: Use consistent formatting for recurring reports
- **Clean Data**: Ensure reports are free of major errors before submission
- **Complete Information**: Include all relevant sections of reports
- **Context**: Include property name in filenames when possible

### Processing Workflow

- **Regular Schedule**: Process reports on a consistent schedule
- **Organized Folders**: Use logical folder structure for file processing
- **Verification**: Periodically verify AI analysis against manual checks
- **Feedback Loop**: Note any processing issues to improve the system

### System Management

- **Regular Updates**: Keep the platform updated with latest versions
- **Monitoring**: Check logs periodically for any processing issues
- **Backup**: Maintain backups of your database and configuration
- **Testing**: Test with sample documents after major updates

## Advanced Features

### Email Testing Mode

Toggle between live and demo mode to test email processing:
```bash
# Toggle mode via API
curl -X POST http://localhost:3001/api/emails/toggle-mode
```

### Multi-Agent Processing

Configure which AI models handle different aspects of processing:
- Edit `openmanus/config/prism_intelligence.toml` to adjust AI assignments
- Balance between accuracy and cost by selecting appropriate models

### Custom Document Types

Add support for custom document types:
1. Create a new parser in the appropriate directory
2. Register the parser in the classification system
3. Define extraction rules and analysis prompts

### Integration with Property Management Systems

Use the API endpoints to integrate with existing systems:
- Webhook support for real-time notifications
- API authentication for secure integration
- Structured data output compatible with most systems

## Troubleshooting

### Common Issues and Solutions

#### Frontend Not Loading
- **Issue**: "Cannot connect to localhost:3000"
- **Solution**: Ensure the Next.js frontend is running (`npm run dev` or check start.bat output)
- **Check**: Look for any error messages in the terminal

#### Email Processing Failures
- **Issue**: Emails not being processed
- **Solution**: Verify CloudMailin configuration and email processor status
- **Check**: Logs in `logs/email-processor.log`

#### File Processing Issues
- **Issue**: Files in watched folder not being processed
- **Solution**: Ensure the Attachment Intelligence Loop is running
- **Check**: Logs in `logs/attachment-loop.log`

#### AI Analysis Errors
- **Issue**: Documents processed but no insights generated
- **Solution**: Check AI API keys and rate limits
- **Check**: Logs for any API error messages

### Logging and Debugging

Log files are stored in the `logs/` directory:
- `frontend.log`: Next.js frontend logs
- `api.log`: API server logs
- `email-processor.log`: Email processing logs
- `attachment-loop.log`: File processing logs

Enable debug mode for more detailed logs:
```bash
# Set environment variable before starting
set DEBUG=true
start.bat
```

### Getting Help

If you encounter issues not covered in this guide:
1. Check the GitHub repository issues section
2. Review the documentation in the `docs/` directory
3. Contact support at support@prismintelligence.com

## FAQ

### General Questions

**Q: How does Prism Intelligence differ from traditional BI tools?**  
A: Prism Intelligence combines document understanding with property-specific business intelligence. Unlike traditional BI tools that require data to be in a specific format, Prism Intelligence can extract and analyze data from virtually any property management report format.

**Q: Does Prism Intelligence work with my property management software?**  
A: Yes! Since Prism Intelligence works by analyzing the reports you already generate, it's compatible with any property management software that can produce reports (as Excel, CSV, PDF, etc.).

**Q: How accurate is the AI analysis?**  
A: The dual AI approach (Gemini + Claude) provides accuracy typically above 95% for standard reports. The system includes confidence scores with each analysis and flags any uncertain interpretations for review.

### Technical Questions

**Q: Can I deploy Prism Intelligence on my own servers?**  
A: Yes, the platform is designed for flexible deployment. The Docker containerization makes it easy to deploy on any server or cloud provider.

**Q: How does the email processing work?**  
A: Prism Intelligence uses CloudMailin to receive emails. When an email arrives, attachments are extracted and sent to the processing pipeline. You can also bypass email entirely by using the file drop feature.

**Q: Can I customize the insights and analysis?**  
A: Yes, the AI prompts that generate insights can be customized. Advanced users can modify the prompt templates in the `prompts/` directory to focus on specific areas of interest.

**Q: What about data privacy and security?**  
A: Prism Intelligence is designed with data privacy in mind. All data is processed on your own infrastructure or dedicated cloud resources. The only external calls are to the AI APIs (Claude and Gemini) which don't store your data after processing.

---

Thank you for choosing Prism Intelligence! This platform represents a new paradigm in property analysis that combines the power of AI with the simplicity that busy property managers need.

For additional help or to report issues, please visit our GitHub repository or contact our support team.

© 2025 Prism Intelligence | [www.prismintelligence.com](https://www.prismintelligence.com)