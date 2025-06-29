/**
 * Database Connection Service
 * This module establishes and manages our connection to Supabase
 * Think of it as the bridge between your application and your data
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import config from '../config';
import { dbLogger } from '../utils/logger';

/**
 * Define the types for our database tables
 * This gives us type safety when working with data
 */
export interface Organization {
  id: string;
  name: string;
  email_domain?: string;
  settings?: Record<string, any>;
  subscription_tier: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  organization_id: string;
  email: string;
  full_name?: string;
  role: string;
  preferences?: Record<string, any>;
  last_login?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  organization_id: string;
  external_id?: string;
  name: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  property_type?: string;
  total_units?: number;
  total_square_feet?: number;
  metadata?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  organization_id: string;
  property_id?: string;
  uploaded_by?: string;
  filename: string;
  file_type: string;
  file_size_bytes: number;
  file_url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  report_type?: 'financial' | 'operational' | 'rent_roll' | 'maintenance' | 'other';
  report_period_start?: string;
  report_period_end?: string;
  processing_started_at?: string;
  processing_completed_at?: string;
  processing_duration_ms?: number;
  error_message?: string;
  sender_email?: string;
  email_subject?: string;
  confirmation_sent: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Create the Supabase client with the service key
 * The service key gives us admin access to bypass Row Level Security when needed
 */
const supabaseAdmin = createClient(
  config.database.supabaseUrl,
  config.database.supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Create a public Supabase client for user-facing operations
 * This respects Row Level Security policies
 */
const supabasePublic = createClient(
  config.database.supabaseUrl,
  config.database.supabaseAnonKey
);

/**
 * Database service class that wraps common operations
 * This provides a clean interface for the rest of your application
 */
class DatabaseService {
  private admin: SupabaseClient;
  private public: SupabaseClient;

  constructor() {
    this.admin = supabaseAdmin;
    this.public = supabasePublic;
    
    // Test the connection on startup
    this.testConnection();
  }

  /**
   * Test the database connection and log the result
   * This helps catch configuration issues early
   */
  private async testConnection(): Promise<void> {
    try {
      const { data, error } = await this.admin
        .from('organizations')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      
      dbLogger.info('✅ Database connection established successfully');
    } catch (error) {
      dbLogger.error('❌ Failed to connect to database:', error);
      // Don't exit - the app might still work for some operations
    }
  }

  /**
   * Get a specific client based on permission needs
   * Use 'admin' sparingly - only when you need to bypass RLS
   */
  getClient(type: 'admin' | 'public' = 'public'): SupabaseClient {
    return type === 'admin' ? this.admin : this.public;
  }

  /**
   * Create a new organization
   * This is typically done during onboarding
   */
  async createOrganization(data: Partial<Organization>): Promise<Organization | null> {
    try {
      const { data: org, error } = await this.admin
        .from('organizations')
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      dbLogger.info('Created new organization', { 
        orgId: org.id, 
        name: org.name 
      });
      
      return org;
    } catch (error) {
      dbLogger.error('Failed to create organization', { error, data });
      return null;
    }
  }

  /**
   * Create a new report record
   * This happens when an email with an attachment is received
   */
  async createReport(data: Partial<Report>): Promise<Report | null> {
    try {
      const { data: report, error } = await this.admin
        .from('reports')
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      dbLogger.info('Created new report record', {
        reportId: report.id,
        filename: report.filename,
        status: report.status,
      });

      return report;
    } catch (error) {
      dbLogger.error('Failed to create report', { error, data });
      return null;
    }
  }

  /**
   * Update report status
   * This is called frequently as reports move through the processing pipeline
   */
  async updateReportStatus(
    reportId: string, 
    status: Report['status'], 
    additionalData?: Partial<Report>
  ): Promise<boolean> {
    try {
      const updateData = {
        status,
        ...additionalData,
      };

      // Add processing timestamps based on status
      if (status === 'processing' && !additionalData?.processing_started_at) {
        updateData.processing_started_at = new Date().toISOString();
      } else if (status === 'completed' || status === 'failed') {
        updateData.processing_completed_at = new Date().toISOString();
      }

      const { error } = await this.admin
        .from('reports')
        .update(updateData)
        .eq('id', reportId);

      if (error) throw error;

      dbLogger.info('Updated report status', { reportId, status });
      return true;
    } catch (error) {
      dbLogger.error('Failed to update report status', { 
        error, 
        reportId, 
        status 
      });
      return false;
    }
  }

  /**
   * Store an insight from AI analysis
   * Each insight represents a valuable finding from a report
   */
  async createInsight(data: any): Promise<any> {
    try {
      const { data: insight, error } = await this.admin
        .from('insights')
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      dbLogger.debug('Created new insight', {
        insightId: insight.id,
        category: insight.category,
        priority: insight.priority,
      });

      return insight;
    } catch (error) {
      dbLogger.error('Failed to create insight', { error });
      return null;
    }
  }

  /**
   * Batch insert multiple insights at once
   * More efficient than inserting one at a time
   */
  async createInsights(insights: any[]): Promise<any[]> {
    try {
      const { data, error } = await this.admin
        .from('insights')
        .insert(insights)
        .select();

      if (error) throw error;

      dbLogger.info(`Created ${data.length} insights`);
      return data;
    } catch (error) {
      dbLogger.error('Failed to create insights', { error });
      return [];
    }
  }

  /**
   * Get recent reports for an organization
   * Useful for dashboards and status checks
   */
  async getRecentReports(
    organizationId: string, 
    limit: number = 10
  ): Promise<Report[]> {
    try {
      const { data, error } = await this.admin
        .from('reports')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      dbLogger.error('Failed to fetch recent reports', { 
        error, 
        organizationId 
      });
      return [];
    }
  }
}

// Create and export a singleton instance
export const db = new DatabaseService();

// Also export the clients directly for advanced usage
export { supabaseAdmin, supabasePublic };

/**
 * Example usage:
 * 
 * import { db } from './services/database';
 * 
 * // Create a new report
 * const report = await db.createReport({
 *   organization_id: 'org-123',
 *   filename: 'monthly-report.pdf',
 *   file_type: 'pdf',
 *   file_size_bytes: 1024000,
 *   file_url: 'https://...',
 *   status: 'pending'
 * });
 * 
 * // Update status when processing starts
 * await db.updateReportStatus(report.id, 'processing');
 */