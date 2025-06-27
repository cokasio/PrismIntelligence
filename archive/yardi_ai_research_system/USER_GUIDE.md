# Yardi AI Research System - User Guide

## Overview

The **Yardi AI Research System** is a comprehensive, AI-powered platform designed to automate and enhance lead research, contact verification, company analysis, and outreach management for Yardi consulting and related business development. It leverages multiple advanced AI models to deliver accurate, actionable business intelligence and streamline the process of identifying and engaging high-value prospects.

---

## Project Objective & Purpose

- **Objective:**
  - To automate the process of researching, verifying, and prioritizing business leads for Yardi consulting using multiple AI models.
  - To provide a unified system for managing company and contact data, tracking research activities, and optimizing outreach campaigns.

- **Purpose:**
  - Reduce manual research time from hours to minutes per contact.
  - Increase accuracy and confidence in contact and company data.
  - Enable scalable, data-driven outreach and business development.
  - Centralize all research, verification, and outreach activities in a single, extensible platform.

---

## Main Components

### 1. **Core Python Modules**

- **`ai_research_system.py`**
  - Implements the AI model interfaces and logic for OpenAI, Claude, Gemini, and DeepSeek.
  - Handles contact research, email verification, and company analysis for each model.

- **`ai_orchestrator.py`**
  - Orchestrates multiple AI models, builds consensus from their outputs, and manages the SQLite database.
  - Handles batch processing, result storage, and export.

- **`main_research.py`**
  - Main entry point for running research tasks.
  - Provides the `YardiLeadResearcher` class for single/batch research and configuration.

### 2. **Configuration & Setup**

- **`requirements.txt`**
  - Lists all required Python packages.
- **`SETUP_GUIDE.md`**
  - Step-by-step installation and configuration instructions.
- **`ai_config.json`** (auto-generated)
  - Stores API keys and model/task configuration.

### 3. **Data & Documentation Files**

- **CSV Data Files:**
  - `companies.csv`, `contacts.csv`, `research_activities.csv`, `outreach_campaigns.csv`, `outreach_activities.csv`, `opportunities.csv`, `business_intelligence.csv`, `decision_makers_priority.csv`
  - Provide structured data for companies, contacts, research logs, outreach, opportunities, and business intelligence.

- **Documentation:**
  - `README.md`: Project summary and quick start.
  - `database_schema.md`: Full schema for the lead management system.
  - `csv_import_instructions.md`: Import order and data relationships.
  - `yardi_consulting_strategy.md`: Business analysis and recommendations.
  - `email_acquisition_guide.md`, `immediate_email_action_plan.md`: Guides for acquiring and verifying real contact emails.

---

## How the System Works

### 1. **Multi-AI Consensus Research**
- Multiple AI models (OpenAI, Claude, Gemini, DeepSeek) are used in parallel for each research task.
- The orchestrator builds a consensus from their outputs, increasing accuracy and confidence.
- Results are stored in a local SQLite database for further analysis and export.

### 2. **Contact & Company Research**
- Research can be performed for a single contact, a list of priority targets, or in batch from a CSV file.
- Each contact is analyzed for job title, email, LinkedIn, seniority, and decision authority.
- Companies are analyzed for industry, size, pain points, and Yardi consulting opportunities.

### 3. **Email Verification**
- AI models validate email formats, suggest alternatives, and estimate business likelihood.
- Results are combined for a consensus verification.

### 4. **Outreach Management**
- Outreach campaigns and activities are tracked in dedicated CSV files and the database.
- High-priority decision makers are identified and prioritized for immediate outreach.

### 5. **Business Intelligence & Opportunities**
- Market intelligence, company news, and sales opportunities are tracked and linked to contacts/companies.

---

## Setup & Usage

### 1. **Installation**
- Extract the project files.
- Install dependencies:
  ```bash
  pip install -r requirements.txt
  ```

### 2. **Configuration**
- Run the main script to generate `ai_config.json`:
  ```bash
  python main_research.py
  ```
- Edit `ai_config.json` to add your API keys for each AI provider.

### 3. **Running Research**
- **Single Contact:**
  ```python
  from main_research import YardiLeadResearcher
  import asyncio
  researcher = YardiLeadResearcher()
  asyncio.run(researcher.research_single_contact('First', 'Last', 'Company'))
  ```
- **Batch Processing:**
  ```python
  asyncio.run(researcher.batch_process_csv('contacts.csv', max_contacts=20))
  ```
- **Priority Targets:**
  ```python
  asyncio.run(researcher.research_priority_targets())
  ```

### 4. **Exporting Results**
- Results can be exported to CSV for further use or CRM import.

---

## Data Flow & Relationships

- **CSV Import Order:**
  1. `companies.csv` (master table)
  2. `contacts.csv` (references companies)
  3. `research_activities.csv` (references companies and contacts)
  4. `outreach_campaigns.csv` (standalone)
  5. `outreach_activities.csv` (references campaigns and contacts)
  6. `opportunities.csv` (references companies and contacts)
  7. `business_intelligence.csv` (references companies)

- **Database Schema:**
  - See `database_schema.md` for full details on tables and relationships.

---

## Extensibility & Customization

- **Add New AI Models:**
  - Implement a new model class in `ai_research_system.py` and register it in the config.
- **Custom Research Logic:**
  - Extend orchestrator or researcher classes for new research or export workflows.
- **CRM Integration:**
  - Export results for import into Salesforce, HubSpot, or other CRMs.
- **Advanced Analytics:**
  - Use the database and exported CSVs for further business intelligence and reporting.

---

## Support & Troubleshooting

- Check logs in `ai_research.log` for errors.
- Review API documentation for each AI provider.
- See `SETUP_GUIDE.md` for troubleshooting tips and advanced configuration.

---

## Summary

The Yardi AI Research System transforms manual lead research into an automated, AI-driven process, providing higher accuracy, faster results, and actionable business intelligence for Yardi consulting and business development. All major components, data flows, and extensibility points are documented for easy onboarding and future growth. 