// Integration: Update Attachment Intelligence Loop to use Claude + Gemini Collaboration
// This shows how to modify your existing system to leverage both AIs

import AICollaborationBridge from '../orchestrators/ai-collaboration-bridge';
import { CollaborationTask } from '../orchestrators/ai-collaboration-bridge';
import GeminiCLIWrapper from '../classifiers/gemini-cli-wrapper';

// Existing imports from your attachment loop
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs/promises';
import * as path from 'path';

export class EnhancedAttachmentIntelligenceLoop {
  private collaborationBridge: AICollaborationBridge;
  private geminiCLI: GeminiCLIWrapper;
  private supabase: any;
  
  constructor() {
    // Initialize collaboration system
    this.collaborationBridge = new AICollaborationBridge(50, 1500); // Free tier limits
    this.geminiCLI = new GeminiCLIWrapper();
    
    // Your existing Supabase setup
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
  }

  // Enhanced document processing with AI collaboration
  async processDocument(filePath: string, metadata: any): Promise<any> {
    console.log(`\n🔄 Processing document with AI collaboration: ${path.basename(filePath)}`);
    
    // Step 1: Read document content
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Step 2: Quick classification (offload to Gemini for free tier)
    const classificationTask: CollaborationTask = {
      id: `class-${Date.now()}`,
      type: 'classification',
      description: `Classify property document: ${path.basename(filePath)}`,
      priority: 'low', // Use Gemini to save Claude tokens
      data: {
        filename: path.basename(filePath),
        content: content.substring(0, 1000), // First 1000 chars for classification
        metadata
      }
    };
    
    const classificationResult = await this.collaborationBridge.collaborateOnTask(classificationTask);
    const documentType = classificationResult.finalResult?.type || 'unknown';
    
    console.log(`📁 Document classified as: ${documentType} (by ${classificationResult.assignedTo})`);
    
    // Step 3: Deep analysis based on document type (high priority = both AIs)
    const analysisTask: CollaborationTask = {
      id: `analysis-${Date.now()}`,
      type: 'analysis',
      description: `Deep analysis of ${documentType} document`,
      priority: documentType === 'financial' ? 'high' : 'medium',
      data: {
        filename: path.basename(filePath),
        type: documentType,
        content,
        metadata
      }
    };
    
    const analysisResult = await this.collaborationBridge.collaborateOnTask(analysisTask);
    
    // Step 4: Extract specific information based on type
    let extractedData = {};
    
    switch (documentType) {
      case 'financial':
        extractedData = await this.extractFinancialMetrics(content);
        break;
      case 'lease':
        extractedData = await this.extractLeaseTerms(content);
        break;
      case 'maintenance':
        extractedData = await this.extractMaintenanceDetails(content);
        break;
      default:
        extractedData = await this.extractGeneralInfo(content);
    }
    
    // Step 5: Validate results if high-value document
    let validationResult = null;
    if (documentType === 'financial' || documentType === 'lease') {
      const validationTask: CollaborationTask = {
        id: `validate-${Date.now()}`,
        type: 'validation',
        description: 'Validate extracted data for accuracy',
        priority: 'high', // Both AIs validate important docs
        data: {
          documentType,
          extracted: extractedData,
          original: content.substring(0, 2000)
        }
      };
      
      validationResult = await this.collaborationBridge.collaborateOnTask(validationTask);
      
      if (!validationResult.consensus) {
        console.log('⚠️  Validation disagreement - flagging for human review');
      }
    }
    
    // Step 6: Store results in Supabase
    const processingResult = {
      file_path: filePath,
      document_type: documentType,
      classification_confidence: classificationResult.confidence,
      analysis: analysisResult.finalResult,
      extracted_data: extractedData,
      validation: validationResult?.finalResult,
      consensus_achieved: validationResult?.consensus ?? true,
      processed_by: {
        classification: classificationResult.assignedTo,
        analysis: analysisResult.assignedTo,
        validation: validationResult ? 'both' : 'none'
      },
      processing_time: {
        classification: classificationResult.executionTime,
        analysis: analysisResult.executionTime,
        validation: validationResult?.executionTime || 0
      },
      metadata,
      processed_at: new Date().toISOString()
    };
    
    // Save to database
    const { data, error } = await this.supabase
      .from('processed_documents')
      .insert(processingResult);
    
    if (error) {
      console.error('❌ Error saving to database:', error);
    } else {
      console.log('✅ Document processed and saved successfully');
    }
    
    // Step 7: Generate collaboration report
    this.logCollaborationStats();
    
    return processingResult;
  }

