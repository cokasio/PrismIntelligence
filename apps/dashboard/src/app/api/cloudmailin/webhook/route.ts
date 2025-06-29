import { NextRequest, NextResponse } from 'next/server';

// Simple demo mode toggle for now
let isDemoMode = true;

interface CloudMailinWebhook {
  envelope?: {
    to: string;
    from: string;
    received_at: string;
  };
  headers?: {
    subject: string;
    from: string;
    to: string;
    date: string;
  };
  plain?: string;
  html?: string;
  attachments?: Array<{
    content: string;
    file_name: string;
    content_type: string;
    size: number;
    disposition: string;
  }>;
}

interface ProcessedEmail {
  id: string;
  customerInfo: {
    company: string;
    slug: string;
    email: string;
  };
  emailData: {
    headers: {
      subject: string;
      from: string;
      date: string;
    };
    plain: string;
    attachments?: any[];
  };
  analysis: {
    summary: string;
    keyMetrics: any;
    insights: string[];
    actions: string[];
    priority: number;
    confidence: number;
  };
  processedAt: string;
  mode: 'demo' | 'live';
}

export async function POST(request: NextRequest) {
  try {
    const body: CloudMailinWebhook = await request.json();
    
    // Process the CloudMailin webhook
    const result = await processEmail(body);
    
    return NextResponse.json({
      status: 'success',
      message: 'Email processed successfully',
      result
    }, { status: 200 });
    
  } catch (error) {
    console.error('Email processing error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 422 }); // Tell CloudMailin to reject
  }
}

async function processEmail(emailData: CloudMailinWebhook): Promise<ProcessedEmail> {
  if (isDemoMode || !emailData.envelope) {
    return await processDemoEmail();
  } else {
    return await processLiveEmail(emailData);
  }
}

async function processDemoEmail(): Promise<ProcessedEmail> {
  const sampleEmail: ProcessedEmail = {
    id: Math.random().toString(36).substr(2, 9),
    customerInfo: {
      company: 'Westside Properties',
      slug: 'westside-properties',
      email: '38fab3b51608018af887+westside-properties@cloudmailin.net'
    },
    emailData: {
      headers: {
        subject: 'Sunset Plaza - Monthly Financial Report - January 2024',
        from: 'Property Manager <manager@westsideproperties.com>',
        date: new Date().toISOString()
      },
      plain: `Dear Team,

Please find attached the monthly financial report for Sunset Plaza for January 2024.

Key highlights:
- Total Revenue: $45,230
- Operating Expenses: $32,100
- Net Operating Income: $13,130
- Occupancy Rate: 94%

Let me know if you need any additional information.

Best regards,
Sarah Johnson
Property Manager`,
      attachments: [
        {
          file_name: 'Sunset_Plaza_Financial_Report_Jan2024.pdf',
          content_type: 'application/pdf',
          size: 156789,
          disposition: 'attachment'
        }
      ]
    },
    analysis: {
      summary: "Monthly financial report for Sunset Plaza showing strong performance with 94% occupancy and positive NOI of $13,130.",
      keyMetrics: {
        revenue: 45230,
        expenses: 32100,
        noi: 13130,
        occupancy: 0.94
      },
      insights: [
        "Revenue increased 3% from previous month",
        "Occupancy rate remains strong at 94%", 
        "Maintenance expenses were higher than expected"
      ],
      actions: [
        "Review maintenance contracts for cost optimization",
        "Consider rent increase for upcoming renewals",
        "Schedule HVAC maintenance to prevent future issues"
      ],
      priority: 3,
      confidence: 0.89
    },
    processedAt: new Date().toISOString(),
    mode: 'demo'
  };

  return sampleEmail;
}

async function processLiveEmail(cloudmailinData: CloudMailinWebhook): Promise<ProcessedEmail> {
  const customerInfo = extractCustomerInfo(cloudmailinData.envelope?.to || '');
  
  const result: ProcessedEmail = {
    id: Math.random().toString(36).substr(2, 9),
    customerInfo,
    emailData: {
      headers: {
        subject: cloudmailinData.headers?.subject || '',
        from: cloudmailinData.headers?.from || '',
        date: cloudmailinData.headers?.date || new Date().toISOString()
      },
      plain: cloudmailinData.plain || '',
      attachments: cloudmailinData.attachments || []
    },
    analysis: {
      summary: "Email processed successfully. AI analysis would go here.",
      keyMetrics: {},
      insights: ["Live email processing active"],
      actions: ["Review email content"],
      priority: 3,
      confidence: 0.75
    },
    processedAt: new Date().toISOString(),
    mode: 'live'
  };

  return result;
}

function extractCustomerInfo(emailAddress: string) {
  const match = emailAddress.match(/38fab3b51608018af887\+(.+)@cloudmailin\.net/);
  const customerSlug = match ? match[1] : 'unknown';
  
  return {
    slug: customerSlug,
    company: slugToCompanyName(customerSlug),
    email: emailAddress
  };
}

function slugToCompanyName(slug: string) {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}