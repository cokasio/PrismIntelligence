// Example: Processing a Financial Report Through the Pipeline
import { financialPipeline } from './FinancialPipeline';
import { EmailAttachment, IngestionContext } from './types';

/**
 * Example 1: Processing an Excel Income Statement
 */
async function processExcelIncomeStatement() {
  console.log('📊 Processing Excel Income Statement...\n');

  // Simulate an email attachment
  const attachment: EmailAttachment = {
    id: 'att_001',
    filename: 'Sunset_Tower_Dec_2024_Financials.xlsx',
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: 125000,
    data: Buffer.from('...'), // Would be actual Excel file buffer
    emailId: 'email_20240115_0930',
    sender: 'accounting@sunsetproperty.com',
    receivedAt: new Date('2024-01-15T09:30:00Z')
  };

  const context: IngestionContext = {
    companyId: '11111111-1111-1111-1111-111111111111',
    propertyId: '22222222-2222-2222-2222-222222222222',
    emailId: attachment.emailId,
    source: 'email'
  };

  try {
    const result = await financialPipeline.processAttachment(attachment, context);

    if (result.success) {
      console.log('✅ Processing successful!\n');
      console.log('📋 Report Type:', result.data.reportType);
      console.log('📅 Period:', `${result.data.period.start} to ${result.data.period.end}`);
      console.log('💰 Currency:', result.data.currency);
      console.log('📊 Quality Score:', `${(result.data.quality.overallScore * 100).toFixed(0)}%`);
      
      console.log('\n💵 Financial Summary:');
      console.log('  Revenue:', formatCurrency(result.data.data.revenue?.total_revenue));
      console.log('  Expenses:', formatCurrency(result.data.data.expenses?.total_expenses));
      console.log('  NOI:', formatCurrency(result.data.metrics.find(m => m.name === 'net_operating_income')?.value));
      
      console.log('\n📈 Key Metrics:');
      result.data.metrics.forEach(metric => {
        console.log(`  ${metric.name}: ${formatValue(metric.value, metric.unit)}`);
      });
    }
  } catch (error) {
    console.error('❌ Processing failed:', error);
  }
}

/**
 * Example 2: Processing a PDF with Mixed Content
 */
async function processPDFReport() {
  console.log('📄 Processing PDF Operational Report...\n');

  const attachment: EmailAttachment = {
    id: 'att_002',
    filename: 'Q4_2024_Property_Operations_Report.pdf',
    contentType: 'application/pdf',
    size: 2500000,
    data: Buffer.from('...'), // Would be actual PDF buffer
    emailId: 'email_20240115_1045',
    sender: 'operations@propertymanager.com',
    receivedAt: new Date('2024-01-15T10:45:00Z')
  };

  // The pipeline will:
  // 1. Detect it's a PDF
  // 2. Extract text and tables
  // 3. Use AI to classify as operational report
  // 4. Extract occupancy rates, maintenance costs, etc.
  // 5. Normalize to standard schema
  // 6. Generate insights
}

/**
 * Example 3: Handling Unstructured Email Content
 */
async function processUnstructuredEmail() {
  console.log('📧 Processing Unstructured Financial Email...\n');

  const emailBody = `
    Hi team,

    Here's the December financial summary for Sunset Tower:

    Total rental income came in at $850,000, which is up from November's $820,000.
    We had some additional income from laundry and parking of about $15,000.

    On the expense side, we spent:
    - Operating expenses: $250,000
    - Maintenance and repairs: $45,000  
    - Utilities: $38,000
    - Management fees: $65,000

    This puts our NOI at $467,000 for the month, which is a 54% margin.

    Let me know if you need any other details!

    Best,
    Sarah
  `;

  const attachment: EmailAttachment = {
    id: 'att_003',
    filename: 'email_body.txt',
    contentType: 'text/plain',
    size: emailBody.length,
    data: Buffer.from(emailBody),
    emailId: 'email_20240115_1130',
    sender: 'sarah@propertymanager.com',
    receivedAt: new Date('2024-01-15T11:30:00Z')
  };

  // The AI will:
  // 1. Recognize this as an income statement in text form
  // 2. Extract the numbers using NLP
  // 3. Map "rental income" → revenue.rental_income
  // 4. Calculate that total revenue = $865,000
  // 5. Validate the NOI calculation
}

/**
 * Example 4: Demonstrating Learning and Improvement
 */
async function demonstrateLearning() {
  console.log('🧠 Demonstrating Pipeline Learning...\n');

  // First time seeing "Gross Receipts" from this company
  const firstReport = {
    fields: {
      "Gross Receipts": 850000,
      "Operating Costs": 398000
    }
  };

  // Pipeline learns: "Gross Receipts" = revenue.total_revenue
  // Stores this mapping for the company

  // Next time, same company sends:
  const secondReport = {
    fields: {
      "Gross Receipts": 875000,  // Instantly mapped correctly!
      "Operating Costs": 405000
    }
  };

  console.log('✅ Pipeline learned field mappings from first report');
  console.log('🚀 Second report processed faster with higher confidence');
}

// Helper functions
function formatCurrency(value?: number): string {
  if (!value) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

function formatValue(value: number, unit: string): string {
  switch (unit) {
    case 'currency':
      return formatCurrency(value);
    case 'percentage':
      return `${(value * 100).toFixed(1)}%`;
    default:
      return value.toString();
  }
}

// Run examples
async function runExamples() {
  console.log('🚀 Financial Pipeline Examples\n');
  console.log('================================\n');

  await processExcelIncomeStatement();
  console.log('\n' + '='.repeat(50) + '\n');

  await processPDFReport();
  console.log('\n' + '='.repeat(50) + '\n');

  await processUnstructuredEmail();
  console.log('\n' + '='.repeat(50) + '\n');

  await demonstrateLearning();
}

// Export for testing
export { 
  processExcelIncomeStatement,
  processPDFReport,
  processUnstructuredEmail,
  demonstrateLearning,
  runExamples
};