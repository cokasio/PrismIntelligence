// Updated types for multi-tenant structure
export interface Investor {
  id: string;
  name: string;
  legal_name?: string;
  entity_type: 'individual' | 'llc' | 'corporation' | 'reit' | 'fund';
  primary_email: string;
  status: 'active' | 'suspended' | 'inactive' | 'churned';
  subscription_tier: 'starter' | 'professional' | 'enterprise';
  total_assets_count: number;
  portfolio_value?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Property {
  id: string;
  investor_id: string;
  name: string;
  property_code?: string;
  property_type: 'residential' | 'commercial' | 'industrial' | 'mixed_use' | 'land';
  address_line1: string;
  city: string;
  state: string;
  cloudmailin_address?: string;
  status: 'active' | 'under_contract' | 'sold' | 'inactive';
  monthly_revenue?: number;
  monthly_expenses?: number;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  platform_role: 'superadmin' | 'support' | 'user';
  is_active: boolean;
  created_at: Date;
}

export interface UserInvestorAccess {
  id: string;
  user_id: string;
  investor_id: string;
  role: 'owner' | 'admin' | 'manager' | 'analyst' | 'viewer';
  permissions: Record<string, boolean>;
  property_access: string[] | null; // null = all properties
  created_at: Date;
}

export interface EmailMessage {
  id: string;
  investor_id: string;
  property_id?: string;
  cloudmailin_id?: string;
  to_address: string;
  from_address: string;
  from_name?: string;
  subject?: string;
  plain_body?: string;
  html_body?: string;
  attachment_count: number;
  has_financial_attachments: boolean;
  status: 'received' | 'processing' | 'processed' | 'failed';
  received_at: Date;
  created_at: Date;
}

export interface EmailAttachment {
  id: string;
  email_message_id: string;
  investor_id: string;
  property_id?: string;
  filename: string;
  content_type?: string;
  file_size?: number;
  file_hash?: string;
  storage_path?: string;
  attachment_type?: 'financial_report' | 'image' | 'document' | 'other';
  report_type?: string;
  is_processed: boolean;
  created_at: Date;
}

// CloudMailin webhook payload types
export interface CloudMailinEnvelope {
  to: string;
  from: string;
  helo_domain?: string;
  remote_ip?: string;
  spf?: {
    result: string;
    domain: string;
  };
}

export interface CloudMailinHeaders {
  subject?: string;
  from?: string;
  to?: string;
  date?: string;
  message_id?: string;
  [key: string]: string | undefined;
}

export interface CloudMailinAttachment {
  filename: string;
  content_type: string;
  size: number;
  disposition: 'attachment' | 'inline';
  content_id?: string;
  content?: string; // Base64 encoded
  url?: string; // If using URL-based attachments
}

export interface CloudMailinPayload {
  envelope: CloudMailinEnvelope;
  headers: CloudMailinHeaders;
  plain?: string;
  html?: string;
  reply_plain?: string;
  attachments?: CloudMailinAttachment[];
  spam_score?: number;
  spam_status?: string;
}

// Permission types
export interface InvestorPermissions {
  view_reports: boolean;
  upload_reports: boolean;
  download_reports: boolean;
  edit_properties: boolean;
  manage_users: boolean;
  view_analytics: boolean;
  export_data: boolean;
  manage_billing: boolean;
  delete_data: boolean;
}

// Context for processing
export interface ProcessingContext {
  investor_id: string;
  property_id?: string;
  email_id: string;
  user_id?: string;
  source: 'email' | 'upload' | 'api';
  metadata?: Record<string, any>;
}

// Helper type guards
export function isFinancialReport(attachment: CloudMailinAttachment): boolean {
  const financialExtensions = ['.xlsx', '.xls', '.csv', '.pdf'];
  const filename = attachment.filename.toLowerCase();
  
  return financialExtensions.some(ext => filename.endsWith(ext)) &&
    (filename.includes('financial') || 
     filename.includes('income') ||
     filename.includes('balance') ||
     filename.includes('report') ||
     filename.includes('statement'));
}

// Role-based permission defaults
export const DEFAULT_PERMISSIONS: Record<string, Partial<InvestorPermissions>> = {
  owner: {
    view_reports: true,
    upload_reports: true,
    download_reports: true,
    edit_properties: true,
    manage_users: true,
    view_analytics: true,
    export_data: true,
    manage_billing: true,
    delete_data: true
  },
  admin: {
    view_reports: true,
    upload_reports: true,
    download_reports: true,
    edit_properties: true,
    manage_users: true,
    view_analytics: true,
    export_data: true,
    manage_billing: false,
    delete_data: false
  },
  manager: {
    view_reports: true,
    upload_reports: true,
    download_reports: true,
    edit_properties: false,
    manage_users: false,
    view_analytics: true,
    export_data: true,
    manage_billing: false,
    delete_data: false
  },
  analyst: {
    view_reports: true,
    upload_reports: false,
    download_reports: true,
    edit_properties: false,
    manage_users: false,
    view_analytics: true,
    export_data: true,
    manage_billing: false,
    delete_data: false
  },
  viewer: {
    view_reports: true,
    upload_reports: false,
    download_reports: false,
    edit_properties: false,
    manage_users: false,
    view_analytics: false,
    export_data: false,
    manage_billing: false,
    delete_data: false
  }
};