import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';
import logger from '../utils/logger';

export class DocumentParser {
  /**
   * Read and parse document based on file type
   */
  async parseDocument(filePath: string): Promise<ParsedDocument> {
    try {
      const fileName = path.basename(filePath);
      const fileExt = path.extname(fileName).toLowerCase();
      
      logger.info(`📄 Parsing ${fileName} (${fileExt})`);
      
      let content: string;
      let structured: any = null;
      
      switch (fileExt) {
        case '.csv':
          content = await this.parseCSV(filePath);
          structured = this.extractCSVData(content);
          break;
          
        case '.xlsx':
        case '.xls':
          content = await this.parseExcel(filePath);
          structured = this.extractExcelData(content);
          break;
          
        case '.txt':
          content = await fs.readFile(filePath, 'utf-8');
          break;
          
        default:
          throw new Error(`Unsupported file type: ${fileExt}`);
      }
      
      return {
        fileName,
        fileType: fileExt,
        content,
        structured,
        parseDate: new Date().toISOString()
      };
      
    } catch (error) {
      logger.error('Document parsing failed:', error);
      throw error;
    }
  }

  private async parseCSV(filePath: string): Promise<string> {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  }

  private extractCSVData(content: string): any {
    try {
      const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
      return records;
    } catch (error) {
      logger.error('CSV parsing failed:', error);
      return null;
    }
  }

  private async parseExcel(filePath: string): Promise<string> {
    try {
      const buffer = await fs.readFile(filePath);
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      
      // Convert first sheet to CSV format for easy text analysis
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const csvContent = XLSX.utils.sheet_to_csv(firstSheet);
      
      return csvContent;
    } catch (error) {
      logger.error('Excel parsing failed, using fallback:', error);
      // Fallback to treating as text
      return await fs.readFile(filePath, 'utf-8');
    }
  }

  private extractExcelData(content: string): any {
    // Parse the CSV content extracted from Excel
    return this.extractCSVData(content);
  }
}

// Types
export interface ParsedDocument {
  fileName: string;
  fileType: string;
  content: string;
  structured: any;
  parseDate: string;
}

// Export singleton
export const documentParser = new DocumentParser();
