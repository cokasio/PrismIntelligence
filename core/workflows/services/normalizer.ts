// Normalizes extracted financial data to standard schema
import Anthropic from '@anthropic-ai/sdk';
import { 
  ExtractedData,
  NormalizedFinancialData,
  ClassificationResult,
  IngestionContext,
  ReportType,
  FinancialMetric,
  INCOME_STATEMENT_SCHEMA,
  BALANCE_SHEET_SCHEMA,
  FIELD_VARIATIONS
} from '../types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function normalizeFinancialData(
  extracted: ExtractedData,
  classification: ClassificationResult,
  context: IngestionContext
): Promise<NormalizedFinancialData> {
  // Get the appropriate schema based on report type
  const schema = getSchemaForReportType(classification.reportType);
  
  // Use AI to map extracted fields to standard schema
  const fieldMappings = await mapFieldsWithAI(
    extracted.fields,
    schema,
    classification.reportType
  );

  // Apply mappings and normalize values
  const normalizedData = applyFieldMappings(
    extracted,
    fieldMappings,
    schema
  );

  // Extract and calculate metrics
  const metrics = await extractFinancialMetrics(
    normalizedData,
    classification.reportType
  );

  // Ensure data consistency and calculate derived values
  const finalData = ensureDataConsistency(
    normalizedData,
    classification.reportType
  );

  return {
    reportType: classification.reportType,
    companyId: context.companyId,
    propertyId: context.propertyId,
    period: extracted.metadata.period || {
      start: new Date(),
      end: new Date()
    },
    currency: extracted.metadata.currency || 'USD',
    data: finalData,
    metrics,
    quality: {
      completeness: 0, // Will be set by validator
      accuracy: 0,
      consistency: 0,
      confidence: classification.confidence,
      overallScore: 0,
      issues: []
    }
  };
}

async function mapFieldsWithAI(
  extractedFields: Record<string, any>,
  schema: any,
  reportType: ReportType
): Promise<Record<string, string>> {
  const prompt = createFieldMappingPrompt(
    extractedFields,
    schema,
    reportType
  );

  try {
    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229',
      max_tokens: 2000,
      temperature: 0.1,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return parseFieldMappingResponse(response.content[0].text);
  } catch (error) {
    console.error('AI field mapping error:', error);
    // Fallback to rule-based mapping
    return createRuleBasedMapping(extractedFields, schema);
  }
}

function createFieldMappingPrompt(
  extractedFields: Record<string, any>,
  schema: any,
  reportType: ReportType
): string {
  return `Map these extracted financial fields to our standard ${reportType} schema.

EXTRACTED FIELDS:
${JSON.stringify(extractedFields, null, 2)}

STANDARD SCHEMA:
${JSON.stringify(schema, null, 2)}

COMMON VARIATIONS TO CONSIDER:
${JSON.stringify(FIELD_VARIATIONS, null, 2)}

INSTRUCTIONS:
1. Map each extracted field to the most appropriate schema field
2. Consider common variations (e.g., "Sales" → "revenue", "Costs" → "expenses")
3. Handle nested fields appropriately
4. If no good match exists, mark as "unmapped"
5. Provide confidence score (0-100) for each mapping

Return a JSON object with this structure:
{
  "mappings": {
    "extracted_field_name": {
      "target": "schema.path.to.field",
      "confidence": 95
    }
  },
  "unmapped": ["field1", "field2"],
  "notes": "Any important observations"
}`;
}

function parseFieldMappingResponse(response: string): Record<string, string> {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const mappings: Record<string, string> = {};

    Object.entries(parsed.mappings).forEach(([source, mapping]: [string, any]) => {
      if (mapping.confidence > 70) {
        mappings[source] = mapping.target;
      }
    });

    return mappings;
  } catch (error) {
    console.error('Error parsing field mapping response:', error);
    return {};
  }
}

function createRuleBasedMapping(
  extractedFields: Record<string, any>,
  schema: any
): Record<string, string> {
  const mappings: Record<string, string> = {};

  Object.keys(extractedFields).forEach(field => {
    const normalizedField = field.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Check each variation mapping
    Object.entries(FIELD_VARIATIONS).forEach(([schemaField, variations]) => {
      variations.forEach(variation => {
        const normalizedVariation = variation.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (normalizedField.includes(normalizedVariation)) {
          mappings[field] = schemaField;
        }
      });
    });
  });

  return mappings;
}

function applyFieldMappings(
  extracted: ExtractedData,
  mappings: Record<string, string>,
  schema: any
): Record<string, any> {
  const normalized: Record<string, any> = {};

  // Initialize with schema structure
  Object.keys(schema).forEach(section => {
    normalized[section] = {};
  });

  // Apply mappings
  Object.entries(mappings).forEach(([source, target]) => {
    const value = extracted.fields[source];
    const targetParts = target.split('.');
    
    let current = normalized;
    for (let i = 0; i < targetParts.length - 1; i++) {
      if (!current[targetParts[i]]) {
        current[targetParts[i]] = {};
      }
      current = current[targetParts[i]];
    }
    
    current[targetParts[targetParts.length - 1]] = normalizeValue(value);
  });

  return normalized;
}

