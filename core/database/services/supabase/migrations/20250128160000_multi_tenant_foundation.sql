-- Multi-Tenant Foundation Migration - REVISED
-- Generated: 2025-01-28
-- Description: Establishes proper multi-tenant structure with investors → assets → emails/attachments hierarchy

-- 1. INVESTORS (Top Level - Property Owners/Investment Firms/REITs)
CREATE TABLE investors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    name TEXT NOT NULL,
    legal_name TEXT, -- Full legal entity name
    entity_type TEXT NOT NULL DEFAULT 'individual', -- individual, llc, corporation, reit, fund
    
    -- Contact Information
    primary_email TEXT UNIQUE NOT NULL,
    primary_phone TEXT,
    website TEXT,
    tax_id TEXT, -- EIN or SSN (encrypted)
    
    -- Primary Contact Person
    contact_first_name TEXT,
    contact_last_name TEXT,
    contact_title TEXT,
    
    -- Address
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'USA',
    
    -- Settings & Preferences
    settings JSONB DEFAULT '{}',
    timezone TEXT DEFAULT 'America/New_York',
    currency TEXT DEFAULT 'USD',
    fiscal_year_end TEXT DEFAULT '12-31',
    
    -- Platform Access
    status TEXT DEFAULT 'active', -- active, suspended, inactive, churned
    onboarding_completed BOOLEAN DEFAULT false,
    onboarding_completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Subscription/Billing
    subscription_tier TEXT DEFAULT 'starter', -- starter, professional, enterprise
    subscription_status TEXT DEFAULT 'trial', -- trial, active, past_due, cancelled
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    mrr DECIMAL(10,2), -- Monthly recurring revenue
    
    -- Portfolio Summary (denormalized for performance)
    total_assets_count INTEGER DEFAULT 0,
    total_units_count INTEGER DEFAULT 0,
    total_square_footage INTEGER DEFAULT 0,
    portfolio_value DECIMAL(20,2),
    
    -- Metadata
    tags TEXT[] DEFAULT '{}', -- ['high-value', 'strategic', 'new']
    custom_fields JSONB DEFAULT '{}',
    source TEXT, -- How they found us: referral, marketing, direct
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PROPERTIES (Assets owned by Investors - renamed from generic "assets")
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
    
    -- Property Information
    name TEXT NOT NULL,
    property_code TEXT, -- Internal identifier like "SUNSET-001"
    property_type TEXT NOT NULL, -- residential, commercial, industrial, mixed_use, land
    sub_type TEXT, -- apartment, office, retail, warehouse, etc.
    
    -- Location
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT,
    country TEXT DEFAULT 'USA',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Physical Details
    square_footage INTEGER,
    units_count INTEGER,
    floors_count INTEGER,
    year_built INTEGER,
    lot_size DECIMAL(10,2), -- in acres
    
    -- Financial Information
    purchase_date DATE,
    purchase_price DECIMAL(20,2),
    current_value DECIMAL(20,2),
    monthly_revenue DECIMAL(20,2),
    monthly_expenses DECIMAL(20,2),
    
    -- Management Details
    management_company TEXT,
    management_company_email TEXT,
    property_manager_name TEXT,
    property_manager_email TEXT,
    property_manager_phone TEXT,
    
    -- Operational Settings
    reporting_frequency TEXT DEFAULT 'monthly', -- monthly, quarterly, annual
    report_due_day INTEGER DEFAULT 5, -- Day of month/quarter reports are due
    
    -- Email Configuration (unique email per property)
    cloudmailin_address TEXT UNIQUE, -- e.g., sunset-tower@reports.cloudmailin.net
    auto_process_emails BOOLEAN DEFAULT true,
    
    -- Status
    status TEXT DEFAULT 'active', -- active, under_contract, sold, inactive
    acquired_date DATE,
    disposed_date DATE,
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    notes TEXT,
    
    -- For AI/ML features
    embedding VECTOR(1536),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique property names per investor
    UNIQUE(investor_id, name),
    INDEX idx_properties_investor_status (investor_id, status)
);

-- 3. USERS (People who can access investor accounts)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User Information
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    
    -- Authentication (integrate with Supabase Auth)
    auth_id UUID, -- Supabase auth.users.id
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    
    -- Global Platform Role (for our internal use)
    platform_role TEXT DEFAULT 'user', -- superadmin, support, user
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. USER_INVESTOR_ACCESS (Many-to-many: which users can access which investors)
CREATE TABLE user_investor_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
    
    -- Role within this investor account
    role TEXT NOT NULL DEFAULT 'viewer', -- owner, admin, manager, analyst, viewer
    
    -- Granular Permissions
    permissions JSONB DEFAULT '{}', -- {"view_reports": true, "edit_properties": false}
    
    -- Property-level access (NULL = all properties)
    property_access UUID[], -- Array of property IDs, NULL = access all
    
    -- Invitation tracking
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, investor_id)
);

-- 5. Keep the existing financial tables but update foreign keys
-- Update report_ingestions table
ALTER TABLE report_ingestions RENAME COLUMN company_id TO investor_id;
ALTER TABLE report_ingestions 
    ADD COLUMN property_id UUID REFERENCES properties(id) ON DELETE CASCADE;

-- Update other tables similarly...
-- (We'll create a separate migration for updating all financial pipeline tables)

-- 6. PROPERTY_CONTACTS (Additional contacts for each property)
CREATE TABLE property_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
    
    -- Contact Information
    contact_type TEXT NOT NULL, -- accountant, maintenance, leasing, other
    company_name TEXT,
    contact_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    
    -- Preferences
    receives_reports BOOLEAN DEFAULT false,
    report_types TEXT[] DEFAULT '{}', -- ['financial', 'operational', 'maintenance']
    
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_investors_status ON investors(status);
CREATE INDEX idx_investors_subscription ON investors(subscription_status);
CREATE INDEX idx_properties_investor_id ON properties(investor_id);
CREATE INDEX idx_properties_cloudmailin ON properties(cloudmailin_address);
CREATE INDEX idx_user_investor_access_user ON user_investor_access(user_id);
CREATE INDEX idx_user_investor_access_investor ON user_investor_access(investor_id);
CREATE INDEX idx_property_contacts_property ON property_contacts(property_id);

-- Enable RLS
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_investor_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_contacts ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (customize based on your auth system)
-- Users can only see investors they have access to
CREATE POLICY "Users can view investors they have access to" ON investors
    FOR SELECT USING (
        id IN (
            SELECT investor_id 
            FROM user_investor_access 
            WHERE user_id = auth.uid()
        )
    );

-- Users can only see properties of investors they have access to
CREATE POLICY "Users can view properties they have access to" ON properties
    FOR SELECT USING (
        investor_id IN (
            SELECT investor_id 
            FROM user_investor_access 
            WHERE user_id = auth.uid()
                AND (property_access IS NULL OR id = ANY(property_access))
        )
    );

-- Add updated_at triggers
CREATE TRIGGER update_investors_updated_at BEFORE UPDATE ON investors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();