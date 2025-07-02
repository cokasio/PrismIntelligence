import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'week';
    
    // Generate mock time-saved data based on period
    const now = new Date();
    const data = [];
    let cumulativeTime = 0;

    const periods = period === 'day' ? 24 : period === 'week' ? 7 : 30;

    for (let i = periods - 1; i >= 0; i--) {
      const date = new Date(now);
      if (period === 'day') {
        date.setHours(now.getHours() - i);
      } else {
        date.setDate(now.getDate() - i);
      }

      const timeSaved = Math.random() * 4 + 0.5; // 0.5 to 4.5 hours
      const tasksCompleted = Math.floor(Math.random() * 3) + 1; // 1 to 3 tasks
      cumulativeTime += timeSaved;

      data.push({
        date: period === 'day' 
          ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              ...(period === 'month' ? {} : { weekday: 'short' })
            }),
        timeSaved: Math.round(timeSaved * 10) / 10,
        tasksCompleted,
        cumulativeTime: Math.round(cumulativeTime * 10) / 10,
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Time saved API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time saved data' },
      { status: 500 }
    );
  }
}
