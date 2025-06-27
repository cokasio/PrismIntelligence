# Yardi Consulting Lead Database Schema

## Database Design for Lead Management & Research System

### Core Tables

#### 1. COMPANIES Table
```sql
CREATE TABLE companies (
    company_id INT PRIMARY KEY AUTO_INCREMENT,
    company_name VARCHAR(255) NOT NULL,
    industry_type ENUM('Property Management', 'Real Estate Development', 'Housing Authority', 'REIT', 'Senior Living', 'Student Housing', 'Other') DEFAULT 'Other',
    company_size ENUM('Small (1-50)', 'Medium (51-200)', 'Large (201-1000)', 'Enterprise (1000+)') DEFAULT 'Small (1-50)',
    headquarters_city VARCHAR(100),
    headquarters_state VARCHAR(50),
    headquarters_country VARCHAR(50) DEFAULT 'USA',
    website_url VARCHAR(255),
    linkedin_company_url VARCHAR(255),
    annual_revenue DECIMAL(15,2),
    employee_count INT,
    yardi_client_status ENUM('Current Client', 'Former Client', 'Prospect', 'Unknown') DEFAULT 'Unknown',
    business_description TEXT,
    pain_points TEXT,
    yardi_modules_used TEXT,
    decision_making_process TEXT,
    budget_range ENUM('Under $50K', '$50K-$100K', '$100K-$250K', '$250K-$500K', '$500K+', 'Unknown') DEFAULT 'Unknown',
    fiscal_year_end DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    research_status ENUM('Not Started', 'In Progress', 'Completed', 'Needs Update') DEFAULT 'Not Started',
    research_notes TEXT,
    
    INDEX idx_company_name (company_name),
    INDEX idx_industry (industry_type),
    INDEX idx_size (company_size),
    INDEX idx_yardi_status (yardi_client_status)
);
```

#### 2. CONTACTS Table
```sql
CREATE TABLE contacts (
    contact_id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    job_title VARCHAR(150),
    department VARCHAR(100),
    seniority_level ENUM('C-Level', 'VP/SVP', 'Director', 'Manager', 'Analyst', 'Coordinator', 'Other') DEFAULT 'Other',
    decision_maker_level ENUM('Primary', 'Secondary', 'Influencer', 'User', 'Unknown') DEFAULT 'Unknown',
    email_address VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_number VARCHAR(20),
    phone_verified BOOLEAN DEFAULT FALSE,
    linkedin_profile_url VARCHAR(255),
    office_location VARCHAR(100),
    reports_to_contact_id INT,
    years_at_company INT,
    years_in_role INT,
    education_background TEXT,
    previous_companies TEXT,
    yardi_experience_level ENUM('Expert', 'Advanced', 'Intermediate', 'Beginner', 'None', 'Unknown') DEFAULT 'Unknown',
    consulting_budget_authority BOOLEAN DEFAULT FALSE,
    preferred_contact_method ENUM('Email', 'Phone', 'LinkedIn', 'Unknown') DEFAULT 'Unknown',
    contact_status ENUM('Active', 'Inactive', 'Do Not Contact', 'Bounced') DEFAULT 'Active',
    last_contact_date DATE,
    next_follow_up_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE,
    FOREIGN KEY (reports_to_contact_id) REFERENCES contacts(contact_id) ON DELETE SET NULL,
    INDEX idx_name (first_name, last_name),
    INDEX idx_title (job_title),
    INDEX idx_seniority (seniority_level),
    INDEX idx_decision_maker (decision_maker_level),
    INDEX idx_email (email_address),
    INDEX idx_company_contact (company_id, seniority_level)
);
```

#### 3. RESEARCH_ACTIVITIES Table
```sql
CREATE TABLE research_activities (
    activity_id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT,
    contact_id INT,
    activity_type ENUM('Web Research', 'LinkedIn Search', 'Email Verification', 'Phone Research', 'News Research', 'Financial Research') NOT NULL,
    activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    researcher_name VARCHAR(100),
    data_source VARCHAR(255),
    findings TEXT,
    confidence_level ENUM('High', 'Medium', 'Low') DEFAULT 'Medium',
    verification_status ENUM('Verified', 'Unverified', 'Conflicting') DEFAULT 'Unverified',
    follow_up_needed BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE,
    FOREIGN KEY (contact_id) REFERENCES contacts(contact_id) ON DELETE CASCADE,
    INDEX idx_activity_type (activity_type),
    INDEX idx_date (activity_date),
    INDEX idx_company_research (company_id, activity_date)
);
```

#### 4. OUTREACH_CAMPAIGNS Table
```sql
CREATE TABLE outreach_campaigns (
    campaign_id INT PRIMARY KEY AUTO_INCREMENT,
    campaign_name VARCHAR(255) NOT NULL,
    campaign_type ENUM('Email', 'LinkedIn', 'Phone', 'Direct Mail', 'Event') NOT NULL,
    target_audience TEXT,
    message_template TEXT,
    start_date DATE,
    end_date DATE,
    campaign_status ENUM('Planning', 'Active', 'Paused', 'Completed') DEFAULT 'Planning',
    success_metrics TEXT,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_campaign_type (campaign_type),
    INDEX idx_status (campaign_status),
    INDEX idx_dates (start_date, end_date)
);
```

