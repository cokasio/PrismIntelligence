/**
 * PDF Parser Service
 * This module extracts text and data from PDF reports
 * Think of it as a skilled reader who can quickly scan documents and pull out the important information
 */

import pdfParse from 'pdf-parse';
import { createLogger } from '../../utils/logger';

const logger = createLogger('pdf-parser');

/**
 * Define the structure of parsed PDF data
 * This helps other parts of the system know what to expect
 */
export interface ParsedPDFData {
  text: string;                    // Raw text content
  pages: string[];                 // Text split by pages
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
    pageCount: number;
  };
  tables?: Array<{                 // Extracted table data
    headers: string[];
    rows: string[][];
    pageNumber: number;
  }>;
  sections?: Array<{               // Document sections
    title: string;
    content: string;
    pageNumber: number;
  }>;
}

/**
 * PDF Parser class that handles extraction of data from PDF files
 * This is specifically tuned for property management reports
 */
export class PDFParser {
  /**
   * Parse a PDF file from a Buffer
   * Buffers are how Node.js handles binary data like PDF files
   */
  async parse(buffer: Buffer): Promise<ParsedPDFData> {
    try {
      logger.info('Starting PDF parsing', { 
        bufferSize: buffer.length 
      });

      // Use pdf-parse to extract basic content
      const data = await pdfParse(buffer, {
        // Preserve formatting as much as possible
        normalizeWhitespace: false,
        // Try to maintain table structures
        disableCombineTextItems: false,
      });

      logger.debug('PDF parsed successfully', {
        pages: data.numpages,
        textLength: data.text.length,
      });

      // Split text by pages for better context preservation
      const pages = this.splitIntoPages(data.text);
      
      // Extract tables from the text
      const tables = this.extractTables(pages);
      
      // Identify document sections (headers, subsections, etc.)
      const sections = this.extractSections(pages);

      // Build the parsed data structure
      const parsedData: ParsedPDFData = {
        text: data.text,
        pages,
        metadata: {
          title: data.info?.Title,
          author: data.info?.Author,
          subject: data.info?.Subject,
          creator: data.info?.Creator,
          producer: data.info?.Producer,
          creationDate: data.info?.CreationDate ? 
            new Date(data.info.CreationDate) : undefined,
          modificationDate: data.info?.ModDate ? 
            new Date(data.info.ModDate) : undefined,
          pageCount: data.numpages,
        },
        tables,
        sections,
      };

      logger.info('PDF parsing completed', {
        pageCount: parsedData.metadata.pageCount,
        tableCount: tables.length,
        sectionCount: sections.length,
      });

      return parsedData;

    } catch (error) {
      logger.error('Failed to parse PDF', { error });
      throw new Error(`PDF parsing failed: ${error.message}`);
    }
  }

  /**
   * Split the full text into individual pages
   * PDFs often use form feed characters or page markers
   */
  private splitIntoPages(fullText: string): string[] {
    // Common page separators in PDF text extraction
    const pageSeparators = [
      /\f/g,                    // Form feed character
      /Page \d+ of \d+/g,       // Common page numbering pattern
      /_{10,}/g,                // Long underscores often separate pages
    ];

    let pages = [fullText];
    
    // Try each separator pattern
    for (const separator of pageSeparators) {
      const split = fullText.split(separator);
      if (split.length > 1) {
        pages = split;
        break;
      }
    }

    // Clean up each page
    return pages.map(page => page.trim()).filter(page => page.length > 0);
  }

  /**
   * Extract tables from the PDF text
   * This is complex because PDFs don't have a standard table format
   */
  private extractTables(pages: string[]): ParsedPDFData['tables'] {
    const tables: ParsedPDFData['tables'] = [];

    pages.forEach((pageText, pageIndex) => {
      // Look for patterns that suggest tabular data
      const lines = pageText.split('\n');
      let inTable = false;
      let currentTable: string[][] = [];
      let headers: string[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines
        if (!line) {
          if (inTable && currentTable.length > 0) {
            // End of table
            tables.push({
              headers,
              rows: currentTable,
              pageNumber: pageIndex + 1,
            });
            inTable = false;
            currentTable = [];
            headers = [];
          }
          continue;
        }

        // Detect table-like structures
        // Look for lines with multiple data points separated by spaces or tabs
        const segments = line.split(/\s{2,}|\t+/);
        
        if (segments.length >= 2) {
          // This might be a table row
          if (!inTable) {
            // First row might be headers
            inTable = true;
            headers = segments;
          } else {
            currentTable.push(segments);
          }
        } else if (inTable) {
          // Single column data might still be part of the table
          if (this.looksLikeTableContinuation(line, headers)) {
            currentTable.push([line]);
          } else {
            // End of table
            if (currentTable.length > 0) {
              tables.push({
                headers,
                rows: currentTable,
                pageNumber: pageIndex + 1,
              });
            }
            inTable = false;
            currentTable = [];
            headers = [];
          }
        }
      }

      // Don't forget the last table on the page
      if (inTable && currentTable.length > 0) {
        tables.push({
          headers,
          rows: currentTable,
          pageNumber: pageIndex + 1,
        });
      }
    });

    return tables;
  }

