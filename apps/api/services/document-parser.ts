/**
 * Document Parser Service
 * Extracts structured data from various document formats
 */

import * as pdfParse from 'pdf-parse';
import * as XLSX from 'xlsx';
import { parse as parseCSV } from 'csv-parse/sync';

export interface ParsedDocument {
  type: 'financial' | 'lease' | 'maintenance' | 'general';
  format: 'pdf' | 'excel' | 'csv';
  extractedText: string;
  structuredData: any;
  metadata: DocumentMetadata;
  tables?: ExtractedTable[];
}

export interface DocumentMetadata {
  filename: string;
  fileSize: number;
  pageCount?: number;
  author?: string;
  createdDate?: Date;
  extractedDate: Date;
  confidence: number;
}

export interface ExtractedTable {
  name: string;
  headers: string[];
  rows: any[][];
  analysis?: TableAnalysis;
}

export interface TableAnalysis {
  totals?: Record<string, number>;
  averages?: Record<string, number>;
  trends?: Record<string, 'increasing' | 'decreasing' | 'stable'>;
}

export class DocumentParser {
  /**
   * Main entry point for document parsing
   */
  async parseDocument(
    buffer: Buffer,
    filename: string,
    mimeType?: string
  ): Promise<ParsedDocument> {
    const format = this.detectFormat(filename, mimeType);
    
    switch (format) {
      case 'pdf':
        return this.parsePDF(buffer, filename);
      case 'excel':
        return this.parseExcel(buffer, filename);
      case 'csv':
        return this.parseCSV(buffer, filename);
      default:
        throw new Error(`Unsupported file format: ${format}`);
    }
  }

  /**
   * Parse PDF documents
   */
  private async parsePDF(buffer: Buffer, filename: string): Promise<ParsedDocument> {
    try {
      const data = await pdfParse(buffer);
      
      // Extract financial data patterns
      const financialPatterns = this.extractFinancialPatterns(data.text);
      const documentType = this.detectDocumentType(data.text, filename);
      
      return {
        type: documentType,
        format: 'pdf',
        extractedText: data.text,
        structuredData: financialPatterns,
        metadata: {
          filename,
          fileSize: buffer.length,
          pageCount: data.numpages,
          extractedDate: new Date(),
          confidence: this.calculateConfidence(data.text)
        }
      };
    } catch (error) {
      console.error('PDF parsing error:', error);
      throw new Error('Failed to parse PDF document');
    }
  }

  /**
   * Parse Excel documents
   */
  private parseExcel(buffer: Buffer, filename: string): ParsedDocument {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const tables: ExtractedTable[] = [];
      let combinedText = '';
      let structuredData: any = {};

      // Process each sheet
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length > 0) {
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1) as any[][];
          
          // Analyze the table
          const analysis = this.analyzeTable(headers, rows);
          
          tables.push({
            name: sheetName,
            headers,
            rows,
            analysis
          });
          
          // Extract text for analysis
          combinedText += `Sheet: ${sheetName}\n`;
          jsonData.forEach(row => {
            combinedText += row.join(' ') + '\n';
          });
          