#### 5. OUTREACH_ACTIVITIES Table
```sql
CREATE TABLE outreach_activities (
    outreach_id INT PRIMARY KEY AUTO_INCREMENT,
    campaign_id INT,
    contact_id INT NOT NULL,
    outreach_type ENUM('Email', 'LinkedIn Message', 'Phone Call', 'Meeting', 'Event Contact') NOT NULL,
    outreach_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subject_line VARCHAR(255),
    message_content TEXT,
    response_received BOOLEAN DEFAULT FALSE,
    response_date TIMESTAMP NULL,
    response_content TEXT,
    response_sentiment ENUM('Positive', 'Neutral', 'Negative', 'No Response') DEFAULT 'No Response',
    meeting_scheduled BOOLEAN DEFAULT FALSE,
    meeting_date TIMESTAMP NULL,
    outcome ENUM('Qualified Lead', 'Not Interested', 'Future Opportunity', 'Referral', 'No Response', 'Bounced') DEFAULT 'No Response',
    follow_up_scheduled BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    notes TEXT,
    
    FOREIGN KEY (campaign_id) REFERENCES outreach_campaigns(campaign_id) ON DELETE SET NULL,
    FOREIGN KEY (contact_id) REFERENCES contacts(contact_id) ON DELETE CASCADE,
    INDEX idx_contact_outreach (contact_id, outreach_date),
    INDEX idx_campaign_outreach (campaign_id, outreach_date),
    INDEX idx_outcome (outcome)
);
```

#### 6. OPPORTUNITIES Table
```sql
CREATE TABLE opportunities (
    opportunity_id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    primary_contact_id INT,
    opportunity_name VARCHAR(255) NOT NULL,
    opportunity_type ENUM('Implementation', 'Optimization', 'Training', 'Support', 'Migration', 'Integration') NOT NULL,
    estimated_value DECIMAL(10,2),
    probability_percent INT DEFAULT 0,
    stage ENUM('Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost') DEFAULT 'Prospecting',
    expected_close_date DATE,
    actual_close_date DATE,
    project_scope TEXT,
    competition TEXT,
    decision_criteria TEXT,
    next_steps TEXT,
    lost_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE,
    FOREIGN KEY (primary_contact_id) REFERENCES contacts(contact_id) ON DELETE SET NULL,
    INDEX idx_stage (stage),
    INDEX idx_value (estimated_value),
    INDEX idx_close_date (expected_close_date)
);
```

#### 7. BUSINESS_INTELLIGENCE Table
```sql
CREATE TABLE business_intelligence (
    bi_id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    intelligence_type ENUM('Financial', 'Strategic', 'Operational', 'Technology', 'Competitive', 'Market') NOT NULL,
    intelligence_date DATE NOT NULL,
    source VARCHAR(255),
    headline VARCHAR(500),
    content TEXT,
    impact_level ENUM('High', 'Medium', 'Low') DEFAULT 'Medium',
    relevance_to_yardi ENUM('High', 'Medium', 'Low') DEFAULT 'Medium',
    action_required BOOLEAN DEFAULT FALSE,
    action_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE,
    INDEX idx_company_intel (company_id, intelligence_date),
    INDEX idx_type (intelligence_type),
    INDEX idx_impact (impact_level)
);
```

### Views for Common Queries

#### Decision Maker View
```sql
CREATE VIEW decision_makers AS
SELECT 
    c.contact_id,
    c.first_name,
    c.last_name,
    c.job_title,
    c.email_address,
    c.phone_number,
    c.linkedin_profile_url,
    c.seniority_level,
    c.decision_maker_level,
    comp.company_name,
    comp.industry_type,
    comp.company_size,
    comp.yardi_client_status
FROM contacts c
JOIN companies comp ON c.company_id = comp.company_id
WHERE c.seniority_level IN ('C-Level', 'VP/SVP', 'Director')
AND c.decision_maker_level IN ('Primary', 'Secondary')
AND c.contact_status = 'Active';
```

#### High Value Prospects View
```sql
CREATE VIEW high_value_prospects AS
SELECT 
    comp.company_id,
    comp.company_name,
    comp.industry_type,
    comp.company_size,
    comp.yardi_client_status,
    COUNT(c.contact_id) as decision_maker_count,
    MAX(c.seniority_level) as highest_seniority,
    comp.budget_range
FROM companies comp
LEFT JOIN contacts c ON comp.company_id = c.company_id 
    AND c.seniority_level IN ('C-Level', 'VP/SVP', 'Director')
    AND c.contact_status = 'Active'
WHERE comp.company_size IN ('Large (201-1000)', 'Enterprise (1000+)')
AND comp.yardi_client_status IN ('Current Client', 'Prospect')
GROUP BY comp.company_id
HAVING decision_maker_count > 0;
```

### Data Import Strategy

#### Initial Data Population
```sql
-- Import your existing data
INSERT INTO companies (company_name, research_status)
SELECT DISTINCT company_name, 'Not Started'
FROM extracted_companies_temp;

INSERT INTO contacts (company_id, first_name, last_name, seniority_level, decision_maker_level)
SELECT 
    c.company_id,
    e.first_name,
    e.last_name,
    'Other',
    'Unknown'
FROM extracted_companies_temp e
JOIN companies c ON e.company_name = c.company_name;
```

This schema provides:
1. **Complete contact management** with decision-maker identification
2. **Research tracking** to avoid duplicate work
3. **Outreach campaign management** with response tracking
4. **Business intelligence** storage for strategic insights
5. **Opportunity pipeline** management
6. **Scalable structure** for growing your database

Would you like me to create the actual database files and import your data?