  /**
   * Check if a line looks like it continues a table
   * This helps handle wrapped cell content
   */
  private looksLikeTableContinuation(line: string, headers: string[]): boolean {
    // Simple heuristics for table continuation
    // In real implementation, this would be more sophisticated
    
    // Check if it starts with a number (common in financial tables)
    if (/^\d/.test(line)) return true;
    
    // Check if it starts with a dollar sign
    if (/^\$/.test(line)) return true;
    
    // Check if it's indented (suggests continuation)
    if (/^\s{4,}/.test(line)) return true;
    
    return false;
  }

  /**
   * Extract document sections based on formatting patterns
   * This helps AI understand document structure
   */
  private extractSections(pages: string[]): ParsedPDFData['sections'] {
    const sections: ParsedPDFData['sections'] = [];
    
    pages.forEach((pageText, pageIndex) => {
      const lines = pageText.split('\n');
      let currentSection: { title: string; content: string[] } | null = null;

      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip empty lines
        if (!trimmedLine) continue;

        // Check if this line looks like a section header
        if (this.looksLikeHeader(trimmedLine, line)) {
          // Save previous section if exists
          if (currentSection && currentSection.content.length > 0) {
            sections.push({
              title: currentSection.title,
              content: currentSection.content.join('\n'),
              pageNumber: pageIndex + 1,
            });
          }
          
          // Start new section
          currentSection = {
            title: trimmedLine,
            content: [],
          };
        } else if (currentSection) {
          // Add content to current section
          currentSection.content.push(trimmedLine);
        }
      }

      // Don't forget the last section
      if (currentSection && currentSection.content.length > 0) {
        sections.push({
          title: currentSection.title,
          content: currentSection.content.join('\n'),
          pageNumber: pageIndex + 1,
        });
      }
    });

    return sections;
  }

  /**
   * Detect if a line looks like a section header
   * Headers often have distinct formatting in PDFs
   */
  private looksLikeHeader(trimmedLine: string, originalLine: string): boolean {
    // All caps often indicates headers
    if (trimmedLine === trimmedLine.toUpperCase() && 
        trimmedLine.length > 3 && 
        !/^\d/.test(trimmedLine)) {
      return true;
    }

    // Lines that end with colons are often headers
    if (trimmedLine.endsWith(':') && trimmedLine.length < 50) {
      return true;
    }

    // Common header patterns in property reports
    const headerPatterns = [
      /^(EXECUTIVE |)SUMMARY/i,
      /^FINANCIAL (SUMMARY|STATEMENT|REPORT)/i,
      /^PROPERTY (DETAILS|INFORMATION|SUMMARY)/i,
      /^INCOME STATEMENT/i,
      /^BALANCE SHEET/i,
      /^CASH FLOW/i,
      /^OCCUPANCY (REPORT|SUMMARY)/i,
      /^MAINTENANCE (REPORT|SUMMARY)/i,
      /^[A-Z][A-Z\s]{2,}$/,  // Multiple words in all caps
    ];

    return headerPatterns.some(pattern => pattern.test(trimmedLine));
  }

  /**
   * Extract specific financial data patterns
   * This method looks for common financial report elements
   */
  extractFinancialData(parsedData: ParsedPDFData): {
    revenue?: number;
    expenses?: number;
    netIncome?: number;
    occupancyRate?: number;
    [key: string]: number | undefined;
  } {
    const financialData: Record<string, number | undefined> = {};
    
    // Regular expressions for common financial patterns
    const patterns = {
      revenue: /(?:total\s+)?revenue:?\s*\$?([\d,]+(?:\.\d{2})?)/i,
      expenses: /(?:total\s+)?expenses?:?\s*\$?([\d,]+(?:\.\d{2})?)/i,
      netIncome: /net\s+(?:income|profit):?\s*\$?([\d,]+(?:\.\d{2})?)/i,
      occupancy: /occupancy\s*(?:rate)?:?\s*([\d.]+)%?/i,
    };

    // Search through all text for financial patterns
    const searchText = parsedData.text.toLowerCase();
    
    Object.entries(patterns).forEach(([key, pattern]) => {
      const match = searchText.match(pattern);
      if (match && match[1]) {
        // Remove commas and convert to number
        const value = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(value)) {
          financialData[key] = value;
        }
      }
    });

    logger.debug('Extracted financial data', financialData);
    
    return financialData;
  }
}

// Export a singleton instance for easy use
export const pdfParser = new PDFParser();

/**
 * Example usage:
 * 
 * import { pdfParser } from './parsers/pdf';
 * 
 * const fileBuffer = await fs.readFile('report.pdf');
 * const parsedData = await pdfParser.parse(fileBuffer);
 * 
 * console.log('Page count:', parsedData.metadata.pageCount);
 * console.log('Found tables:', parsedData.tables.length);
 * 
 * // Extract financial data
 * const financials = pdfParser.extractFinancialData(parsedData);
 * console.log('Revenue:', financials.revenue);
 */