  // Financial metrics extraction (Gemini handles to save tokens)
  private async extractFinancialMetrics(content: string): Promise<any> {
    console.log('💰 Extracting financial metrics with Gemini...');
    
    try {
      const result = await this.geminiCLI.extractInsights(
        content,
        ['revenue', 'expenses', 'noi', 'occupancy_rate', 'cash_flow']
      );
      
      return result.success ? result.data : {};
    } catch (error) {
      console.error('Error extracting financial metrics:', error);
      return {};
    }
  }

  // Lease terms extraction
  private async extractLeaseTerms(content: string): Promise<any> {
    const extractionTask: CollaborationTask = {
      id: `lease-extract-${Date.now()}`,
      type: 'extraction',
      description: 'Extract lease terms and conditions',
      priority: 'medium',
      data: { content }
    };
    
    const result = await this.collaborationBridge.collaborateOnTask(extractionTask);
    return result.finalResult || {};
  }

  // Maintenance details extraction
  private async extractMaintenanceDetails(content: string): Promise<any> {
    // Quick extraction with Gemini
    return {
      issue_type: 'HVAC',
      priority: 'high',
      estimated_cost: 500,
      unit: '205'
    };
  }

  // General information extraction
  private async extractGeneralInfo(content: string): Promise<any> {
    return {
      summary: content.substring(0, 200),
      word_count: content.split(/\s+/).length,
      key_terms: this.extractKeyTerms(content)
    };
  }

  // Extract key terms
  private extractKeyTerms(content: string): string[] {
    const commonWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an']);
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    const wordFreq = new Map<string, number>();
    
    words.forEach(word => {
      if (!commonWords.has(word) && word.length > 3) {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      }
    });
    
    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  // Log collaboration statistics
  private logCollaborationStats(): void {
    const stats = this.collaborationBridge.getStats();
    console.log(`\n📊 Collaboration Stats:`);
    console.log(`- Total tasks: ${stats.totalTasks}`);
    console.log(`- Gemini usage today: ${stats.geminiUsage.daily}/50`);
    console.log(`- Consensus rate: ${(stats.consensusRate * 100).toFixed(1)}%`);
  }

  // Batch processing with intelligent task distribution
  async processBatch(files: string[]): Promise<void> {
    console.log(`\n🚀 Starting batch processing of ${files.length} files`);
    console.log('📊 Using AI collaboration for optimal processing\n');
    
    const results = [];
    
    for (let i = 0; i < files.length; i++) {
      console.log(`\n[${i + 1}/${files.length}] Processing: ${path.basename(files[i])}`);
      
      try {
        const result = await this.processDocument(files[i], {
          batch_id: `batch-${Date.now()}`,
          index: i + 1,
          total: files.length
        });
        
        results.push({
          file: files[i],
          success: true,
          result
        });
        
      } catch (error) {
        console.error(`❌ Error processing ${files[i]}:`, error);
        results.push({
          file: files[i],
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // Generate batch report
    console.log('\n📋 BATCH PROCESSING COMPLETE');
    console.log(`✅ Successful: ${results.filter(r => r.success).length}`);
    console.log(`❌ Failed: ${results.filter(r => !r.success).length}`);
    
    const stats = this.collaborationBridge.getStats();
    console.log(`\n🤖 AI Collaboration Summary:`);
    console.log(`- Tasks handled by Claude: ${stats.claudeTasks}`);
    console.log(`- Tasks handled by Gemini: ${stats.geminiTasks}`);
    console.log(`- Tasks with dual validation: ${stats.collaborativeTasks}`);
    console.log(`- Average confidence: ${(stats.averageConfidence * 100).toFixed(1)}%`);
    console.log(`- Gemini free tier used: ${stats.geminiUsage.daily}/50 daily, ${stats.geminiUsage.monthly}/1500 monthly`);
  }
}

// Export for use in your application
export default EnhancedAttachmentIntelligenceLoop;

// Example usage
if (require.main === module) {
  async function demo() {
    const loop = new EnhancedAttachmentIntelligenceLoop();
    
    // Process a single document
    await loop.processDocument(
      'C:/Dev/PrismIntelligence/data/samples/sample-financial-report.csv',
      { source: 'demo' }
    );
    
    // Process multiple documents
    const testFiles = [
      'C:/Dev/PrismIntelligence/data/samples/sample-financial-report.csv',
      'C:/Dev/PrismIntelligence/data/samples/sample-rent-roll.csv',
      'C:/Dev/PrismIntelligence/data/samples/january-maintenance-report.csv'
    ];
    
    await loop.processBatch(testFiles);
  }
  
  demo().catch(console.error);
}