import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const groupBy = searchParams.get('groupBy') || 'property';
    
    // Mock data based on grouping
    let data;
    
    switch (groupBy) {
      case 'month':
        data = [
          { name: 'Sep 2024', potentialValue: 28000, realizedValue: 22000, tasksCount: 15 },
          { name: 'Oct 2024', potentialValue: 32000, realizedValue: 26800, tasksCount: 18 },
          { name: 'Nov 2024', potentialValue: 35500, realizedValue: 29200, tasksCount: 21 },
          { name: 'Dec 2024', potentialValue: 31000, realizedValue: 28500, tasksCount: 19 },
          { name: 'Jan 2025', potentialValue: 38000, realizedValue: 33100, tasksCount: 23 },
        ];
        break;
      case 'category':
        data = [
          { name: 'Maintenance', potentialValue: 45000, realizedValue: 38000, tasksCount: 28 },
          { name: 'Financial', potentialValue: 38000, realizedValue: 34200, tasksCount: 22 },
          { name: 'Compliance', potentialValue: 22000, realizedValue: 19800, tasksCount: 15 },
          { name: 'Operational', potentialValue: 31000, realizedValue: 26500, tasksCount: 19 },
          { name: 'Tenant Relations', potentialValue: 18000, realizedValue: 15600, tasksCount: 12 },
        ];
        break;
      default: // property
        data = [
          { name: 'Sunset Plaza', potentialValue: 15000, realizedValue: 12000, tasksCount: 8 },
          { name: 'Oak Ridge Apts', potentialValue: 22000, realizedValue: 18500, tasksCount: 12 },
          { name: 'Downtown Loft', potentialValue: 8500, realizedValue: 7200, tasksCount: 5 },
          { name: 'Maple Gardens', potentialValue: 18000, realizedValue: 15600, tasksCount: 9 },
          { name: 'Pine Valley', potentialValue: 12000, realizedValue: 9800, tasksCount: 7 },
          { name: 'Harbor View', potentialValue: 25000, realizedValue: 21000, tasksCount: 14 },
        ];
    }

    // Add ROI percentage to each item
    const enrichedData = data.map(item => ({
      ...item,
      roiPercentage: Math.round((item.realizedValue / item.potentialValue) * 100),
    }));

    return NextResponse.json(enrichedData);
  } catch (error) {
    console.error('Value analysis API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch value analysis data' },
      { status: 500 }
    );
  }
}
