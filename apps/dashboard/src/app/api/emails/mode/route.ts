import { NextResponse } from 'next/server';

// Simple mode tracking (in production, use proper state management)
let isDemoMode = true;

export async function GET() {
  return NextResponse.json({
    mode: isDemoMode ? 'demo' : 'live',
    description: isDemoMode ? 'Using sample data for testing' : 'Processing real CloudMailin webhooks'
  });
}