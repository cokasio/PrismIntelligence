import { NextRequest, NextResponse } from 'next/server';

// Simple mode tracking (in production, use proper state management)
let isDemoMode = true;

export async function POST(request: NextRequest) {
  try {
    const { demo } = await request.json();
    isDemoMode = demo;
    
    return NextResponse.json({
      success: true,
      mode: {
        mode: isDemoMode ? 'demo' : 'live',
        description: isDemoMode ? 'Using sample data for testing' : 'Processing real CloudMailin webhooks'
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    mode: isDemoMode ? 'demo' : 'live',
    description: isDemoMode ? 'Using sample data for testing' : 'Processing real CloudMailin webhooks'
  });
}