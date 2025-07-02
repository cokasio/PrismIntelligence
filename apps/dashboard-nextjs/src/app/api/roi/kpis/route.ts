import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // Mock data for now - in production this would query real data
    const response = {
      timeSavedHours: {
        current: 24.5,
        previous: 18.2,
        trend: 'up' as const,
      },
      tasksCompleted: {
        completed: 12,
        total: 18,
        percentage: 67,
        trend: 'up' as const,
      },
      valueIdentified: {
        current: 15750,
        previous: 12300,
        trend: 'up' as const,
        sparklineData: [8000, 9500, 11200, 10800, 13400, 15750],
      },
      activeProperties: {
        count: 8,
        withTasks: 6,
        trend: 'neutral' as const,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('KPI API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KPI data' },
      { status: 500 }
    );
  }
}
