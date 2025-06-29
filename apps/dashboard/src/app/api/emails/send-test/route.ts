import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { customerSlug, reportType, attachmentType } = await request.json();
    
    // Simulate email sending (replace with actual implementation)
    const result = {
      success: true,
      messageId: `test_${Math.random().toString(36).substr(2, 9)}`,
      previewUrl: `https://ethereal.email/message/${Math.random().toString(36).substr(2, 16)}`,
      to: `38fab3b51608018af887+${customerSlug || 'test-property'}@cloudmailin.net`,
      subject: `${slugToPropertyName(customerSlug || 'test-property')} - Monthly ${(reportType || 'financial').charAt(0).toUpperCase() + (reportType || 'financial').slice(1)} Report - ${getCurrentMonth()}`,
      attachment: attachmentType ? `${reportType || 'financial'}_report.${attachmentType}` : undefined
    };
    
    return NextResponse.json({
      success: true,
      result
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function slugToPropertyName(slug: string) {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getCurrentMonth() {
  return new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  });
}