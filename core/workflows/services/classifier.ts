// AI-powered document classifier using Claude
import Anthropic from '@anthropic-ai/sdk';
import { 
  ClassificationResult, 
  ReportType, 
  StructureType 
} from '../types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function classifyDocument(
  content: any
): Promise<ClassificationResult> {
  try {
    // Prepare content for classification
    const textContent = extractTextForClassification(content);
    
    // Use Claude to classify the document
    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229',
      max_tokens: 1000,
      temperature: 0.1, // Low temperature for consistent classification
      messages: [{
        role: 'user',
        content: createClassificationPrompt(textContent)
      }]
    });

    // Parse Claude's response
    return parseClassificationResponse(response.content[0].text);
  } catch (error) {
    console.error('Classification error:', error);
    
    // Fallback classification based on keywords
    return fallbackClassification(content);
  }
}
function createClassificationPrompt(content: string): string {
  return `Analyze this financial document and provide a structured classification.

Document content (first 2000 characters):
${content.substring(0, 2000)}

Classify the document with the following structure:

1. DOCUMENT TYPE (select exactly one):
   - income_statement (P&L, profit/loss statement, revenue statement)
   - balance_sheet (statement of financial position, assets/liabilities)
   - cash_flow_statement (cash flow, sources and uses)
   - trial_balance (list of account balances)
   - general_ledger (detailed transactions)
   - operational_report (occupancy, maintenance, operational metrics)
   - custom_report (other financial reports)

2. DATA STRUCTURE (select exactly one):
   - structured (clear tables, columns, consistent format)
   - semi_structured (mix of tables and text, partial structure)
   - unstructured (narrative text, no clear tables)

3. KEY INDICATORS (list all found):
   - Financial terms/accounts mentioned
   - Time period indicators (months, quarters, years)
   - Property or company names
   - Currency indicators

4. TIME PERIOD:
   - Start date (if found, format: YYYY-MM-DD)
   - End date (if found, format: YYYY-MM-DD)
   - Period type (monthly, quarterly, annual)

5. CONFIDENCE SCORE: 0-100 (how confident are you in this classification)

6. EXTRACTION NOTES:
   - Any special formatting observed
   - Potential challenges for data extraction
   - Recommended extraction approach

Please respond in this exact JSON format:
{
  "documentType": "type_here",
  "dataStructure": "structure_here",
  "keyIndicators": ["indicator1", "indicator2"],
  "timePeriod": {
    "start": "YYYY-MM-DD or null",
    "end": "YYYY-MM-DD or null",
    "type": "period_type or null"
  },
  "confidence": 85,
  "extractionNotes": {
    "formatting": "description",
    "challenges": ["challenge1"],
    "approach": "recommended approach"
  }
}`;
}
function parseClassificationResponse(response: string): ClassificationResult {
  try {
    // Extract JSON from response (Claude might add explanation text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      reportType: mapToReportType(parsed.documentType),
      structureType: mapToStructureType(parsed.dataStructure),
      confidence: parsed.confidence / 100, // Convert to 0-1 scale
      indicators: parsed.keyIndicators || [],
      timePeriod: parsed.timePeriod?.start ? {
        start: new Date(parsed.timePeriod.start),
        end: new Date(parsed.timePeriod.end)
      } : undefined,
      metadata: {
        extractionNotes: parsed.extractionNotes,
        rawClassification: parsed
      }
    };
  } catch (error) {
    console.error('Error parsing classification response:', error);
    throw error;
  }
}

function mapToReportType(type: string): ReportType {
  const mapping: Record<string, ReportType> = {
    'income_statement': ReportType.INCOME_STATEMENT,
    'balance_sheet': ReportType.BALANCE_SHEET,
    'cash_flow_statement': ReportType.CASH_FLOW,
    'trial_balance': ReportType.TRIAL_BALANCE,
    'general_ledger': ReportType.GENERAL_LEDGER,
    'operational_report': ReportType.OPERATIONAL,
    'custom_report': ReportType.CUSTOM
  };

  return mapping[type] || ReportType.CUSTOM;
}

function mapToStructureType(structure: string): StructureType {
  const mapping: Record<string, StructureType> = {
    'structured': StructureType.STRUCTURED,
    'semi_structured': StructureType.SEMI_STRUCTURED,
    'unstructured': StructureType.UNSTRUCTURED
  };

  return mapping[structure] || StructureType.UNSTRUCTURED;
}

function extractTextForClassification(content: any): string {
  // Extract text based on content type
  if (typeof content === 'string') {
    return content;
  }
  
  if (content.text) {
    return content.text;
  }
  
  if (content.tables && content.tables.length > 0) {
    // Convert tables to text representation
    return content.tables.map((table: any) => {
      const headers = table.headers?.join(' | ') || '';
      const rows = table.rows?.map((row: any[]) => row.join(' | ')).join('\n') || '';
      return `${headers}\n${rows}`;
    }).join('\n\n');
  }

  return JSON.stringify(content).substring(0, 2000);
}

function fallbackClassification(content: any): ClassificationResult {
  // Simple keyword-based classification as fallback
  const text = extractTextForClassification(content).toLowerCase();
  
  let reportType = ReportType.CUSTOM;
  let confidence = 0.5;
  const indicators: string[] = [];

  // Check for income statement indicators
  if (text.includes('revenue') || text.includes('income') || 
      text.includes('expense') || text.includes('profit')) {
    reportType = ReportType.INCOME_STATEMENT;
    confidence = 0.7;
    indicators.push('revenue/expense keywords found');
  }
  
  // Check for balance sheet indicators
  else if (text.includes('assets') || text.includes('liabilities') || 
           text.includes('equity')) {
    reportType = ReportType.BALANCE_SHEET;
    confidence = 0.7;
    indicators.push('balance sheet keywords found');
  }
  
  // Check for cash flow indicators
  else if (text.includes('cash flow') || text.includes('operating activities')) {
    reportType = ReportType.CASH_FLOW;
    confidence = 0.7;
    indicators.push('cash flow keywords found');
  }

  // Determine structure
  let structureType = StructureType.UNSTRUCTURED;
  if (content.tables && content.tables.length > 0) {
    structureType = StructureType.STRUCTURED;
    confidence += 0.1;
  } else if (text.includes('|') || text.includes('\t')) {
    structureType = StructureType.SEMI_STRUCTURED;
  }

  return {
    reportType,
    structureType,
    confidence,
    indicators,
    metadata: {
      method: 'fallback',
      reason: 'AI classification failed'
    }
  };
}