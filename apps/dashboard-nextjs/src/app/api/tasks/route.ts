import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Validation schema for query parameters
const querySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  status: z.enum(['pending', 'in_progress', 'completed', 'overdue', 'all']).optional().default('all'),
  assignedRole: z.enum(['CFO', 'PropertyManager', 'Maintenance', 'Accounting', 'Leasing', 'all']).optional().default('all'),
  propertyId: z.string().uuid().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(['dueDate', 'priority', 'potentialValue', 'createdAt']).optional().default('dueDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const params = querySchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      status: searchParams.get('status') || 'all',
      assignedRole: searchParams.get('assignedRole') || 'all',
      propertyId: searchParams.get('propertyId') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      sortBy: searchParams.get('sortBy') || 'dueDate',
      sortOrder: searchParams.get('sortOrder') || 'asc',
    });

    const page = parseInt(params.page);
    const limit = parseInt(params.limit);
    const offset = (page - 1) * limit;

    // Build the query
    let query = supabase
      .from('tasks')
      .select('*, properties(name, address), reports(title)', { count: 'exact' });

    // Apply filters
    if (params.status !== 'all') {
      if (params.status === 'overdue') {
        query = query.lt('due_date', new Date().toISOString()).eq('status', 'pending');
      } else {
        query = query.eq('status', params.status);
      }
    }

    if (params.assignedRole !== 'all') {
      query = query.eq('assigned_role', params.assignedRole);
    }

    if (params.propertyId) {
      query = query.eq('property_id', params.propertyId);
    }

    if (params.dateFrom) {
      query = query.gte('due_date', params.dateFrom);
    }

    if (params.dateTo) {
      query = query.lte('due_date', params.dateTo);
    }

    // Apply sorting
    const sortColumn = params.sortBy === 'dueDate' ? 'due_date' : 
                      params.sortBy === 'potentialValue' ? 'potential_value' :
                      params.sortBy === 'createdAt' ? 'created_at' : params.sortBy;
    
    query = query.order(sortColumn, { ascending: params.sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: tasks, error, count } = await query;

    if (error) {
      console.error('Error fetching tasks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      );
    }

    // Calculate additional metadata
    const totalPages = Math.ceil((count || 0) / limit);

    // Format response
    const response = {
      tasks: tasks || [],
      total: count || 0,
      page: page,
      totalPages: totalPages,
      filters: {
        status: params.status,
        assignedRole: params.assignedRole,
        propertyId: params.propertyId,
        dateRange: params.dateFrom || params.dateTo ? {
          from: params.dateFrom,
          to: params.dateTo
        } : null,
      },
      sort: {
        by: params.sortBy,
        order: params.sortOrder
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in tasks API:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}