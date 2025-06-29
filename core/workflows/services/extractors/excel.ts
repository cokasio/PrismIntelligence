// Excel file extractor for financial reports
import * as XLSX from 'xlsx';
import { ExtractedData, ClassificationResult } from '../../types';

export async function extract(
  content: Buffer | ArrayBuffer,
  classification: ClassificationResult
): Promise<ExtractedData> {
  try {
    // Read the workbook
    const workbook = XLSX.read(content, {
      type: 'buffer',
      cellDates: true,
      cellNF: true,
      cellStyles: true,
      cellFormula: true
    });

    // Extract data from all sheets
    const extractedData: ExtractedData = {
      fields: {},
      tables: [],
      metadata: {
        currency: 'USD',
        period: classification.timePeriod
      }
    };

    // Process each sheet
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const sheetData = extractSheetData(sheet, sheetName, classification);
      
      // Merge extracted data
      extractedData.fields = { ...extractedData.fields, ...sheetData.fields };
      extractedData.tables.push(...sheetData.tables);
      
      // Extract metadata from sheet
      const sheetMetadata = extractSheetMetadata(sheet);
      if (sheetMetadata.currency) {
        extractedData.metadata.currency = sheetMetadata.currency;
      }
    }

    return extractedData;
  } catch (error) {
    console.error('Excel extraction error:', error);
    throw new Error(`Failed to extract Excel file: ${error.message}`);
  }
}

function extractSheetData(
  sheet: XLSX.WorkSheet,
  sheetName: string,
  classification: ClassificationResult
): ExtractedData {
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  const data: ExtractedData = {
    fields: {},
    tables: [],
    metadata: {}
  };

  // Convert to array of arrays
  const rows = XLSX.utils.sheet_to_json(sheet, { 
    header: 1,
    raw: false,
    dateNF: 'YYYY-MM-DD'
  }) as any[][];

  if (rows.length === 0) return data;

  // Identify table structure
  const tableInfo = identifyTableStructure(rows, classification);

  if (tableInfo.isTable) {
    // Extract as table
    const table = {
      name: sheetName,
      headers: tableInfo.headers,
      rows: rows.slice(tableInfo.dataStartRow)
    };
    data.tables.push(table);

    // Also extract key-value pairs from table
    if (classification.reportType === 'income_statement' || 
        classification.reportType === 'balance_sheet') {
      data.fields = extractFieldsFromTable(table, classification);
    }
  } else {
    // Extract as key-value pairs
    data.fields = extractKeyValuePairs(rows);
  }

  return data;
}

function identifyTableStructure(
  rows: any[][],
  classification: ClassificationResult
): {
  isTable: boolean;
  headers: string[];
  dataStartRow: number;
} {
  // Look for header row patterns
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const row = rows[i];
    
    // Check if this could be a header row
    if (row && row.length > 1) {
      const nonEmptyCells = row.filter(cell => cell && cell.toString().trim());
      
      // Header row typically has multiple text values
      if (nonEmptyCells.length >= 2) {
        const hasNumbers = nonEmptyCells.some(cell => 
          !isNaN(parseFloat(cell.toString().replace(/[$,]/g, '')))
        );
        
        // If mostly text, likely headers
        if (!hasNumbers || nonEmptyCells.length > 3) {
          return {
            isTable: true,
            headers: row.map(cell => cell?.toString() || ''),
            dataStartRow: i + 1
          };
        }
      }
    }
  }

  return {
    isTable: false,
    headers: [],
    dataStartRow: 0
  };
}

function extractFieldsFromTable(
  table: { headers: string[]; rows: any[][] },
  classification: ClassificationResult
): Record<string, any> {
  const fields: Record<string, any> = {};

  // Find the account/description column (usually first)
  const accountColIndex = 0;
  
  // Find value columns (usually contain years or periods)
  const valueColumns: { index: number; period: string }[] = [];
  table.headers.forEach((header, index) => {
    if (index > 0 && header) {
      // Check if header contains year or period indicator
      const yearMatch = header.toString().match(/20\d{2}/);
      if (yearMatch || header.toLowerCase().includes('total')) {
        valueColumns.push({ index, period: header.toString() });
      }
    }
  });

  // Extract values
  table.rows.forEach(row => {
    const accountName = row[accountColIndex]?.toString().trim();
    if (accountName) {
      // Use the most recent period or total column
      const valueCol = valueColumns[valueColumns.length - 1];
      if (valueCol) {
        const value = row[valueCol.index];
        if (value !== undefined && value !== null && value !== '') {
          fields[accountName] = parseFinancialValue(value);
        }
      }
    }
  });

  return fields;
}

function extractKeyValuePairs(rows: any[][]): Record<string, any> {
  const fields: Record<string, any> = {};

  rows.forEach(row => {
    if (row.length >= 2) {
      const key = row[0]?.toString().trim();
      const value = row[1];
      
      if (key && value !== undefined && value !== null && value !== '') {
        fields[key] = parseFinancialValue(value);
      }
    }
  });

  return fields;
}

function parseFinancialValue(value: any): any {
  if (value === null || value === undefined) return null;
  
  const strValue = value.toString().trim();
  
  // Check if it's already a number
  if (typeof value === 'number') return value;
  
  // Remove currency symbols and commas
  const cleaned = strValue.replace(/[$,]/g, '');
  
  // Handle parentheses for negative numbers
  if (cleaned.includes('(') && cleaned.includes(')')) {
    const num = parseFloat(cleaned.replace(/[()]/g, ''));
    return -num;
  }
  
  // Handle percentages
  if (cleaned.includes('%')) {
    return parseFloat(cleaned.replace('%', '')) / 100;
  }
  
  // Try to parse as number
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? strValue : parsed;
}

function extractSheetMetadata(sheet: XLSX.WorkSheet): {
  currency?: string;
  period?: { start: Date; end: Date };
} {
  const metadata: any = {};

  // Look for currency indicators in cells
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  for (let row = range.s.r; row <= Math.min(range.e.r, 20); row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = sheet[cellAddress];
      
      if (cell && cell.v) {
        const value = cell.v.toString();
        
        // Check for currency
        if (value.includes('USD') || value.includes('$')) {
          metadata.currency = 'USD';
        } else if (value.includes('EUR') || value.includes('€')) {
          metadata.currency = 'EUR';
        } else if (value.includes('GBP') || value.includes('£')) {
          metadata.currency = 'GBP';
        }
      }
    }
  }

  return metadata;
}

// Export for testing
export function parseExcelDate(excelDate: number): Date {
  // Excel dates are number of days since 1900-01-01
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  return date;
}