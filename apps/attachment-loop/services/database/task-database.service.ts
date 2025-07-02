import { createClient } from '@supabase/supabase-js';
import logger from '../../utils/logger.js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  logger.warn('⚠️  Supabase credentials not configured - database features disabled');
}

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export class TaskDatabaseService {
  /**
   * Store tasks generated from analysis
   */
  async storeTasks(tasks: any[], reportId: string, companyId: string, propertyId?: string) {
    if (!supabase) {
      logger.warn('Database not configured - tasks not stored');
      return [];
    }

    try {
      // Prepare tasks for insertion
      const tasksToInsert = tasks.map(task => ({
        company_id: companyId,
        property_id: propertyId,
        report_id: reportId,
        title: task.title,
        description: task.description,
        priority: task.priority,
        assigned_role: task.assignedRole,
        due_date: task.dueDate,
        estimated_hours: task.estimatedHours,
        potential_value: task.potentialValue,
        source_insight: task.sourceInsight,
        status: 'pending'
      }));

      const { data, error } = await supabase
        .from('tasks')
        .insert(tasksToInsert)
        .select();

      if (error) {
        logger.error('Failed to store tasks:', error);
        throw error;
      }

      logger.info(`✅ Stored ${data.length} tasks in database`);
      return data;
    } catch (error) {
      logger.error('Error storing tasks:', error);
      throw error;
    }
  }

  /**
   * Create analysis summary with ROI metrics
   */
  async createAnalysisSummary(
    reportId: string,
    companyId: string,
    propertyId: string | undefined,
    analysisData: {
      documentName: string;
      documentType: string;
      processingStartTime: Date;
      processingEndTime: Date;
      insightsCount: number;
      highPriorityInsightsCount: number;
      tasksGeneratedCount: number;
      totalPotentialValue: number;
      modelsUsed: string[];
    }
  ) {
    if (!supabase) {
      logger.warn('Database not configured - analysis summary not stored');
      return null;
    }

    try {
      const processingDuration = Math.round(
        (analysisData.processingEndTime.getTime() - analysisData.processingStartTime.getTime()) / 1000
      );
      
      // Calculate time saved (assume 2 hours manual analysis)
      const estimatedManualHours = this.estimateManualAnalysisTime(analysisData.documentType);
      const actualProcessingMinutes = processingDuration / 60;
      const timeSavedHours = Math.max(0, estimatedManualHours - (actualProcessingMinutes / 60));

      const summary = {
        company_id: companyId,
        property_id: propertyId,
        report_id: reportId,
        document_name: analysisData.documentName,
        document_type: analysisData.documentType,
        processing_started_at: analysisData.processingStartTime.toISOString(),
        processing_completed_at: analysisData.processingEndTime.toISOString(),
        processing_duration_seconds: processingDuration,
        models_used: analysisData.modelsUsed,
        estimated_manual_analysis_hours: estimatedManualHours,
        actual_ai_processing_minutes: actualProcessingMinutes,
        time_saved_hours: timeSavedHours,
        insights_count: analysisData.insightsCount,
        high_priority_insights_count: analysisData.highPriorityInsightsCount,
        tasks_generated_count: analysisData.tasksGeneratedCount,
        total_potential_value: analysisData.totalPotentialValue
      };

      const { data, error } = await supabase
        .from('analysis_summaries')
        .insert(summary)
        .select()
        .single();

      if (error) {
        logger.error('Failed to create analysis summary:', error);
        throw error;
      }

      logger.info(`📊 Analysis Summary: ${timeSavedHours.toFixed(1)} hours saved, $${analysisData.totalPotentialValue.toLocaleString()} potential value`);
      
      return data;
    } catch (error) {
      logger.error('Error creating analysis summary:', error);
      throw error;
    }
  }

  /**
   * Update ROI metrics for the current period
   */
  async updateROIMetrics(
    companyId: string,
    propertyId: string | undefined,
    metrics: {
      documentsProcessed: number;
      analysesCompleted: number;
      tasksGenerated: number;
      totalPotentialValue: number;
      timeSavedHours: number;
      insightsGenerated: number;
      highPriorityInsights: number;
    }
  ) {
    if (!supabase) {
      logger.warn('Database not configured - ROI metrics not updated');
      return null;
    }

    try {
      const periodStart = new Date();
      periodStart.setDate(1); // First day of current month
      periodStart.setHours(0, 0, 0, 0);

      const periodEnd = new Date(periodStart);
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      periodEnd.setDate(0); // Last day of current month

      // Try to update existing record first
      const { data: existing } = await supabase
        .from('roi_metrics')
        .select()
        .eq('company_id', companyId)
        .eq('property_id', propertyId || null)
        .eq('period_start', periodStart.toISOString().split('T')[0])
        .eq('period_type', 'monthly')
        .single();

      if (existing) {
        // Update existing record
        const { data, error } = await supabase
          .from('roi_metrics')
          .update({
            total_analyses: existing.total_analyses + metrics.analysesCompleted,
            total_documents_processed: existing.total_documents_processed + metrics.documentsProcessed,
            time_saved_hours: existing.time_saved_hours + metrics.timeSavedHours,
            tasks_generated: existing.tasks_generated + metrics.tasksGenerated,
            total_potential_value: existing.total_potential_value + metrics.totalPotentialValue,
            total_insights_generated: existing.total_insights_generated + metrics.insightsGenerated,
            high_priority_insights: existing.high_priority_insights + metrics.highPriorityInsights,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('roi_metrics')
          .insert({
            company_id: companyId,
            property_id: propertyId,
            period_start: periodStart.toISOString().split('T')[0],
            period_end: periodEnd.toISOString().split('T')[0],
            period_type: 'monthly',
            total_analyses: metrics.analysesCompleted,
            total_documents_processed: metrics.documentsProcessed,
            time_saved_hours: metrics.timeSavedHours,
            tasks_generated: metrics.tasksGenerated,
            total_potential_value: metrics.totalPotentialValue,
            total_insights_generated: metrics.insightsGenerated,
            high_priority_insights: metrics.highPriorityInsights
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      logger.error('Error updating ROI metrics:', error);
      throw error;
    }
  }

  /**
   * Estimate manual analysis time based on document type
   */
  private estimateManualAnalysisTime(documentType: string): number {
    const estimates: Record<string, number> = {
      'financial_report': 3.0,
      'P&L Statement': 3.0,
      'rent_roll': 2.0,
      'maintenance_report': 1.5,
      'lease_agreement': 1.0,
      'invoice': 0.5
    };

    return estimates[documentType] || 2.0; // Default 2 hours
  }

  /**
   * Get active tasks for a property or company
   */
  async getActiveTasks(companyId: string, propertyId?: string) {
    if (!supabase) {
      logger.warn('Database not configured - cannot retrieve tasks');
      return [];
    }

    try {
      let query = supabase
        .from('v_active_tasks')
        .select('*')
        .eq('company_id', companyId)
        .order('due_date', { ascending: true });

      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      logger.error('Error retrieving active tasks:', error);
      throw error;
    }
  }

  /**
   * Get ROI dashboard data
   */
  async getROIDashboard(companyId: string, propertyId?: string) {
    if (!supabase) {
      logger.warn('Database not configured - cannot retrieve ROI data');
      return null;
    }

    try {
      let query = supabase
        .from('v_roi_dashboard')
        .select('*')
        .eq('company_id', companyId);

      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }

      const { data, error } = await query.single();

      if (error && error.code !== 'PGRST116') { // Ignore "no rows" error
        throw error;
      }

      return data || {
        total_time_saved: 0,
        total_value_realized: 0,
        avg_completion_rate: 0,
        total_tasks_generated: 0,
        total_tasks_completed: 0
      };
    } catch (error) {
      logger.error('Error retrieving ROI dashboard:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const taskDatabase = new TaskDatabaseService();