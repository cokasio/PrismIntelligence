import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../../utils/logger';

export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Classify document type and extract structure with Gemini
   */
  async classifyDocument(fileContent: string, fileName: string): Promise<DocumentClassification> {
    try {
      logger.info(`🔍 [Gemini] Classifying ${fileName}...`);
      
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `Analyze this property management document and classify it.

FILE: ${fileName}
SAMPLE CONTENT (first 500 chars):
${fileContent.substring(0, 500)}

Return a JSON object with:
{
  "documentType": "financial_report|rent_roll|maintenance_report|lease|other",
  "confidence": 0.0-1.0,
  "period": "extracted date range if applicable",
  "propertyInfo": {
    "name": "property name if found",
    "units": "number of units if found"
  },
  "dataStructure": {
    "hasFinancialData": boolean,
    "hasOccupancyData": boolean,
    "hasMaintenanceData": boolean
  }
}`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      const classification = this.parseClassification(response);
      logger.info(`✅ [Gemini] Classified as: ${classification.documentType}`);
      
      return classification;
      
    } catch (error) {
      logger.error(`❌ [Gemini] Classification failed:`, error);
      // Return default classification on error
      return {
        documentType: 'other',
        confidence: 0.5,
        period: 'unknown',
        propertyInfo: {},
        dataStructure: {
          hasFinancialData: false,
          hasOccupancyData: false,
          hasMaintenanceData: false
        }
      };
    }
  }

  private parseClassification(response: string): DocumentClassification {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      logger.error('Failed to parse Gemini response:', error);
      return {
        documentType: 'other',
        confidence: 0.5,
        period: 'unknown',
        propertyInfo: {},
        dataStructure: {
          hasFinancialData: false,
          hasOccupancyData: false,
          hasMaintenanceData: false
        }
      };
    }
  }
}

// Types
export interface DocumentClassification {
  documentType: 'financial_report' | 'rent_roll' | 'maintenance_report' | 'lease' | 'other';
  confidence: number;
  period: string;
  propertyInfo: {
    name?: string;
    units?: string;
  };
  dataStructure: {
    hasFinancialData: boolean;
    hasOccupancyData: boolean;
    hasMaintenanceData: boolean;
  };
}

// Export singleton
export const geminiService = new GeminiService();
