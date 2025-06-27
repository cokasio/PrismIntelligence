# CSV Files for Yardi Consulting Database Import

## Files Created

### Core Data Tables
1. **companies.csv** - Company information and classification
2. **contacts.csv** - Individual contact details and decision-maker status
3. **research_activities.csv** - Research findings and verification status
4. **outreach_campaigns.csv** - Marketing campaign templates and strategies
5. **outreach_activities.csv** - Individual outreach attempts and responses
6. **opportunities.csv** - Sales pipeline and project opportunities
7. **business_intelligence.csv** - Market intelligence and company insights

### Priority Lists
8. **decision_makers_priority.csv** - High-priority targets ready for immediate outreach

## Data Import Order

### Recommended Import Sequence:
1. **companies.csv** (master table - import first)
2. **contacts.csv** (references companies)
3. **research_activities.csv** (references companies and contacts)
4. **outreach_campaigns.csv** (standalone)
5. **outreach_activities.csv** (references campaigns and contacts)
6. **opportunities.csv** (references companies and contacts)
7. **business_intelligence.csv** (references companies)

## Key Relationships

### Primary Keys:
- **companies.csv**: company_id
- **contacts.csv**: contact_id
- **research_activities.csv**: activity_id
- **outreach_campaigns.csv**: campaign_id
- **outreach_activities.csv**: outreach_id
- **opportunities.csv**: opportunity_id
- **business_intelligence.csv**: bi_id

### Foreign Key Relationships:
- **contacts.company_id** → **companies.company_id**
- **research_activities.company_id** → **companies.company_id**
- **research_activities.contact_id** → **contacts.contact_id**
- **outreach_activities.campaign_id** → **outreach_campaigns.campaign_id**
- **outreach_activities.contact_id** → **contacts.contact_id**
- **opportunities.company_id** → **companies.company_id**
- **opportunities.primary_contact_id** → **contacts.contact_id**
- **business_intelligence.company_id** → **companies.company_id**

## Data Quality Notes

### Verified Data:
- Company names and industry classifications
- Contact names from original source
- LinkedIn profile patterns (estimated)
- Email address patterns (estimated - need verification)

### Requires Verification:
- Email addresses (use Hunter.io, Apollo.io, etc.)
- Phone numbers (most are missing or partial)
- Job titles (many are estimated)
- Current employment status

### High-Priority Targets:
- **Robert Goldman** (Z Modular) - Highest confidence, real estate focus
- **Erica Gunnison** (Zekelman) - Asset management role
- **Manoah Williams** (Z Modular) - Analytics focus
- **Dan Woodhead** (Yardi) - Partnership opportunity

## Database Schema Compatibility

### MySQL Import Example:
```sql
-- Create database
CREATE DATABASE yardi_consulting;
USE yardi_consulting;

-- Import companies first
LOAD DATA INFILE 'companies.csv' 
INTO TABLE companies 
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"' 
LINES TERMINATED BY '\n' 
IGNORE 1 ROWS;

-- Then import contacts
LOAD DATA INFILE 'contacts.csv' 
INTO TABLE contacts 
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"' 
LINES TERMINATED BY '\n' 
IGNORE 1 ROWS;
```

### PostgreSQL Import Example:
```sql
-- Create database
CREATE DATABASE yardi_consulting;

-- Import companies
COPY companies FROM 'companies.csv' DELIMITER ',' CSV HEADER;

-- Import contacts
COPY contacts FROM 'contacts.csv' DELIMITER ',' CSV HEADER;
```

### SQLite Import Example:
```sql
-- Create database and import
.mode csv
.import companies.csv companies
.import contacts.csv contacts
```

## Immediate Action Items

### Week 1: Data Verification
1. **Verify email addresses** for 4 high-priority targets
2. **Research phone numbers** using professional tools
3. **Confirm current job titles** via LinkedIn
4. **Update contact status** based on verification results

### Week 2: System Setup
1. **Import CSV files** into your server database
2. **Set up automated backups** for the database
3. **Create user access controls** for team members
4. **Test data relationships** and integrity

### Week 3: Begin Outreach
1. **Start with verified contacts** from decision_makers_priority.csv
2. **Track responses** in outreach_activities table
3. **Update opportunity status** based on initial conversations
4. **Gather additional business intelligence** from conversations

## Data Pipeline Considerations

### For Future Automation:
- **API integrations** with LinkedIn, Hunter.io, ZoomInfo
- **Automated email verification** before outreach
- **CRM synchronization** for real-time updates
- **Business intelligence monitoring** for target companies
- **Response tracking** and follow-up automation

### Recommended Tools:
- **Email Verification**: Hunter.io, ZeroBounce, NeverBounce
- **Contact Research**: Apollo.io, ZoomInfo, LinkedIn Sales Navigator
- **CRM Integration**: Salesforce, HubSpot, Pipedrive
- **Email Automation**: Outreach.io, SalesLoft, Mailchimp

This structured approach gives you clean, importable data while maintaining the flexibility to enhance and automate the system over time.

