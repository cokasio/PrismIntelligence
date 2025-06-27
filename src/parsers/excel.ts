/**
 * Excel Parser Service
 * This module extracts data from Excel files (both .xlsx and .xls formats)
 * Think of it as an expert accountant who can read complex spreadsheets and understand their meaning
 */

import XLSX from 'xlsx';
import { createLogger } from '../../utils/logger';

const logger = createLogger('excel-parser');

/**
 * Define the structure of parsed Excel data
 * Excel files are more structured than PDFs, which makes extraction more reliable
 */
export interface ParsedExcelData {
  sheets: Array<{
    name: string;
    data: any[][];              // Raw cell data
    headers: string[];          // First row if it looks like headers
    formulas: Array<{           // Formulas found in cells
      cell: string;
      formula: string;
      value: any;
    }>;
    mergedCells: Array<{        // Merged cell ranges
      start: { row: number; col: number };
      end: { row: number; col: number };
    }>;
    dataRange: {                // The bounds of actual data
      minRow: number;
      maxRow: number;
      minCol: number;
      maxCol: number;
    };
  }>;
  metadata: {
    sheetCount: number;
    totalRows: number;
    totalCols: number;
    hasFormulas: boolean;
    hasMergedCells: boolean;
    fileType: string;
  };
  summary: {                    // Quick summary of what was found
    likelyFinancialData: boolean;
    dateColumns: string[];
    numericColumns: string[];
    possibleMetrics: string[];
  };
}

/**
 * Excel Parser class that handles extraction of data from Excel files
 * Optimized for property management reports with financial data
 */
export class ExcelParser {
  /**
   * Parse an Excel file from a Buffer
   * Handles both modern .xlsx and legacy .xls formats
   */
  async parse(buffer: Buffer, filename: string = 'unknown.xlsx'): Promise<ParsedExcelData> {
    try {
      logger.info('Starting Excel parsing', { 
        bufferSize: buffer.length,
        filename 
      });

      // Read the workbook
      const workbook = XLSX.read(buffer, {
        type: 'buffer',
        cellFormulas: true,      // Preserve formulas
        cellStyles: true,        // Preserve styling (helps identify headers)
        cellDates: true,         // Parse dates properly
        sheetStubs: true,        // Include empty cells
        bookVBA: false,          // Skip VBA macros for security
      });

      logger.debug('Workbook loaded', {
        sheetCount: workbook.SheetNames.length,
        sheets: workbook.SheetNames,
      });

      // Process each worksheet
      const sheets = workbook.SheetNames.map(sheetName => 
        this.parseSheet(workbook.Sheets[sheetName], sheetName)
      );

      // Calculate metadata
      const totalRows = sheets.reduce((sum, sheet) => sum + sheet.data.length, 0);
      const totalCols = sheets.reduce((max, sheet) => 
        Math.max(max, sheet.data[0]?.length || 0), 0
      );
      const hasFormulas = sheets.some(sheet => sheet.formulas.length > 0);
      const hasMergedCells = sheets.some(sheet => sheet.mergedCells.length > 0);

      // Generate summary insights
      const summary = this.generateSummary(sheets);

      const parsedData: ParsedExcelData = {
        sheets,
        metadata: {
          sheetCount: sheets.length,
          totalRows,
          totalCols,
          hasFormulas,
          hasMergedCells,
          fileType: filename.toLowerCase().endsWith('.xls') ? 'xls' : 'xlsx',
        },
        summary,
      };

      logger.info('Excel parsing completed', {
        sheetCount: parsedData.metadata.sheetCount,
        totalRows: parsedData.metadata.totalRows,
        hasFormulas: parsedData.metadata.hasFormulas,
      });

      return parsedData;

    } catch (error) {
      logger.error('Failed to parse Excel file', { error, filename });
      throw new Error(`Excel parsing failed: ${error.message}`);
    }
  }

  /**
   * Parse an individual worksheet
   * This is where the real work happens - converting cells to usable data
   */
  private parseSheet(worksheet: XLSX.WorkSheet, sheetName: string): ParsedExcelData['sheets'][0] {
    // Get the range of cells with data
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
    
    // Extract all data as a 2D array
    const data: any[][] = [];
    const formulas: ParsedExcelData['sheets'][0]['formulas'] = [];
    
    for (let row = range.s.r; row <= range.e.r; row++) {
      const rowData: any[] = [];
      
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];
        
        if (cell) {
          // Extract the value
          let value = cell.v;
          
          // Handle different cell types
          if (cell.t === 'd') {
            // Date cell - convert to ISO string
            value = cell.v instanceof Date ? cell.v.toISOString() : cell.v;
          } else if (cell.t === 'n' && cell.z) {
            // Formatted number - preserve the display format
            value = cell.w || cell.v;
          }
          
          rowData.push(value);
          
          // Track formulas
          if (cell.f) {
            formulas.push({
              cell: cellAddress,
              formula: cell.f,
              value: cell.v,
            });
          }
        } else {
          rowData.push(null);
        }
      }
      