function normalizeValue(value: any): number | null {
  if (value === null || value === undefined) return null;
  
  // Handle string values
  if (typeof value === 'string') {
    // Remove currency symbols, commas, and spaces
    const cleaned = value.replace(/[$,\s]/g, '');
    
    // Handle parentheses for negative numbers
    if (cleaned.includes('(') && cleaned.includes(')')) {
      const num = parseFloat(cleaned.replace(/[()]/g, ''));
      return -num;
    }
    
    // Handle percentage
    if (cleaned.includes('%')) {
      return parseFloat(cleaned.replace('%', '')) / 100;
    }
    
    // Handle millions/billions notation
    if (cleaned.toLowerCase().includes('m')) {
      return parseFloat(cleaned.replace(/m/i, '')) * 1000000;
    }
    if (cleaned.toLowerCase().includes('b')) {
      return parseFloat(cleaned.replace(/b/i, '')) * 1000000000;
    }
    
    return parseFloat(cleaned);
  }
  
  return Number(value);
}

async function extractFinancialMetrics(
  data: Record<string, any>,
  reportType: ReportType
): Promise<FinancialMetric[]> {
  const metrics: FinancialMetric[] = [];

  if (reportType === ReportType.INCOME_STATEMENT) {
    // Revenue metrics
    if (data.revenue?.total_revenue) {
      metrics.push({
        name: 'total_revenue',
        value: data.revenue.total_revenue,
        unit: 'currency',
        category: 'revenue',
        confidence: 0.95,
        isDerived: false
      });
    }

    // Expense metrics
    if (data.expenses?.total_expenses) {
      metrics.push({
        name: 'total_expenses',
        value: data.expenses.total_expenses,
        unit: 'currency',
        category: 'expenses',
        confidence: 0.95,
        isDerived: false
      });
    }

    // NOI calculation
    if (data.revenue?.total_revenue && data.expenses?.total_expenses) {
      const noi = data.revenue.total_revenue - data.expenses.total_expenses;
      metrics.push({
        name: 'net_operating_income',
        value: noi,
        unit: 'currency',
        category: 'profitability',
        confidence: 0.90,
        isDerived: true,
        formula: 'total_revenue - total_expenses'
      });
    }
  }

  return metrics;
}
function ensureDataConsistency(
  data: Record<string, any>,
  reportType: ReportType
): Record<string, any> {
  const consistent = { ...data };

  if (reportType === ReportType.INCOME_STATEMENT) {
    // Ensure total calculations are correct
    if (consistent.revenue) {
      const calculatedTotal = Object.entries(consistent.revenue)
        .filter(([key]) => key !== 'total_revenue')
        .reduce((sum, [_, value]) => sum + (value || 0), 0);
      
      if (!consistent.revenue.total_revenue || 
          Math.abs(consistent.revenue.total_revenue - calculatedTotal) > 0.01) {
        consistent.revenue.total_revenue = calculatedTotal;
      }
    }

    if (consistent.expenses) {
      const calculatedTotal = Object.entries(consistent.expenses)
        .filter(([key]) => key !== 'total_expenses')
        .reduce((sum, [_, value]) => sum + (value || 0), 0);
      
      if (!consistent.expenses.total_expenses || 
          Math.abs(consistent.expenses.total_expenses - calculatedTotal) > 0.01) {
        consistent.expenses.total_expenses = calculatedTotal;
      }
    }
  }

  if (reportType === ReportType.BALANCE_SHEET) {
    // Ensure balance sheet equation holds
    const totalAssets = calculateTotalAssets(consistent.assets);
    const totalLiabilities = calculateTotalLiabilities(consistent.liabilities);
    const totalEquity = calculateTotalEquity(consistent.equity);
    
    // Assets = Liabilities + Equity
    const calculatedAssets = totalLiabilities + totalEquity;
    if (Math.abs(totalAssets - calculatedAssets) > 0.01) {
      console.warn('Balance sheet equation does not balance:', {
        assets: totalAssets,
        liabilities: totalLiabilities,
        equity: totalEquity,
        difference: totalAssets - calculatedAssets
      });
    }
  }

  return consistent;
}

function getSchemaForReportType(reportType: ReportType): any {
  switch (reportType) {
    case ReportType.INCOME_STATEMENT:
      return INCOME_STATEMENT_SCHEMA;
    case ReportType.BALANCE_SHEET:
      return BALANCE_SHEET_SCHEMA;
    default:
      return {}; // Custom schema
  }
}

function calculateTotalAssets(assets: any): number {
  if (!assets) return 0;
  return (assets.total_assets || 0) || 
    ((assets.current_assets?.total_current_assets || 0) +
     (assets.fixed_assets?.total_fixed_assets || 0));
}

function calculateTotalLiabilities(liabilities: any): number {
  if (!liabilities) return 0;
  return (liabilities.total_liabilities || 0) ||
    ((liabilities.current_liabilities?.total_current_liabilities || 0) +
     (liabilities.long_term_liabilities?.total_long_term_liabilities || 0));
}

function calculateTotalEquity(equity: any): number {
  if (!equity) return 0;
  return equity.total_equity || 0;
}

// Export helper function for testing
export function normalizeFieldName(field: string): string {
  return field
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}