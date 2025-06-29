// Main content extractor that routes to format-specific extractors
import { EmailAttachment } from '../types';

export interface ExtractedContent {
  text?: string;
  tables?: Array<{
    headers: string[];
    rows: any[][];
  }>;
  metadata?: Record<string, any>;
  method: string;
  confidence: number;
}

export async function extractContent(
  attachment: EmailAttachment
): Promise<ExtractedContent> {
  const contentType = attachment.contentType.toLowerCase();
  
  // Route to appropriate extractor
  if (contentType.includes('pdf')) {
    return extractPDF(attachment);
  } else if (
    contentType.includes('excel') || 
    contentType.includes('spreadsheet') ||
    attachment.filename.endsWith('.xlsx') ||
    attachment.filename.endsWith('.xls')
  ) {
    return extractExcel(attachment);
  } else if (
    contentType.includes('csv') ||
    attachment.filename.endsWith('.csv')
  ) {
    return extractCSV(attachment);
  } else if (
    contentType.includes('text') ||
    attachment.filename.endsWith('.txt')
  ) {
    return extractText(attachment);
  } else if (
    contentType.includes('image') ||
    attachment.filename.match(/\.(png|jpg|jpeg|gif|bmp)$/i)
  ) {
    return extractImage(attachment);
  } else {
    // Default to text extraction
    return extractText(attachment);
  }
}

async function extractPDF(attachment: EmailAttachment): Promise<ExtractedContent> {
  // TODO: Implement PDF extraction
  // For now, return placeholder
  return {
    text: 'PDF extraction not yet implemented',
    tables: [],
    method: 'pdf',
    confidence: 0.5
  };
}

async function extractExcel(attachment: EmailAttachment): Promise<ExtractedContent> {
  const { extract } = await import('./extractors/excel');
  const extracted = await extract(attachment.data as Buffer, {
    reportType: null, // Will be determined by classifier
    structureType: null,
    confidence: 0,
    indicators: []
  });
  
  return {
    text: JSON.stringify(extracted.fields),
    tables: extracted.tables,
    metadata: extracted.metadata,
    method: 'excel',
    confidence: 0.9
  };
}

async function extractCSV(attachment: EmailAttachment): Promise<ExtractedContent> {
  // TODO: Implement CSV extraction
  return {
    text: 'CSV extraction not yet implemented',
    tables: [],
    method: 'csv',
    confidence: 0.5
  };
}

async function extractText(attachment: EmailAttachment): Promise<ExtractedContent> {
  const text = attachment.data.toString('utf-8');
  return {
    text,
    tables: [],
    method: 'text',
    confidence: 0.8
  };
}

async function extractImage(attachment: EmailAttachment): Promise<ExtractedContent> {
  // TODO: Implement OCR
  return {
    text: 'OCR not yet implemented',
    tables: [],
    method: 'ocr',
    confidence: 0.3
  };
}