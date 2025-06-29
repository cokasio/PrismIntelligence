/**
 * CSV Parser Service
 * This module extracts data from CSV files with intelligent format detection
 * Think of it as a flexible reader that can adapt to different CSV dialects
 */

import Papa from 'papaparse';
import { createLogger } from '../../utils/logger';
import { Buffer } from 'buffer';

const logger = createLogger('csv-parser');

/**
 * Define the structure of parsed CSV data
 * CSVs are simpler than Excel but still need careful handling
 */
export interface ParsedCSVData {
  headers: string[];              // Column headers (if detected)
  data: any[][];                 // Raw data rows
  rows: Record<string, any>[];   // Data as objects with headers as keys
  metadata: {
    rowCount: number;
    columnCount: number;
    delimiter: string;
    lineBreak: string;
    hasHeaders: boolean;
    encoding: string;
    parseErrors: Array<{
      type: string;
      code: string;
      message: string;
      row: number;
    }>;
  };
  analysis: {
    dataTypes: Record<string, 'string' | 'number' | 'date' | 'boolean' | 'mixed'>;
    nullCounts: Record<string, number>;
    uniqueValues: Record<string, number>;
    possibleDates: string[];
    possibleNumbers: string[];
    likelyFinancial: boolean;
  };
}

/**
 * CSV Parser class that handles extraction of data from CSV files
 * Includes intelligent detection of formats and data types
 */
export class CSVParser {
  /**
   * Parse a CSV file from a Buffer
   * Automatically detects delimiter, encoding, and headers
   */
  async parse(buffer: Buffer, filename: string = 'data.csv'): Promise<ParsedCSVData> {
    try {
      logger.info('Starting CSV parsing', { 
        bufferSize: buffer.length,
        filename 
      });

      // Convert buffer to string, detecting encoding
      const { text, encoding } = this.detectEncodingAndConvert(buffer);
      
      // Use Papa Parse for robust CSV parsing
      const parseResult = Papa.parse(text, {
        header: false,          // We'll detect headers ourselves
        dynamicTyping: true,    // Automatically convert numbers
        skipEmptyLines: true,   // Remove empty rows
        delimitersToGuess: [',', '\t', '|', ';', ' '],  // Common delimiters
        comments: '#',          // Skip comment lines
        transformHeader: (header) => header.trim(),  // Clean headers
      });

      logger.debug('Initial parse complete', {
        rows: parseResult.data.length,
        errors: parseResult.errors.length,
      });

      // Detect if first row contains headers
      const hasHeaders = this.detectHeaders(parseResult.data);
      const headers = hasHeaders ? 
        parseResult.data[0].map((h: any) => String(h || '').trim()) : 
        this.generateHeaders(parseResult.data[0]?.length || 0);
      
      // Separate headers from data
      const dataRows = hasHeaders ? parseResult.data.slice(1) : parseResult.data;
      
      // Convert to object format if we have headers
      const rowObjects = this.convertToObjects(headers, dataRows);
      
      // Analyze the data
      const analysis = this.analyzeData(headers, dataRows);
      
      // Build the parsed data structure
      const parsedData: ParsedCSVData = {
        headers,
        data: dataRows,
        rows: rowObjects,
        metadata: {
          rowCount: dataRows.length,
          columnCount: headers.length,
          delimiter: parseResult.meta.delimiter || ',',
          lineBreak: parseResult.meta.linebreak || '\n',
          hasHeaders,
          encoding,
          parseErrors: parseResult.errors.map(err => ({
            type: err.type,
            code: err.code,
            message: err.message,
            row: err.row || -1,
          })),
        },
        analysis,
      };

      logger.info('CSV parsing completed', {
        rowCount: parsedData.metadata.rowCount,
        columnCount: parsedData.metadata.columnCount,
        delimiter: parsedData.metadata.delimiter,
        hasHeaders: parsedData.metadata.hasHeaders,
      });

      return parsedData;

    } catch (error) {
      logger.error('Failed to parse CSV file', { error, filename });
      throw new Error(`CSV parsing failed: ${error.message}`);
    }
  }

