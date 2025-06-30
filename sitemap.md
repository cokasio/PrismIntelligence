# Prism Intelligence Platform - Site Map

## 🌐 Web Application
- **Home/Landing Page** - `http://localhost:3000`
  - Hero Section
  - Features Section
  - Testimonials Section
  - CTA Section
  - Navigation
  - Footer

- **ROI Calculator** - `http://localhost:3000/pricing`
  - Interactive ROI tool for property management cost savings

## 🧠 Dashboard (Authenticated Area)
- **Analytics Dashboard**
  - Email Processing Status
  - Recent Reports
  - Key Metrics
  - Insights Overview
  
- **Reports & Documents**
  - Financial Reports
  - Operational Reports
  - Maintenance Reports
  - Lease Reports
  
- **Property Management**
  - Property Listings
  - Tenant Information
  - Financial Performance
  
- **AI Insights**
  - Generated Insights
  - Action Items
  - Recommendations
  - Opportunity Analysis

## 🧪 Processing Engine
- **Attachment Intelligence Loop**
  - File Monitoring System
  - Real-time Processing
  - AI Analysis (Gemini + Claude)
  - Document Classification
  - Data Extraction
  - Insight Generation

## 📥 Input Methods
- **File Drop**
  - Drop CSV files in `/incoming` folder
  - Upload via dashboard
  
- **Email Integration**
  - CloudMailin Email Processing
  - Email-based Report Submission

## ⚙️ System Architecture
- **Frontend**: Next.js 15 + TypeScript + shadcn/ui + TailwindCSS
- **Backend**: Node.js with AI Processing Engine
- **Database**: Supabase Connected
- **AI Models**: Gemini + Claude
- **File Parsing**: Support for CSV, Excel, PDF formats

## 🔄 Workflow
1. User uploads or emails property management reports
2. System classifies and processes documents
3. AI extracts key data and generates insights
4. Results displayed in dashboard with action items
5. User can view ROI calculator to see potential savings

## 👥 User Roles
- **Property Managers**: Primary users viewing insights and reports
- **Owners/Executives**: ROI and high-level metrics
- **Analysts**: Detailed financial data and performance metrics
- **Maintenance Staff**: Action items related to maintenance