      data.push(rowData);
    }

    // Detect headers (first non-empty row that looks like headers)
    const headers = this.detectHeaders(data);
    
    // Extract merged cells
    const mergedCells = this.extractMergedCells(worksheet);

    return {
      name: sheetName,
      data,
      headers,
      formulas,
      mergedCells,
      dataRange: {
        minRow: range.s.r,
        maxRow: range.e.r,
        minCol: range.s.c,
        maxCol: range.e.c,
      },
    };
  }

  /**
   * Detect if the first row contains headers
   * Headers typically have text values and no numbers
   */
  private detectHeaders(data: any[][]): string[] {
    if (data.length === 0) return [];
    
    // Find the first non-empty row
    let headerRow: any[] | undefined;
    let headerRowIndex = -1;
    
    for (let i = 0; i < Math.min(data.length, 10); i++) {
      const row = data[i];
      const nonEmptyCount = row.filter(cell => cell !== null && cell !== undefined).length;
      
      if (nonEmptyCount > row.length / 2) { // More than half the cells have values
        headerRow = row;
        headerRowIndex = i;
        break;
      }
    }
    
    if (!headerRow) return [];
    
    // Check if this row looks like headers
    const isLikelyHeaders = headerRow.every(cell => {
      if (cell === null || cell === undefined) return true;
      
      // Headers are usually strings, not numbers
      if (typeof cell === 'string') return true;
      
      // Sometimes headers might be dates (like month names)
      if (cell instanceof Date) return false;
      
      // Numbers are unlikely to be headers unless they're years
      if (typeof cell === 'number') {
        return cell >= 2000 && cell <= 2100; // Possibly a year
      }
      
      return false;
    });
    
    if (isLikelyHeaders) {
      return headerRow.map(cell => 
        cell === null || cell === undefined ? '' : String(cell).trim()
      );
    }
    
    return [];
  }

  /**
   * Extract merged cell ranges from the worksheet
   * Merged cells often indicate report sections or totals
   */
  private extractMergedCells(worksheet: XLSX.WorkSheet): ParsedExcelData['sheets'][0]['mergedCells'] {
    const mergedCells: ParsedExcelData['sheets'][0]['mergedCells'] = [];
    
    if (worksheet['!merges']) {
      worksheet['!merges'].forEach(merge => {
        mergedCells.push({
          start: { row: merge.s.r, col: merge.s.c },
          end: { row: merge.e.r, col: merge.e.c },
        });
      });
    }
    
    return mergedCells;
  }

  /**
   * Generate a summary of what's in the Excel file
   * This helps the AI understand the data structure quickly
   */
  private generateSummary(sheets: ParsedExcelData['sheets']): ParsedExcelData['summary'] {
    const dateColumns = new Set<string>();
    const numericColumns = new Set<string>();
    const possibleMetrics = new Set<string>();
    let likelyFinancialData = false;

    sheets.forEach(sheet => {
      if (sheet.headers.length > 0 && sheet.data.length > 1) {
        // Analyze each column
        sheet.headers.forEach((header, colIndex) => {
          if (!header) return;
          
          const columnData = sheet.data.slice(1).map(row => row[colIndex]);
          const columnType = this.detectColumnType(columnData);
          
          if (columnType === 'date') {
            dateColumns.add(header);
          } else if (columnType === 'numeric') {
            numericColumns.add(header);
            
            // Check if this might be a financial metric
            if (this.looksLikeFinancialColumn(header)) {
              possibleMetrics.add(header);
              likelyFinancialData = true;
            }
          }
        });
      }

      // Check for financial indicators in sheet names
      const financialSheetNames = ['income', 'expense', 'revenue', 'balance', 'cash', 'p&l'];
      if (financialSheetNames.some(name => sheet.name.toLowerCase().includes(name))) {
        likelyFinancialData = true;
      }

      // Check for formulas that suggest financial calculations
      if (sheet.formulas.some(f => 
        f.formula.includes('SUM') || 
        f.formula.includes('AVERAGE') ||
        f.formula.includes('IF'))) {
        likelyFinancialData = true;
      }
    });

    return {
      likelyFinancialData,
      dateColumns: Array.from(dateColumns),
      numericColumns: Array.from(numericColumns),
      possibleMetrics: Array.from(possibleMetrics),
    };
  }

  /**
   * Detect the type of data in a column
   * Helps identify date columns, numeric columns, etc.
   */
  private detectColumnType(columnData: any[]): 'date' | 'numeric' | 'text' | 'mixed' {
    const types = new Set<string>();
    let dateCount = 0;
    let numberCount = 0;
    let textCount = 0;
    
    columnData.forEach(value => {
      if (value === null || value === undefined || value === '') return;
      
      if (value instanceof Date || this.looksLikeDate(value)) {
        dateCount++;
        types.add('date');
      } else if (typeof value === 'number' || this.looksLikeNumber(value)) {
        numberCount++;
        types.add('numeric');
      } else {
        textCount++;
        types.add('text');
      }
    });
    
    const total = dateCount + numberCount + textCount;
    if (total === 0) return 'text';
    
    // If more than 80% of values are one type, consider it that type
    if (dateCount / total > 0.8) return 'date';
    if (numberCount / total > 0.8) return 'numeric';
    if (textCount / total > 0.8) return 'text';
    
    return 'mixed';
  }

  /**
   * Check if a value looks like a date
   * Handles various date formats common in property reports
   */
  private looksLikeDate(value: any): boolean {
    if (typeof value !== 'string') return false;
    
    // Common date patterns
    const datePatterns = [
      /^\d{1,2}\/\d{1,2}\/\d{2,4}$/,     // MM/DD/YYYY or M/D/YY
      /^\d{1,2}-\d{1,2}-\d{2,4}$/,       // MM-DD-YYYY
      /^\d{4}-\d{2}-\d{2}$/,              // YYYY-MM-DD
      /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}$/i,
      /^\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}$/i,
    ];
    
    return datePatterns.some(pattern => pattern.test(value.trim()));
  }

  /**
   * Check if a value looks like a number
   * Handles formatted numbers with $, commas, percentages
   */
  private looksLikeNumber(value: any): boolean {
    if (typeof value === 'number') return true;
    if (typeof value !== 'string') return false;
    
    // Remove common number formatting
    const cleaned = value
      .replace(/[$,]/g, '')  // Remove $ and commas
      .replace(/%$/, '')     // Remove trailing %
      .trim();
    
    return !isNaN(parseFloat(cleaned)) && isFinite(parseFloat(cleaned));
  }

  /**
   * Check if a column header suggests financial data
   * Uses common accounting terminology
   */
  private looksLikeFinancialColumn(header: string): boolean {
    const financialTerms = [
      'revenue', 'income', 'expense', 'cost', 'profit', 'loss',
      'total', 'subtotal', 'amount', 'balance', 'payment',
      'rent', 'fee', 'charge', 'credit', 'debit', 'cash',
      'budget', 'actual', 'variance', 'ytd', 'mtd', 'gross', 'net'
    ];
    
    const lowerHeader = header.toLowerCase();
    return financialTerms.some(term => lowerHeader.includes(term));
  }

  /**
   * Convert parsed Excel data to a format suitable for AI analysis
   * This creates a text representation that Claude can understand
   */
  toAnalysisFormat(parsedData: ParsedExcelData): string {
    let output = `Excel Report Analysis\n`;
    output += `==================\n\n`;
    output += `Total Sheets: ${parsedData.metadata.sheetCount}\n`;
    output += `Total Data Rows: ${parsedData.metadata.totalRows}\n`;
    
    if (parsedData.summary.likelyFinancialData) {
      output += `\nThis appears to be a financial report.\n`;
      output += `Detected Metrics: ${parsedData.summary.possibleMetrics.join(', ')}\n`;
      output += `Date Columns: ${parsedData.summary.dateColumns.join(', ')}\n`;
    }
    
    output += `\nSheet Details:\n`;
    output += `--------------\n`;
    
    parsedData.sheets.forEach(sheet => {
      output += `\nSheet: "${sheet.name}"\n`;
      
      if (sheet.headers.length > 0) {
        output += `Headers: ${sheet.headers.filter(h => h).join(' | ')}\n`;
      }
      
      output += `Data Rows: ${sheet.data.length}\n`;
      
      if (sheet.formulas.length > 0) {
        output += `Contains ${sheet.formulas.length} formulas\n`;
      }
      
      // Include first few rows of data as sample
      if (sheet.data.length > 0) {
        output += `\nSample Data (first 5 rows):\n`;
        const sampleRows = sheet.data.slice(0, 5);
        
        sampleRows.forEach((row, idx) => {
          const formattedRow = row
            .map(cell => cell === null ? '' : String(cell))
            .join(' | ');
          output += `Row ${idx + 1}: ${formattedRow}\n`;
        });
      }
    });
    
    return output;
  }
}

// Export a singleton instance for easy use
export const excelParser = new ExcelParser();

/**
 * Example usage:
 * 
 * import { excelParser } from './parsers/excel';
 * 
 * const fileBuffer = await fs.readFile('financial-report.xlsx');
 * const parsedData = await excelParser.parse(fileBuffer, 'financial-report.xlsx');
 * 
 * console.log('Sheets found:', parsedData.metadata.sheetCount);
 * console.log('Likely financial data:', parsedData.summary.likelyFinancialData);
 * 
 * // Convert to AI-friendly format
 * const analysisText = excelParser.toAnalysisFormat(parsedData);
 * // Send analysisText to Claude for processing
 */