  /**
   * Detect encoding and convert buffer to string
   * Handles UTF-8, UTF-16, and ASCII encodings
   */
  private detectEncodingAndConvert(buffer: Buffer): { text: string; encoding: string } {
    // Check for BOM (Byte Order Mark)
    if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
      // UTF-8 BOM
      return {
        text: buffer.toString('utf8', 3),
        encoding: 'utf8-bom',
      };
    } else if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
      // UTF-16 LE BOM
      return {
        text: buffer.toString('utf16le', 2),
        encoding: 'utf16le',
      };
    } else if (buffer[0] === 0xFE && buffer[1] === 0xFF) {
      // UTF-16 BE BOM
      return {
        text: buffer.swap16().toString('utf16le', 2),
        encoding: 'utf16be',
      };
    }
    
    // No BOM - assume UTF-8
    return {
      text: buffer.toString('utf8'),
      encoding: 'utf8',
    };
  }

  /**
   * Detect if the first row contains headers
   * Headers typically don't contain numbers and have consistent types
   */
  private detectHeaders(data: any[][]): boolean {
    if (data.length < 2) return false;
    
    const firstRow = data[0];
    const secondRow = data[1];
    
    // Check if first row is all strings and second row has mixed types
    const firstRowAllStrings = firstRow.every(cell => 
      typeof cell === 'string' && isNaN(Number(cell))
    );
    
    const secondRowHasNumbers = secondRow.some(cell => 
      typeof cell === 'number' || !isNaN(Number(cell))
    );
    
    // If first row is all text and second row has numbers, likely headers
    if (firstRowAllStrings && secondRowHasNumbers) {
      return true;
    }
    
    // Check for common header patterns
    const commonHeaders = [
      'date', 'name', 'id', 'amount', 'total', 'description',
      'property', 'unit', 'tenant', 'rent', 'balance', 'status'
    ];
    
    const firstRowLower = firstRow.map(cell => 
      String(cell).toLowerCase().trim()
    );
    
    const hasCommonHeaders = firstRowLower.some(header => 
      commonHeaders.some(common => header.includes(common))
    );
    
    return hasCommonHeaders;
  }

  /**
   * Generate generic headers if none detected
   * Creates Column1, Column2, etc.
   */
  private generateHeaders(columnCount: number): string[] {
    return Array.from({ length: columnCount }, (_, i) => `Column${i + 1}`);
  }

  /**
   * Convert array data to objects using headers as keys
   * Makes the data easier to work with in subsequent processing
   */
  private convertToObjects(headers: string[], dataRows: any[][]): Record<string, any>[] {
    return dataRows.map(row => {
      const obj: Record<string, any> = {};
      
      headers.forEach((header, index) => {
        obj[header] = row[index] !== undefined ? row[index] : null;
      });
      
      return obj;
    });
  }

  /**
   * Analyze the data to understand its structure and content
   * This helps the AI understand what kind of data it's dealing with
   */
  private analyzeData(headers: string[], dataRows: any[][]): ParsedCSVData['analysis'] {
    const analysis: ParsedCSVData['analysis'] = {
      dataTypes: {},
      nullCounts: {},
      uniqueValues: {},
      possibleDates: [],
      possibleNumbers: [],
      likelyFinancial: false,
    };

    // Initialize counters
    headers.forEach(header => {
      analysis.nullCounts[header] = 0;
      analysis.uniqueValues[header] = 0;
    });

    // Type detection for each column
    const columnTypes: Record<string, Record<string, number>> = {};
    headers.forEach(header => {
      columnTypes[header] = {
        string: 0,
        number: 0,
        date: 0,
        boolean: 0,
        null: 0,
      };
    });

    // Analyze each row
    dataRows.forEach(row => {
      headers.forEach((header, colIndex) => {
        const value = row[colIndex];
        
        if (value === null || value === undefined || value === '') {
          analysis.nullCounts[header]++;
          columnTypes[header].null++;
        } else if (typeof value === 'number') {
          columnTypes[header].number++;
        } else if (typeof value === 'boolean') {
          columnTypes[header].boolean++;
        } else if (this.looksLikeDate(value)) {
          columnTypes[header].date++;
        } else {
          columnTypes[header].string++;
        }
      });
    });

    // Determine primary type for each column
    headers.forEach(header => {
      const types = columnTypes[header];
      const total = dataRows.length - types.null;
      
      if (total === 0) {
        analysis.dataTypes[header] = 'string';
      } else if (types.number / total > 0.8) {
        analysis.dataTypes[header] = 'number';
        analysis.possibleNumbers.push(header);
        
        // Check if it's financial data
        if (this.looksLikeFinancialColumn(header)) {
          analysis.likelyFinancial = true;
        }
      } else if (types.date / total > 0.8) {
        analysis.dataTypes[header] = 'date';
        analysis.possibleDates.push(header);
      } else if (types.boolean / total > 0.8) {
        analysis.dataTypes[header] = 'boolean';
      } else if (types.string / total > 0.5) {
        analysis.dataTypes[header] = 'string';
      } else {
        analysis.dataTypes[header] = 'mixed';
      }
      
      // Count unique values (for first 1000 rows to avoid memory issues)
      const uniqueVals = new Set(
        dataRows.slice(0, 1000)
          .map(row => row[headers.indexOf(header)])
          .filter(val => val !== null && val !== undefined)
      );
      analysis.uniqueValues[header] = uniqueVals.size;
    });

    return analysis;
  }

  /**
   * Check if a value looks like a date
   * Similar to Excel parser but adapted for CSV data
   */
  private looksLikeDate(value: any): boolean {
    if (value instanceof Date) return true;
    if (typeof value !== 'string') return false;
    
    // Common date patterns in CSV files
    const datePatterns = [
      /^\d{1,2}\/\d{1,2}\/\d{2,4}$/,     // MM/DD/YYYY or M/D/YY
      /^\d{1,2}-\d{1,2}-\d{2,4}$/,       // MM-DD-YYYY
      /^\d{4}-\d{2}-\d{2}$/,              // YYYY-MM-DD
      /^\d{8}$/,                          // YYYYMMDD
      /^\d{1,2}\.\d{1,2}\.\d{2,4}$/,     // DD.MM.YYYY (European)
    ];
    
    const trimmedValue = value.trim();
    return datePatterns.some(pattern => pattern.test(trimmedValue));
  }

  /**
   * Check if a column header suggests financial data
   * Used to identify the type of report we're dealing with
   */
  private looksLikeFinancialColumn(header: string): boolean {
    const financialTerms = [
      'amount', 'balance', 'total', 'subtotal', 'payment',
      'revenue', 'expense', 'income', 'cost', 'price',
      'rent', 'fee', 'charge', 'deposit', 'debit', 'credit',
      'budget', 'actual', 'variance', 'due', 'paid', 'outstanding'
    ];
    
    const lowerHeader = header.toLowerCase();
    return financialTerms.some(term => lowerHeader.includes(term));
  }

  /**
   * Convert parsed CSV data to a format suitable for AI analysis
   * Creates a structured text representation
   */
  toAnalysisFormat(parsedData: ParsedCSVData): string {
    let output = `CSV Report Analysis\n`;
    output += `==================\n\n`;
    output += `Total Rows: ${parsedData.metadata.rowCount}\n`;
    output += `Total Columns: ${parsedData.metadata.columnCount}\n`;
    output += `Delimiter: "${parsedData.metadata.delimiter}"\n`;
    output += `Has Headers: ${parsedData.metadata.hasHeaders}\n`;
    
    if (parsedData.analysis.likelyFinancial) {
      output += `\nThis appears to be a financial report.\n`;
    }
    
    output += `\nColumn Analysis:\n`;
    output += `----------------\n`;
    
    parsedData.headers.forEach((header, index) => {
      const dataType = parsedData.analysis.dataTypes[header];
      const nullCount = parsedData.analysis.nullCounts[header];
      const uniqueCount = parsedData.analysis.uniqueValues[header];
      
      output += `\n"${header}":\n`;
      output += `  Type: ${dataType}\n`;
      output += `  Unique Values: ${uniqueCount}\n`;
      output += `  Null/Empty: ${nullCount} (${(nullCount / parsedData.metadata.rowCount * 100).toFixed(1)}%)\n`;
      
      // Sample values (first 5 non-null)
      const sampleValues = parsedData.data
        .map(row => row[index])
        .filter(val => val !== null && val !== undefined && val !== '')
        .slice(0, 5);
      
      if (sampleValues.length > 0) {
        output += `  Sample Values: ${sampleValues.join(', ')}\n`;
      }
    });
    
    // Include first few rows as a table
    if (parsedData.data.length > 0) {
      output += `\nSample Data (first 10 rows):\n`;
      output += `---------------------------\n`;
      
      // Headers
      output += parsedData.headers.join(' | ') + '\n';
      output += parsedData.headers.map(() => '---').join(' | ') + '\n';
      
      // Data rows
      const sampleRows = parsedData.data.slice(0, 10);
      sampleRows.forEach(row => {
        const formattedRow = row.map(cell => 
          cell === null || cell === undefined ? '' : String(cell)
        ).join(' | ');
        output += formattedRow + '\n';
      });
    }
    
    // Summary statistics for numeric columns
    const numericColumns = parsedData.analysis.possibleNumbers;
    if (numericColumns.length > 0) {
      output += `\nNumeric Column Summary:\n`;
      output += `----------------------\n`;
      
      numericColumns.forEach(col => {
        const values = parsedData.rows
          .map(row => row[col])
          .filter(val => typeof val === 'number' && !isNaN(val));
        
        if (values.length > 0) {
          const sum = values.reduce((a, b) => a + b, 0);
          const avg = sum / values.length;
          const min = Math.min(...values);
          const max = Math.max(...values);
          
          output += `\n"${col}":\n`;
          output += `  Count: ${values.length}\n`;
          output += `  Sum: ${sum.toLocaleString()}\n`;
          output += `  Average: ${avg.toLocaleString()}\n`;
          output += `  Min: ${min.toLocaleString()}\n`;
          output += `  Max: ${max.toLocaleString()}\n`;
        }
      });
    }
    
    return output;
  }

  /**
   * Extract specific metrics from CSV data
   * Useful for standardized reports like rent rolls
   */
  extractMetrics(parsedData: ParsedCSVData): Record<string, any> {
    const metrics: Record<string, any> = {};
    
    // Look for common property management metrics
    const metricPatterns = {
      totalRent: ['total rent', 'rent total', 'monthly rent'],
      occupancy: ['occupancy', 'occupied', 'vacancy'],
      balance: ['balance', 'outstanding', 'due'],
      collected: ['collected', 'paid', 'received'],
    };
    
    Object.entries(metricPatterns).forEach(([metricName, patterns]) => {
      // Find columns that match the patterns
      const matchingColumns = parsedData.headers.filter(header => 
        patterns.some(pattern => 
          header.toLowerCase().includes(pattern)
        )
      );
      
      if (matchingColumns.length > 0) {
        // Try to extract the value (sum for numeric columns)
        const columnData = parsedData.rows.map(row => row[matchingColumns[0]]);
        const numericValues = columnData
          .filter(val => typeof val === 'number' && !isNaN(val));
        
        if (numericValues.length > 0) {
          metrics[metricName] = numericValues.reduce((a, b) => a + b, 0);
        }
      }
    });
    
    // Calculate occupancy rate if we have unit counts
    const totalUnits = this.findTotalUnits(parsedData);
    const occupiedUnits = this.findOccupiedUnits(parsedData);
    
    if (totalUnits > 0 && occupiedUnits >= 0) {
      metrics.occupancyRate = (occupiedUnits / totalUnits) * 100;
      metrics.totalUnits = totalUnits;
      metrics.occupiedUnits = occupiedUnits;
    }
    
    return metrics;
  }

  /**
   * Helper: Find total unit count from CSV data
   */
  private findTotalUnits(parsedData: ParsedCSVData): number {
    // This would be more sophisticated in production
    // For now, just count rows that look like unit entries
    return parsedData.metadata.rowCount;
  }

  /**
   * Helper: Find occupied unit count from CSV data
   */
  private findOccupiedUnits(parsedData: ParsedCSVData): number {
    // Look for status columns
    const statusColumns = parsedData.headers.filter(h => 
      h.toLowerCase().includes('status') || 
      h.toLowerCase().includes('occupied')
    );
    
    if (statusColumns.length === 0) return -1;
    
    // Count occupied units
    return parsedData.rows.filter(row => {
      const status = row[statusColumns[0]];
      return status && 
        (status.toString().toLowerCase().includes('occupied') ||
         status.toString().toLowerCase() === 'active');
    }).length;
  }
}

// Export a singleton instance for easy use
export const csvParser = new CSVParser();

/**
 * Example usage:
 * 
 * import { csvParser } from './parsers/csv';
 * 
 * const fileBuffer = await fs.readFile('rent-roll.csv');
 * const parsedData = await csvParser.parse(fileBuffer, 'rent-roll.csv');
 * 
 * console.log('Rows:', parsedData.metadata.rowCount);
 * console.log('Financial data:', parsedData.analysis.likelyFinancial);
 * 
 * // Extract metrics
 * const metrics = csvParser.extractMetrics(parsedData);
 * console.log('Total Rent:', metrics.totalRent);
 * console.log('Occupancy Rate:', metrics.occupancyRate);
 * 
 * // Convert to AI-friendly format
 * const analysisText = csvParser.toAnalysisFormat(parsedData);
 */