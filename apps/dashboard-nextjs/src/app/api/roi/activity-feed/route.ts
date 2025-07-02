import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Mock activity data
    const now = new Date();
    const activities = [
      {
        id: '1',
        type: 'analysis_completed',
        title: 'Document Analysis Complete',
        description: 'Financial report processed with 3 new insights identified',
        value: 8500,
        timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
        metadata: {
          propertyName: 'Sunset Plaza',
          documentName: 'Q4_Financial_Report.pdf',
          taskCount: 3,
        }
      },
      {
        id: '2',
        type: 'task_completed',
        title: 'Task Completed',
        description: 'Review maintenance budget variance resolved',
        value: 2300,
        timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
        metadata: {
          propertyName: 'Oak Ridge Apartments',
          priority: 4,
        }
      },
      {
        id: '3',
        type: 'milestone_reached',
        title: 'Monthly Goal Achieved',
        description: '20 hours saved this month - target exceeded!',
        value: 20,
        timestamp: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
        metadata: {}
      },
      {
        id: '4',
        type: 'task_created',
        title: 'New Tasks Generated',
        description: '5 tasks created from lease agreement analysis',
        timestamp: new Date(now.getTime() - 1.2 * 60 * 60 * 1000).toISOString(),
        metadata: {
          propertyName: 'Downtown Loft',
          documentName: 'Lease_Amendment_2025.pdf',
          taskCount: 5,
        }
      },
      {
        id: '5',
        type: 'analysis_completed',
        title: 'Expense Report Analyzed',
        description: 'Monthly expenses reviewed, 2 cost optimization opportunities found',
        value: 4200,
        timestamp: new Date(now.getTime() - 2.5 * 60 * 60 * 1000).toISOString(),
        metadata: {
          propertyName: 'Maple Gardens',
          documentName: 'December_Expenses.xlsx',
          taskCount: 2,
        }
      },
    ];

    return NextResponse.json(activities.slice(0, limit));
  } catch (error) {
    console.error('Activity feed API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity feed' },
      { status: 500 }
    );
  }
}
