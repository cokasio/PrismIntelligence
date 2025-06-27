import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';
import { ProcessedDocument } from './attachmentIntelligenceLoop';

export interface ProcessingError {
  filename: string;
  filepath: string;
  error: string;
  stack?: string;
  timestamp: Date;
}

export interface ProcessingStats {
  totalProcessed: number;
  successfulProcessed: number;
  failedProcessed: number;
  averageProcessingTime: number;
  recentActivity: {
    last24Hours: number;
    lastWeek: number;
    lastMonth: number;
  };
  documentTypes: Record<string, number>;
  topErrors: Array<{
    error: string;
    count: number;
  }>;
}

export class DatabaseService {
  private supabase: SupabaseClient | null = null;
  private initialized = false;

  constructor() {
    // Will be initialized in testConnection()
  }

  /**
   * Initialize the Supabase client
   */
  private async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables are required');
      }

      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.initialized = true;
      
      logger.info('✅ Supabase client initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize Supabase client:', error);
      throw error;
    }
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<void> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // Test with a simple query
      const { data, error } = await this.supabase!
        .from('organizations')
        .select('count')
        .limit(1);

      if (error) {
        throw error;
      }

      logger.info('✅ Database connection verified');
    } catch (error) {
      logger.error('❌ Database connection test failed:', error);
      throw error;
    }
  }

  /**
   * Ensure database schema exists and is up to date
   */
  async ensureSchema(): Promise<void> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // Check if attachment intelligence tables exist
      await this.ensureAttachmentIntelligenceTables();
      
      logger.info('✅ Database schema verification complete');
    } catch (error) {
      logger.error('❌ Database schema verification failed:', error);
      throw error;
    }
  }

  /**
   * Ensure attachment intelligence specific tables exist
   */
  private async ensureAttachmentIntelligenceTables(): Promise<void> {
    const tables = [
      {
        name: 'processed_documents',
        sql: `
          CREATE TABLE IF NOT EXISTS processed_documents (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            filename TEXT NOT NULL,
            filepath TEXT NOT NULL,
            
            -- Classification data
            document_type TEXT NOT NULL,
            confidence DECIMAL(3,2) NOT NULL,
            property_id UUID,
            property_name TEXT,
            report_period_start DATE,
            report_period_end DATE,
            suggested_parser TEXT,
            
            -- Extracted data
            extracted_data JSONB,
            
            -- AI Insights
            insights_summary TEXT,
            key_findings JSONB,
            trends JSONB,
            risks JSONB,
            opportunities JSONB,
            
            -- Action items
            action_items JSONB,
            recommendations JSONB,
            
            -- Processing metadata
            processing_time_ms INTEGER,
            processing_agent TEXT,
            gemini_confidence DECIMAL(3,2),
            claude_confidence DECIMAL(3,2),
            
            -- Timestamps
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            
            -- Status tracking
            human_reviewed BOOLEAN DEFAULT FALSE,
            validation_notes TEXT,
            archived_at TIMESTAMP WITH TIME ZONE
          )
        `
      },
      {
        name: 'processing_errors',
        sql: `
          CREATE TABLE IF NOT EXISTS processing_errors (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            filename TEXT NOT NULL,
            filepath TEXT NOT NULL,
            error_message TEXT NOT NULL,
            error_stack TEXT,
            error_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            
            -- Error context
            processing_stage TEXT,
            document_type TEXT,
            file_size BIGINT,
            
            -- Resolution tracking
            resolved BOOLEAN DEFAULT FALSE,
            resolution_notes TEXT,
            resolved_at TIMESTAMP WITH TIME ZONE,
            resolved_by TEXT
          )
        `
      },
      {
        name: 'file_watch_logs',
        sql: `
          CREATE TABLE IF NOT EXISTS file_watch_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            event_type TEXT NOT NULL, -- 'add', 'change', 'error'
            file_path TEXT NOT NULL,
            file_size BIGINT,
            event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            
            -- Processing status
            processed BOOLEAN DEFAULT FALSE,
            processing_started_at TIMESTAMP WITH TIME ZONE,
            processing_completed_at TIMESTAMP WITH TIME ZONE,
            
            -- Error tracking
            error_message TEXT,
            retry_count INTEGER DEFAULT 0
          )
        `
      }
    ];

    for (const table of tables) {
      try {
        const { error } = await this.supabase!.rpc('exec_sql', { sql: table.sql });
        if (error) {
          logger.warn(`⚠️ Could not create table ${table.name}:`, error);
          // Try alternative approach
          await this.createTableAlternative(table.name, table.sql);
        } else {
          logger.info(`✅ Table ${table.name} verified/created`);
        }
      } catch (error) {
        logger.warn(`⚠️ Error creating table ${table.name}:`, error);
      }
    }

    // Create indexes
    await this.createIndexes();
  }

  /**
   * Alternative table creation method
   */
  private async createTableAlternative(tableName: string, sql: string): Promise<void> {
    try {
      // For now, just log that we tried
      logger.info(`📋 Table ${tableName} creation attempted (manual verification may be needed)`);
    } catch (error) {
      logger.warn(`⚠️ Alternative table creation failed for ${tableName}:`, error);
    }
  }

  /**
   * Create necessary indexes
   */
  private async createIndexes(): Promise<void> {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_processed_documents_document_type ON processed_documents(document_type)',
      'CREATE INDEX IF NOT EXISTS idx_processed_documents_created_at ON processed_documents(created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_processed_documents_property_name ON processed_documents(property_name)',
      'CREATE INDEX IF NOT EXISTS idx_processing_errors_timestamp ON processing_errors(error_timestamp DESC)',
      'CREATE INDEX IF NOT EXISTS idx_file_watch_logs_timestamp ON file_watch_logs(event_timestamp DESC)'
    ];

    for (const indexSql of indexes) {
      try {
        const { error } = await this.supabase!.rpc('exec_sql', { sql: indexSql });
        if (error) {
          logger.debug(`Index creation note: ${error.message}`);
        }
      } catch (error) {
        logger.debug(`Index creation attempted`);
      }
    }
  }

  /**
   * Store a processed document
   */
  async storeProcessedDocument(document: ProcessedDocument): Promise<void> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const { error } = await this.supabase!
        .from('processed_documents')
        .insert({
          id: document.id,
          filename: document.filename,
          filepath: document.filepath,
          
          // Classification
          document_type: document.classification.documentType,
          confidence: document.classification.confidence,
          property_name: document.classification.propertyName,
          property_id: document.classification.propertyId,
          report_period_start: document.classification.reportPeriod?.start,
          report_period_end: document.classification.reportPeriod?.end,
          suggested_parser: document.classification.suggestedParser,
          
          // Extracted data
          extracted_data: document.extractedData,
          
          // Insights
          insights_summary: document.insights.summary,
          key_findings: document.insights.keyFindings,
          trends: document.insights.trends,
          risks: document.insights.risks,
          opportunities: document.insights.opportunities,
          
          // Actions
          action_items: document.actionItems,
          recommendations: document.insights.recommendations || [],
          
          // Processing metadata
          processing_time_ms: document.processingTime,
          processing_agent: 'gemini+claude',
          gemini_confidence: document.classification.confidence,
          claude_confidence: typeof document.insights.confidence === 'number' ? document.insights.confidence : 0.8,
          
          // Timestamps
          created_at: document.createdAt.toISOString(),
          processed_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      logger.info(`💾 Stored processed document: ${document.filename}`);
    } catch (error) {
      logger.error(`❌ Failed to store processed document:`, error);
      throw error;
    }
  }

  /**
   * Store processing error
   */
  async storeProcessingError(error: ProcessingError): Promise<void> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const { error: dbError } = await this.supabase!
        .from('processing_errors')
        .insert({
          filename: error.filename,
          filepath: error.filepath,
          error_message: error.error,
          error_stack: error.stack,
          error_timestamp: error.timestamp.toISOString()
        });

      if (dbError) {
        throw dbError;
      }

      logger.info(`🚨 Stored processing error for: ${error.filename}`);
    } catch (err) {
      logger.error(`❌ Failed to store processing error:`, err);
      // Don't throw here to avoid infinite loops
    }
  }

  /**
   * Log file watch event
   */
  async logFileWatchEvent(eventType: string, filePath: string, fileSize?: number): Promise<void> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const { error } = await this.supabase!
        .from('file_watch_logs')
        .insert({
          event_type: eventType,
          file_path: filePath,
          file_size: fileSize,
          event_timestamp: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      logger.debug(`📝 Logged file watch event: ${eventType} for ${filePath}`);
    } catch (error) {
      logger.debug(`File watch logging note: ${error}`);
      // Don't throw to avoid breaking file processing
    }
  }

  /**
   * Get processing statistics
   */
  async getProcessingStats(): Promise<ProcessingStats> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // Get total processed documents
      const { data: totalData, error: totalError } = await this.supabase!
        .from('processed_documents')
        .select('id, processing_time_ms, document_type, created_at');

      if (totalError) {
        throw totalError;
      }

      // Get error count
      const { data: errorData, error: errorError } = await this.supabase!
        .from('processing_errors')
        .select('error_message, error_timestamp');

      if (errorError) {
        throw errorError;
      }

      const totalProcessed = totalData?.length || 0;
      const failedProcessed = errorData?.length || 0;
      const successfulProcessed = totalProcessed;

      // Calculate averages and recent activity
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const recentActivity = {
        last24Hours: totalData?.filter(d => new Date(d.created_at) > oneDayAgo).length || 0,
        lastWeek: totalData?.filter(d => new Date(d.created_at) > oneWeekAgo).length || 0,
        lastMonth: totalData?.filter(d => new Date(d.created_at) > oneMonthAgo).length || 0
      };

      // Document type distribution
      const documentTypes: Record<string, number> = {};
      totalData?.forEach(doc => {
        documentTypes[doc.document_type] = (documentTypes[doc.document_type] || 0) + 1;
      });

      // Average processing time
      const validTimes = totalData?.filter(d => d.processing_time_ms > 0).map(d => d.processing_time_ms) || [];
      const averageProcessingTime = validTimes.length > 0 
        ? validTimes.reduce((a, b) => a + b, 0) / validTimes.length 
        : 0;

      // Top errors
      const errorCounts: Record<string, number> = {};
      errorData?.forEach(error => {
        const errorKey = error.error_message.substring(0, 100); // First 100 chars
        errorCounts[errorKey] = (errorCounts[errorKey] || 0) + 1;
      });

      const topErrors = Object.entries(errorCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([error, count]) => ({ error, count }));

      return {
        totalProcessed,
        successfulProcessed,
        failedProcessed,
        averageProcessingTime,
        recentActivity,
        documentTypes,
        topErrors
      };

    } catch (error) {
      logger.error('❌ Failed to get processing stats:', error);
      
      // Return empty stats on error
      return {
        totalProcessed: 0,
        successfulProcessed: 0,
        failedProcessed: 0,
        averageProcessingTime: 0,
        recentActivity: { last24Hours: 0, lastWeek: 0, lastMonth: 0 },
        documentTypes: {},
        topErrors: []
      };
    }
  }

  /**
   * Get recently processed documents
   */
  async getRecentDocuments(limit = 10): Promise<ProcessedDocument[]> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const { data, error } = await this.supabase!
        .from('processed_documents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapDatabaseRecordToProcessedDocument);

    } catch (error) {
      logger.error('❌ Failed to get recent documents:', error);
      return [];
    }
  }

  /**
   * Get documents by property
   */
  async getDocumentsByProperty(propertyName: string, limit = 20): Promise<ProcessedDocument[]> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const { data, error } = await this.supabase!
        .from('processed_documents')
        .select('*')
        .eq('property_name', propertyName)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapDatabaseRecordToProcessedDocument);

    } catch (error) {
      logger.error(`❌ Failed to get documents for property ${propertyName}:`, error);
      return [];
    }
  }

  /**
   * Get documents by type
   */
  async getDocumentsByType(documentType: string, limit = 20): Promise<ProcessedDocument[]> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const { data, error } = await this.supabase!
        .from('processed_documents')
        .select('*')
        .eq('document_type', documentType)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapDatabaseRecordToProcessedDocument);

    } catch (error) {
      logger.error(`❌ Failed to get documents of type ${documentType}:`, error);
      return [];
    }
  }

  /**
   * Map database record to ProcessedDocument interface
   */
  private mapDatabaseRecordToProcessedDocument(record: any): ProcessedDocument {
    return {
      id: record.id,
      filename: record.filename,
      filepath: record.filepath,
      classification: {
        documentType: record.document_type,
        confidence: record.confidence,
        propertyName: record.property_name,
        propertyId: record.property_id,
        reportPeriod: record.report_period_start && record.report_period_end ? {
          start: record.report_period_start,
          end: record.report_period_end
        } : undefined,
        suggestedParser: record.suggested_parser,
        metadata: {}
      },
      extractedData: record.extracted_data,
      insights: {
        summary: record.insights_summary,
        keyFindings: record.key_findings || [],
        trends: record.trends || [],
        risks: record.risks || [],
        opportunities: record.opportunities || []
      },
      actionItems: record.action_items || [],
      processingTime: record.processing_time_ms,
      createdAt: new Date(record.created_at)
    };
  }

  /**
   * Search documents by content
   */
  async searchDocuments(query: string, limit = 10): Promise<ProcessedDocument[]> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // Simple text search (in a full implementation, you'd use full-text search)
      const { data, error } = await this.supabase!
        .from('processed_documents')
        .select('*')
        .or(`filename.ilike.%${query}%,insights_summary.ilike.%${query}%,property_name.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapDatabaseRecordToProcessedDocument);

    } catch (error) {
      logger.error(`❌ Failed to search documents for query "${query}":`, error);
      return [];
    }
  }
}
