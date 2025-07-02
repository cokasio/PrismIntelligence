import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Validation schema for task completion
const completeTaskSchema = z.object({
  completion_notes: z.string().min(10, 'Completion notes must be at least 10 characters'),
  actual_hours: z.number().positive('Actual hours must be positive'),
  actual_value: z.number().optional(),
  success_rating: z.number().min(1).max(5).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(taskId)) {
      return NextResponse.json(
        { error: 'Invalid task ID format' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = completeTaskSchema.parse(body);

    // First, check if task exists and is not already completed
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('id, status, potential_value, company_id, property_id')
      .eq('id', taskId)
      .single();

    if (fetchError || !existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    if (existingTask.status === 'completed') {
      return NextResponse.json(
        { error: 'Task is already completed' },
        { status: 400 }
      );
    }

    // Start a transaction by updating task and creating outcome
    const completedAt = new Date().toISOString();
    const userId = request.headers.get('x-user-id') || 'system';

    // Update the task
    const { data: updatedTask, error: updateError } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: completedAt,
        completed_by: userId,
        actual_hours: validatedData.actual_hours,
        notes: validatedData.completion_notes,
        updated_at: completedAt,
      })
      .eq('id', taskId)
      .select(`
        *,
        properties(id, name, address),
        reports(id, title, document_name)
      `)
      .single();

    if (updateError) {
      console.error('Error updating task:', updateError);
      return NextResponse.json(
        { error: 'Failed to complete task' },
        { status: 500 }
      );
    }

    // Create task outcome record
    const { data: outcome, error: outcomeError } = await supabase
      .from('task_outcomes')
      .insert({
        task_id: taskId,
        company_id: existingTask.company_id,
        outcome_description: validatedData.completion_notes,
        success_rating: validatedData.success_rating || 4,
        actual_value_realized: validatedData.actual_value || existingTask.potential_value,
        time_saved_hours: Math.max(0, validatedData.actual_hours - (updatedTask.estimated_hours || 0)),
        created_by: userId,
      })
      .select()
      .single();

    if (outcomeError) {
      console.error('Error creating task outcome:', outcomeError);
    }

    // Update ROI metrics for the current month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const { error: roiError } = await supabase.rpc('update_roi_metrics_on_completion', {
      p_company_id: existingTask.company_id,
      p_property_id: existingTask.property_id,
      p_task_value: validatedData.actual_value || existingTask.potential_value,
      p_time_saved: Math.max(0, validatedData.actual_hours - (updatedTask.estimated_hours || 0))
    });

    if (roiError) {
      console.error('Error updating ROI metrics:', roiError);
    }

    // Create audit trail entry
    await supabase
      .from('audit_logs')
      .insert({
        entity_type: 'task',
        entity_id: taskId,
        action: 'complete',
        changes: {
          status: 'completed',
          completion_notes: validatedData.completion_notes,
          actual_hours: validatedData.actual_hours,
          actual_value: validatedData.actual_value,
        },
        user_id: userId,
      })
      .catch(err => console.error('Failed to create audit log:', err));

    // Return the completed task with outcome
    const response = {
      ...updatedTask,
      outcome: outcome,
      message: 'Task completed successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in task completion API:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}