          // Structure data by sheet
          structuredData[sheetName] = this.structureTableData(headers, rows);
        }
      });
      
      const documentType = this.detectDocumentType(combinedText, filename);
      
      return {
        type: documentType,
        format: 'excel',
        extractedText: combinedText,
        structuredData,
        tables,
        metadata: {
          filename,
          fileSize: buffer.length,
          extractedDate: new Date(),
          confidence: 0.95 // Excel data is highly structured
        }
      };
    } catch (error) {
      console.error('Excel parsing error:', error);
      throw new Error('Failed to parse Excel document');
    }
  }

  /**
   * Parse CSV documents
   */
  private parseCSV(buffer: Buffer, filename: string): ParsedDocument {
    try {
      const text = buffer.toString('utf-8');
      const records = parseCSV(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
      
      if (records.length === 0) {
        throw new Error('Empty CSV file');
      }
      
      const headers = Object.keys(records[0]);
      const rows = records.map(record => headers.map(h => record[h]));
      
      const analysis = this.analyzeTable(headers, rows);
      
      return {
        type: this.detectDocumentType(text, filename),
        format: 'csv',
        extractedText: text,
        structuredData: records,
        tables: [{
          name: 'CSV Data',
          headers,
          rows,
          analysis
        }],
        metadata: {
          filename,
          fileSize: buffer.length,
          extractedDate: new Date(),
          confidence: 0.9
        }
      };
    } catch (error) {
      console.error('CSV parsing error:', error);
      throw new Error('Failed to parse CSV document');
    }
  }

  /**
   * Detect document format
   */
  private detectFormat(filename: string, mimeType?: string): 'pdf' | 'excel' | 'csv' {
    const extension = filename.toLowerCase().split('.').pop();
    
    if (extension === 'pdf' || mimeType === 'application/pdf') {
      return 'pdf';
    }
    if (['xlsx', 'xls'].includes(extension || '') || 
        mimeType?.includes('spreadsheet')) {
      return 'excel';
    }
    if (extension === 'csv' || mimeType === 'text/csv') {
      return 'csv';
    }
    
    throw new Error('Unsupported file format');
  }

  /**
   * Detect document type based on content
   */
  private detectDocumentType(
    text: string,
    filename: string
  ): 'financial' | 'lease' | 'maintenance' | 'general' {
    const lowerText = text.toLowerCase();
    const lowerFilename = filename.toLowerCase();
    
    // Financial indicators
    if (lowerText.includes('revenue') || lowerText.includes('expense') ||
        lowerText.includes('profit') || lowerText.includes('income') ||
        lowerText.includes('balance sheet') || lowerText.includes('p&l') ||
        lowerFilename.includes('financial') || lowerFilename.includes('budget')) {
      return 'financial';
    }
    
    // Lease indicators
    if (lowerText.includes('lease') || lowerText.includes('tenant') ||
        lowerText.includes('rent') || lowerText.includes('landlord') ||
        lowerFilename.includes('lease') || lowerFilename.includes('rental')) {
      return 'lease';
    }
    
    // Maintenance indicators
    if (lowerText.includes('maintenance') || lowerText.includes('repair') ||
        lowerText.includes('inspection') || lowerText.includes('work order') ||
        lowerFilename.includes('maintenance') || lowerFilename.includes('repair')) {
      return 'maintenance';
    }
    
    return 'general';
  }

  /**
   * Extract financial patterns from text
   */
  private extractFinancialPatterns(text: string): any {
    const patterns = {
      amounts: [] as number[],
      percentages: [] as number[],
      dates: [] as string[],
      accounts: [] as string[],
      metrics: {} as Record<string, any>
    };
    
    // Extract dollar amounts
    const amountRegex = /\$[\d,]+\.?\d*/g;
    const amounts = text.match(amountRegex);
    if (amounts) {
      patterns.amounts = amounts.map(a => 
        parseFloat(a.replace(/[$,]/g, ''))
      );
    }
    
    // Extract percentages
    const percentRegex = /\d+\.?\d*%/g;
    const percentages = text.match(percentRegex);
    if (percentages) {
      patterns.percentages = percentages.map(p => 
        parseFloat(p.replace('%', ''))
      );
    }
    
    // Extract dates
    const dateRegex = /\b(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2}|[A-Z][a-z]+ \d{1,2}, \d{4})\b/g;
    const dates = text.match(dateRegex);
    if (dates) {
      patterns.dates = dates;
    }
    
    // Extract key metrics
    const metricPatterns = {
      revenue: /revenue[:\s]+\$?([\d,]+)/i,
      expenses: /expenses?[:\s]+\$?([\d,]+)/i,
      netIncome: /net income[:\s]+\$?([\d,]+)/i,
      occupancy: /occupancy[:\s]+([\d.]+)%/i
    };
    
    Object.entries(metricPatterns).forEach(([key, regex]) => {
      const match = text.match(regex);
      if (match) {
        patterns.metrics[key] = parseFloat(match[1].replace(/,/g, ''));
      }
    });
    
    return patterns;
  }

  /**
   * Analyze table data
   */
  private analyzeTable(headers: string[], rows: any[][]): TableAnalysis {
    const analysis: TableAnalysis = {
      totals: {},
      averages: {},
      trends: {}
    };
    
    // Identify numeric columns
    headers.forEach((header, colIndex) => {
      const columnData = rows.map(row => row[colIndex]);
      const numericData = columnData
        .map(val => parseFloat(String(val).replace(/[$,]/g, '')))
        .filter(val => !isNaN(val));
      
      if (numericData.length > 0) {
        // Calculate totals and averages
        const total = numericData.reduce((sum, val) => sum + val, 0);
        analysis.totals![header] = total;
        analysis.averages![header] = total / numericData.length;
        
        // Detect trends (simple linear trend)
        if (numericData.length > 2) {
          const firstHalf = numericData.slice(0, Math.floor(numericData.length / 2));
          const secondHalf = numericData.slice(Math.floor(numericData.length / 2));
          const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
          const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
          
          if (secondAvg > firstAvg * 1.05) {
            analysis.trends![header] = 'increasing';
          } else if (secondAvg < firstAvg * 0.95) {
            analysis.trends![header] = 'decreasing';
          } else {
            analysis.trends![header] = 'stable';
          }
        }
      }
    });
    
    return analysis;
  }

  /**
   * Structure table data into objects
   */
  private structureTableData(headers: string[], rows: any[][]): any[] {
    return rows.map(row => {
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
  }

  /**
   * Calculate confidence score based on data quality
   */
  private calculateConfidence(text: string): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence for structured data
    if (text.match(/\$[\d,]+/g)?.length || 0 > 5) confidence += 0.1;
    if (text.match(/\d+%/g)?.length || 0 > 3) confidence += 0.1;
    if (text.includes('total') || text.includes('subtotal')) confidence += 0.1;
    if (text.length > 1000) confidence += 0.1;
    if (text.includes('revenue') && text.includes('expense')) confidence += 0.1;
    
    return Math.min(confidence, 0.95);
  }
}

// Export singleton instance
export const documentParser = new DocumentParser();
