import path from 'path';
import fs from 'fs/promises';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { logger } from '../utils/logger';
import { FileClassification } from './attachmentIntelligenceLoop';

export interface ExtractedData {
  type: 'tabular' | 'text' | 'structured';
  records?: any[];
  categories?: Record<string, any>;
  metadata?: Record<string, any>;
  rawData?: any;
  summary?: {
    recordCount: number;
    fields: string[];
    dataQuality: number; // 0-1 score
  };
}

export class FileProcessor {
  constructor() {}

  /**
   * Extract data from a file based on its classification
   */
  async extractData(filePath: string, classification: FileClassification): Promise<ExtractedData> {
    try {
      const filename = path.basename(filePath);
      const extension = path.extname(filePath).toLowerCase();
      
      logger.info(`⚙️ Extracting data from ${filename} (${extension})`);

      let extractedData: ExtractedData;

      switch (extension) {
        case '.csv':
          extractedData = await this.processCsvFile(filePath, classification);
          break;
        case '.xlsx':
        case '.xls':
          extractedData = await this.processExcelFile(filePath, classification);
          break;
        case '.txt':
          extractedData = await this.processTextFile(filePath, classification);
          break;
        case '.pdf':
          extractedData = await this.processPdfFile(filePath, classification);
          break;
        default:
          extractedData = await this.processGenericFile(filePath, classification);
      }

      // Add metadata
      extractedData.metadata = {
        ...extractedData.metadata,
        filename,
        extension,
        filePath,
        processedAt: new Date().toISOString(),
        classification: classification.documentType
      };

      logger.info(`✅ Extracted ${extractedData.records?.length || 0} records from ${filename}`);
      
      return extractedData;

    } catch (error) {
      logger.error(`❌ Failed to extract data from ${filePath}:`, error);
      
      // Return error data structure
      return {
        type: 'text',
        records: [],
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          filename: path.basename(filePath),
          processedAt: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Process CSV files
   */
  private async processCsvFile(filePath: string, classification: FileClassification): Promise<ExtractedData> {
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      
      const parseResult = Papa.parse(fileContent, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        delimitersToGuess: [',', '\t', '|', ';'],
        transformHeader: (header: string) => header.trim()
      });

      if (parseResult.errors.length > 0) {
        logger.warn(`⚠️ CSV parsing warnings:`, parseResult.errors);
      }

      const records = parseResult.data as any[];
      const fields = parseResult.meta.fields || [];

      // Property management specific processing
      const processedData = this.processPropertyData(records, classification.documentType);

      return {
        type: 'tabular',
        records: processedData.records,
        categories: processedData.categories,
        summary: {
          recordCount: records.length,
          fields,
          dataQuality: this.assessDataQuality(records, fields)
        },
        metadata: {
          parseErrors: parseResult.errors,
          delimiter: parseResult.meta.delimiter,
          linebreak: parseResult.meta.linebreak
        }
      };

    } catch (error) {
      logger.error('❌ CSV processing failed:', error);
      throw error;
    }
  }

  /**
   * Process Excel files
   */
  private async processExcelFile(filePath: string, classification: FileClassification): Promise<ExtractedData> {
    try {
      const workbook = XLSX.readFile(filePath, {
        cellStyles: true,
        cellFormulas: true,
        cellDates: true,
        cellNF: true,
        sheetStubs: true
      });

      const sheetName = workbook.SheetNames[0]; // Use first sheet
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with headers
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: null,
        blankrows: false
      }) as any[][];

      if (jsonData.length === 0) {
        throw new Error('Excel file appears to be empty');
      }

      // Extract headers and data
      const headers = jsonData[0].map((h: any) => String(h || '').trim()).filter(Boolean);
      const dataRows = jsonData.slice(1).filter(row => row.some(cell => cell !== null && cell !== ''));

      // Convert to objects
      const records = dataRows.map(row => {
        const record: any = {};
        headers.forEach((header, index) => {
          const value = row[index];
          record[header] = value !== null && value !== undefined ? value : null;
        });
        return record;
      });

      // Property management specific processing
      const processedData = this.processPropertyData(records, classification.documentType);

      return {
        type: 'tabular',
        records: processedData.records,
        categories: processedData.categories,
        summary: {
          recordCount: records.length,
          fields: headers,
          dataQuality: this.assessDataQuality(records, headers)
        },
        metadata: {
          sheetName,
          totalSheets: workbook.SheetNames.length,
          allSheets: workbook.SheetNames
        }
      };

    } catch (error) {
      logger.error('❌ Excel processing failed:', error);
      throw error;
    }
  }

  /**
   * Process text files
   */
  private async processTextFile(filePath: string, classification: FileClassification): Promise<ExtractedData> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n').map(line => line.trim()).filter(Boolean);

      // Try to detect structure
      const structuredData = this.detectTextStructure(lines, classification.documentType);

      return {
        type: 'text',
        records: structuredData.records,
        categories: structuredData.categories,
        rawData: content,
        summary: {
          recordCount: lines.length,
          fields: Object.keys(structuredData.categories || {}),
          dataQuality: 0.6 // Text files are harder to assess
        },
        metadata: {
          lineCount: lines.length,
          characterCount: content.length
        }
      };

    } catch (error) {
      logger.error('❌ Text processing failed:', error);
      throw error;
    }
  }

  /**
   * Process PDF files (placeholder - would need PDF parsing library)
   */
  private async processPdfFile(filePath: string, classification: FileClassification): Promise<ExtractedData> {
    try {
      // For now, return basic metadata
      // In a full implementation, you'd use pdf-parse or similar
      const stats = await fs.stat(filePath);
      
      return {
        type: 'structured',
        records: [],
        metadata: {
          note: 'PDF processing requires additional implementation',
          fileSize: stats.size,
          suggestion: 'Convert to Excel or CSV for better data extraction'
        },
        summary: {
          recordCount: 0,
          fields: [],
          dataQuality: 0.3
        }
      };

    } catch (error) {
      logger.error('❌ PDF processing failed:', error);
      throw error;
    }
  }

  /**
   * Process generic/unknown file types
   */
  private async processGenericFile(filePath: string, classification: FileClassification): Promise<ExtractedData> {
    try {
      const stats = await fs.stat(filePath);
      const extension = path.extname(filePath);

      return {
        type: 'text',
        records: [],
        metadata: {
          note: `Unsupported file type: ${extension}`,
          fileSize: stats.size,
          suggestion: 'Convert to CSV, Excel, or text format for processing'
        },
        summary: {
          recordCount: 0,
          fields: [],
          dataQuality: 0.1
        }
      };

    } catch (error) {
      logger.error('❌ Generic file processing failed:', error);
      throw error;
    }
  }

  /**
   * Process property management specific data structures
   */
  private processPropertyData(records: any[], documentType: string): { records: any[], categories: Record<string, any> } {
    const categories: Record<string, any> = {};

    switch (documentType) {
      case 'financial':
        return this.processFinancialData(records);
      case 'rent_roll':
        return this.processRentRollData(records);
      case 'lease':
        return this.processLeaseData(records);
      case 'maintenance':
        return this.processMaintenanceData(records);
      default:
        return { records, categories };
    }
  }

  /**
   * Process financial statement data
   */
  private processFinancialData(records: any[]): { records: any[], categories: Record<string, any> } {
    const categories = {
      revenue: [],
      expenses: [],
      summary: {}
    };

    let totalRevenue = 0;
    let totalExpenses = 0;

    records.forEach(record => {
      // Look for revenue indicators
      const description = String(record.description || record.account || record.item || '').toLowerCase();
      const amount = parseFloat(record.amount || record.value || record.total || 0);

      if (description.includes('rent') || description.includes('income') || description.includes('revenue')) {
        categories.revenue.push(record);
        totalRevenue += amount;
      } else if (description.includes('expense') || description.includes('cost') || description.includes('payment')) {
        categories.expenses.push(record);
        totalExpenses += amount;
      }
    });

    categories.summary = {
      totalRevenue,
      totalExpenses,
      netOperatingIncome: totalRevenue - totalExpenses,
      expenseRatio: totalRevenue > 0 ? (totalExpenses / totalRevenue) : 0
    };

    return { records, categories };
  }

  /**
   * Process rent roll data
   */
  private processRentRollData(records: any[]): { records: any[], categories: Record<string, any> } {
    const categories = {
      occupied: [],
      vacant: [],
      summary: {}
    };

    let totalUnits = records.length;
    let occupiedUnits = 0;
    let totalRent = 0;

    records.forEach(record => {
      const status = String(record.status || record.occupancy || '').toLowerCase();
      const rent = parseFloat(record.rent || record.monthlyRent || record.amount || 0);

      if (status.includes('occupied') || status.includes('rented') || rent > 0) {
        categories.occupied.push(record);
        occupiedUnits++;
        totalRent += rent;
      } else {
        categories.vacant.push(record);
      }
    });

    categories.summary = {
      totalUnits,
      occupiedUnits,
      vacantUnits: totalUnits - occupiedUnits,
      occupancyRate: totalUnits > 0 ? (occupiedUnits / totalUnits) : 0,
      totalMonthlyRent: totalRent,
      averageRent: occupiedUnits > 0 ? (totalRent / occupiedUnits) : 0
    };

    return { records, categories };
  }

  /**
   * Process lease document data
   */
  private processLeaseData(records: any[]): { records: any[], categories: Record<string, any> } {
    const categories = {
      terms: [],
      dates: [],
      financial: [],
      summary: {}
    };

    // For lease documents, records might be clauses or terms
    records.forEach(record => {
      const text = String(record.clause || record.term || record.description || '').toLowerCase();

      if (text.includes('date') || text.includes('expir') || text.includes('commence')) {
        categories.dates.push(record);
      } else if (text.includes('rent') || text.includes('payment') || text.includes('deposit')) {
        categories.financial.push(record);
      } else {
        categories.terms.push(record);
      }
    });

    categories.summary = {
      totalClauses: records.length,
      financialTerms: categories.financial.length,
      importantDates: categories.dates.length
    };

    return { records, categories };
  }

  /**
   * Process maintenance data
   */
  private processMaintenanceData(records: any[]): { records: any[], categories: Record<string, any> } {
    const categories = {
      workOrders: [],
      completed: [],
      pending: [],
      summary: {}
    };

    let totalCost = 0;
    let completedCount = 0;

    records.forEach(record => {
      const status = String(record.status || '').toLowerCase();
      const cost = parseFloat(record.cost || record.amount || record.price || 0);

      totalCost += cost;

      if (status.includes('complete') || status.includes('closed') || status.includes('done')) {
        categories.completed.push(record);
        completedCount++;
      } else {
        categories.pending.push(record);
      }

      categories.workOrders.push(record);
    });

    categories.summary = {
      totalWorkOrders: records.length,
      completedWorkOrders: completedCount,
      pendingWorkOrders: records.length - completedCount,
      totalCost,
      averageCost: records.length > 0 ? (totalCost / records.length) : 0,
      completionRate: records.length > 0 ? (completedCount / records.length) : 0
    };

    return { records, categories };
  }

  /**
   * Detect structure in text files
   */
  private detectTextStructure(lines: string[], documentType: string): { records: any[], categories: Record<string, any> } {
    const records = lines.map((line, index) => ({ lineNumber: index + 1, content: line }));
    const categories = {
      sections: this.identifyTextSections(lines),
      keyLines: lines.filter(line => 
        line.includes(':') || 
        line.includes('$') || 
        line.match(/\d{1,2}\/\d{1,2}\/\d{4}/) // Date pattern
      )
    };

    return { records, categories };
  }

  /**
   * Identify sections in text documents
   */
  private identifyTextSections(lines: string[]): string[] {
    const sections: string[] = [];
    
    lines.forEach(line => {
      // Look for section headers (all caps, or ending with colon)
      if (line === line.toUpperCase() && line.length > 3) {
        sections.push(line);
      } else if (line.endsWith(':') && !line.includes(' ')) {
        sections.push(line);
      }
    });

    return sections;
  }

  /**
   * Assess data quality of extracted records
   */
  private assessDataQuality(records: any[], fields: string[]): number {
    if (records.length === 0 || fields.length === 0) {
      return 0;
    }

    let totalCells = records.length * fields.length;
    let filledCells = 0;
    let validCells = 0;

    records.forEach(record => {
      fields.forEach(field => {
        const value = record[field];
        if (value !== null && value !== undefined && value !== '') {
          filledCells++;
          
          // Additional validation based on field type
          if (typeof value === 'number' || !isNaN(Number(value))) {
            validCells++;
          } else if (typeof value === 'string' && value.length > 0) {
            validCells++;
          }
        }
      });
    });

    const fillRate = filledCells / totalCells;
    const validityRate = validCells / totalCells;
    
    // Weighted average of fill rate and validity rate
    return (fillRate * 0.6 + validityRate * 0.4);
  }
}
