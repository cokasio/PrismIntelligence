import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import fs from 'fs/promises';
import logger from '../utils/logger';
import { FileClassification } from './attachmentIntelligenceLoop';

export class GeminiClassifier {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    // Will be initialized in initialize() method
  }

  /**
   * Initialize the Gemini AI service
   */
  async initialize(): Promise<void> {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is required');
      }

      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      logger.info('✅ Gemini AI initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize Gemini AI:', error);
      throw error;
    }
  }

  /**
   * Classify a document using Gemini AI
   */
  async classifyDocument(filePath: string): Promise<FileClassification> {
    for (let i = 0; i < 3; i++) {
      try {
        const filename = path.basename(filePath);
        const fileExtension = path.extname(filePath).toLowerCase();
        const fileStats = await fs.stat(filePath);
        
        // Get file preview based on type
        const filePreview = await this.getFilePreview(filePath, fileExtension);
        
        // Create classification prompt
        const prompt = this.buildClassificationPrompt(filename, fileExtension, fileStats.size, filePreview);
        
        // Generate classification
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const classification = this.parseClassificationResponse(response.text());
        
        logger.info(`🎯 Gemini classification for ${filename}:`, {
          type: classification.documentType,
          confidence: classification.confidence,
          property: classification.propertyName
        });
        
        return classification;
        
      } catch (error) {
        if (error.message.includes('429')) {
          const delay = Math.pow(2, i) * 1000;
          logger.warn(`Rate limit hit. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          logger.error('❌ Gemini classification failed:', error);
          
          // Return fallback classification
          return this.getFallbackClassification(filePath);
        }
      }
    }
    logger.error('❌ Gemini classification failed after multiple retries.');
    return this.getFallbackClassification(filePath);
  }

  /**
   * Generate content with retry logic for rate limiting
   */
  private async generateWithRetry(prompt: string, maxRetries = 3, initialDelay = 1000) {
    let retries = 0;
    while (retries < maxRetries) {
      try {
        return await this.model.generateContent(prompt);
      } catch (error: any) {
        if (error.message.includes('429')) {
          retries++;
          const delay = initialDelay * Math.pow(2, retries);
          logger.warn(`🚦 Rate limit hit. Retrying in ${delay}ms... (${retries}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
    throw new Error('Max retries reached for Gemini API');
  }

  /**
   * Get file preview for classification
   */
  private async getFilePreview(filePath: string, extension: string): Promise<string> {
    try {
      switch (extension) {
        case '.txt':
        case '.csv':
          // Read first 2000 characters for text files
          const textContent = await fs.readFile(filePath, 'utf-8');
          return textContent.substring(0, 2000);
          
        case '.pdf':
          // For PDF files, we'll use the filename and size for now
          // In a full implementation, you'd use a PDF parser
          return `PDF file (${path.basename(filePath)})`;
          
        case '.xlsx':
        case '.xls':
          // For Excel files, we'll use the filename and size for now
          // In a full implementation, you'd use ExcelJS or similar
          return `Excel file (${path.basename(filePath)})`;
          
        default:
          return `File type: ${extension}`;
      }
    } catch (error) {
      logger.warn(`⚠️ Could not get file preview for ${filePath}:`, error);
      return `File: ${path.basename(filePath)}`;
    }
  }

  /**
   * Build the classification prompt for Gemini
   */
  private buildClassificationPrompt(filename: string, extension: string, size: number, preview: string): string {
    return `
You are an expert property management document classifier. Analyze the following file and provide a detailed classification.

**File Information:**
- Filename: ${filename}
- Extension: ${extension}
- Size: ${size} bytes
- Preview: ${preview}

**Classification Task:**
Classify this document into one of these property management categories:

1. **financial** - P&L statements, income statements, balance sheets, cash flow reports
2. **rent_roll** - Tenant listings, rent rolls, occupancy reports, lease summaries
3. **lease** - Lease agreements, lease amendments, lease renewals, tenant applications
4. **maintenance** - Work orders, maintenance reports, repair invoices, inspection reports
5. **unknown** - Cannot be classified or insufficient information

**Analysis Required:**
For each document, provide:
- Document type classification
- Confidence score (0.0 to 1.0)
- Property name/identifier if mentioned
- Report period dates if present
- Suggested parser type
- Key identifying features

**Response Format:**
Respond with a JSON object in this exact format:
{
  "documentType": "financial|rent_roll|lease|maintenance|unknown",
  "confidence": 0.95,
  "propertyName": "Property name if found",
  "propertyId": "Property ID if found",
  "reportPeriod": {
    "start": "YYYY-MM-DD",
    "end": "YYYY-MM-DD"
  },
  "suggestedParser": "excel|pdf|csv|text",
  "identifyingFeatures": ["feature1", "feature2"],
  "reasoning": "Brief explanation of classification decision"
}

**Property Management Context:**
- Look for property-specific terminology (NOI, CAM, lease terms, etc.)
- Identify financial metrics (revenue, expenses, occupancy rates)
- Recognize maintenance terminology (work orders, repairs, inspections)
- Watch for lease-related language (tenant names, lease terms, renewals)

Analyze the file and provide your classification:
`;
  }

  /**
   * Parse Gemini's classification response
   */
  private parseClassificationResponse(responseText: string): FileClassification {
    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and normalize the response
      return {
        documentType: this.validateDocumentType(parsed.documentType),
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
        propertyName: parsed.propertyName || undefined,
        propertyId: parsed.propertyId || undefined,
        reportPeriod: this.validateReportPeriod(parsed.reportPeriod),
        suggestedParser: parsed.suggestedParser || 'text',
        metadata: {
          identifyingFeatures: parsed.identifyingFeatures || [],
          reasoning: parsed.reasoning || 'No reasoning provided'
        }
      };
      
    } catch (error) {
      logger.warn('⚠️ Could not parse Gemini classification response:', error);
      logger.debug('Raw response:', responseText);
      
      // Return a safe fallback
      return {
        documentType: 'unknown',
        confidence: 0.1,
        suggestedParser: 'text',
        metadata: {
          error: 'Failed to parse classification response',
          rawResponse: responseText
        }
      };
    }
  }

  /**
   * Validate document type
   */
  private validateDocumentType(type: string): FileClassification['documentType'] {
    const validTypes: FileClassification['documentType'][] = [
      'financial', 'rent_roll', 'lease', 'maintenance', 'unknown'
    ];
    
    return validTypes.includes(type as any) ? type as FileClassification['documentType'] : 'unknown';
  }

  /**
   * Validate and parse report period
   */
  private validateReportPeriod(period: any): FileClassification['reportPeriod'] {
    if (!period || typeof period !== 'object') {
      return undefined;
    }

    const start = period.start;
    const end = period.end;

    // Basic date validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (start && end && dateRegex.test(start) && dateRegex.test(end)) {
      return { start, end };
    }

    return undefined;
  }

  /**
   * Get fallback classification when Gemini fails
   */
  private getFallbackClassification(filePath: string): FileClassification {
    const filename = path.basename(filePath).toLowerCase();
    const extension = path.extname(filePath).toLowerCase();
    
    // Simple filename-based classification
    let documentType: FileClassification['documentType'] = 'unknown';
    let confidence = 0.3;
    
    // Financial keywords
    if (filename.includes('financial') || filename.includes('income') || 
        filename.includes('p&l') || filename.includes('statement')) {
      documentType = 'financial';
      confidence = 0.6;
    }
    // Rent roll keywords
    else if (filename.includes('rent') || filename.includes('tenant') || 
             filename.includes('occupancy') || filename.includes('roll')) {
      documentType = 'rent_roll';
      confidence = 0.6;
    }
    // Lease keywords
    else if (filename.includes('lease') || filename.includes('agreement') || 
             filename.includes('contract')) {
      documentType = 'lease';
      confidence = 0.6;
    }
    // Maintenance keywords
    else if (filename.includes('maintenance') || filename.includes('repair') || 
             filename.includes('work') || filename.includes('inspection')) {
      documentType = 'maintenance';
      confidence = 0.6;
    }

    // Adjust confidence based on file type
    if (extension === '.csv' || extension === '.xlsx') {
      confidence += 0.1;
    }

    return {
      documentType,
      confidence: Math.min(confidence, 0.8), // Cap fallback confidence
      suggestedParser: extension === '.csv' ? 'csv' : 
                      extension === '.xlsx' ? 'excel' : 
                      extension === '.pdf' ? 'pdf' : 'text',
      metadata: {
        fallback: true,
        reason: 'Gemini classification failed, using filename-based fallback'
      }
    };
  }

  /**
   * Test the Gemini connection
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.model) {
        await this.initialize();
      }

      const testPrompt = "Respond with 'OK' if you can understand this message.";
      const result = await this.generateWithRetry(testPrompt);
      const response = await result.response;
      
      return response.text().includes('OK');
    } catch (error) {
      logger.error('❌ Gemini connection test failed:', error);
      return false;
    }
  }
}
