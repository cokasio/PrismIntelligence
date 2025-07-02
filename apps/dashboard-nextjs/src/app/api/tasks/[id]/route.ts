import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Validation schema for task updates
const updateTaskSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  notes: z.string().optional(),
  actual_hours: z.number().positive().optional(),
  assigned_to: z.string().uuid().optional(),
  due_date: z.string().datetime().optional(),
});

type TaskUpdate = z.infer<typeof updateTaskSchema>;

export async function GET(
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

    // Fetch task with related data
    const { data: task, error } = await supabase
      .from('tasks')
      .select(`
        *,
        properties(id, name, address),
        reports(id, title, document_name),
        insights(id, title, description),
        task_outcomes(
          id,
          outcome_description,
          actual_value_realized,
          time_saved_hours,
          created_at
        )
      `)
      .eq('id', taskId)
      .single();

    if (error || !task) {
      if (error?.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching task:', error);
      return NextResponse.json(
        { error: 'Failed to fetch task' },
        { status: 500 }
      );
    }

    // Add computed fields
    const enrichedTask = {
      ...task,
      is_overdue: task.status === 'pending' && new Date(task.due_date) < new Date(),
      days_until_due: Math.ceil((new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
    };

    return NextResponse.json(enrichedTask);
  } catch (error) {
    console.error('Error in task detail API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const validatedData = updateTaskSchema.parse(body);

    // Prepare update data
    const updateData: any = {
      ...validatedData,
      updated_at: new Date().toISOString(),
    };

    // If completing task, add completion timestamp
    if (validatedData.status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    // Update the task
    const { data: updatedTask, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .select(`
        *,
        properties(id, name, address),
        reports(id, title, document_name)
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }
      console.error('Error updating task:', error);
      return NextResponse.json(
        { error: 'Failed to update task' },
        { status: 500 }
      );
    }

    // Create audit trail entry
    await supabase
      .from('audit_logs')
      .insert({
        entity_type: 'task',
        entity_id: taskId,
        action: 'update',
        changes: validatedData,
        user_id: request.headers.get('x-user-id') || 'system',
      })
      .catch(err => console.error('Failed to create audit log:', err));

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error in task update API:', error);
    
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