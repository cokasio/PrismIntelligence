// Main financial pipeline orchestrator
import { EmailAttachment, IngestionContext, ProcessingResult } from './types';
import { classifyDocument } from './services/classifier';
import { extractContent } from './services/extractors';
import { normalizeFinancialData } from './services/normalizer';
import { validateFinancialData } from './services/validator';
import { generateEmbeddings } from './services/embeddings';
import { storeProcessedData } from './services/storage';
import { createAuditLog } from './services/audit';
import { getServiceSupabase } from '../../lib/supabase';
import crypto from 'crypto';

export class FinancialPipeline {
  private supabase = getServiceSupabase();

  async processAttachment(
    attachment: EmailAttachment,
    context: IngestionContext
  ): Promise<ProcessingResult> {
    let ingestionId: string;
    let attachmentId: string;

    try {
      // 1. Create ingestion record
      const ingestion = await this.createIngestionRecord(context);
      ingestionId = ingestion.id;

      await createAuditLog({
        ingestionId,
        action: 'ingestion_started',
        actionType: 'initialization',
        details: { context }
      });

      // 2. Validate and store attachment
      const attachmentRecord = await this.processAndStoreAttachment(
        attachment,
        ingestionId
      );
      attachmentId = attachmentRecord.id;

      // 3. Check for duplicates
      const isDuplicate = await this.checkDuplicate(attachmentRecord.file_hash);
      if (isDuplicate) {
        await this.updateIngestionStatus(ingestionId, 'completed', {
          note: 'Duplicate file detected',
          originalId: isDuplicate.id
        });
        return {
          success: true,
          ingestionId,
          attachmentId,
          warnings: ['Duplicate file - using existing data']
        };
      }

      // 4. Extract content based on file type
      const extractedContent = await extractContent(attachment);
      
      await createAuditLog({
        ingestionId,
        attachmentId,
        action: 'content_extracted',
        actionType: 'extraction',
        details: { 
          method: extractedContent.method,
          confidence: extractedContent.confidence 
        }
      });

      // 5. Classify document using AI
      const classification = await classifyDocument(extractedContent);
      
      await this.updateAttachmentClassification(attachmentId, classification);

      // 6. Extract structured data
      const extractedData = await this.extractStructuredData(
        extractedContent,
        classification,
        attachment.contentType
      );

      // 7. Normalize to standard schema
      const normalizedData = await normalizeFinancialData(
        extractedData,
        classification,
        context
      );

      // 8. Validate data quality
      const validationResult = await validateFinancialData(
        normalizedData,
        classification.reportType
      );

      normalizedData.quality = validationResult.quality;

      // 9. Generate embeddings for semantic search
      const embeddings = await generateEmbeddings(normalizedData);

      // 10. Store processed data
      await storeProcessedData({
        normalizedData,
        embeddings,
        attachmentId,
        context
      });

      // 11. Update field mapping templates
      await this.updateFieldMappings(
        extractedData,
        normalizedData,
        context.companyId
      );

      // 12. Complete ingestion
      await this.updateIngestionStatus(ingestionId, 'completed');

      return {
        success: true,
        ingestionId,
        attachmentId,
        data: normalizedData
      };

    } catch (error) {
      console.error('Pipeline error:', error);
      
      if (ingestionId) {
        await this.updateIngestionStatus(ingestionId, 'failed', {
          error: error.message,
          stack: error.stack
        });
      }

      return {
        success: false,
        ingestionId,
        attachmentId,
        errors: [{
          code: 'PIPELINE_ERROR',
          message: error.message,
          details: error
        }]
      };
    }
  }

  private async createIngestionRecord(context: IngestionContext) {
    const { data, error } = await this.supabase
      .from('report_ingestions')
      .insert({
        company_id: context.companyId,
        email_id: context.emailId,
        status: 'processing',
        started_at: new Date()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private async processAndStoreAttachment(
    attachment: EmailAttachment,
    ingestionId: string
  ) {
    // Calculate file hash for deduplication
    const hash = crypto
      .createHash('sha256')
      .update(attachment.data)
      .digest('hex');

    // Store raw file (implement your storage solution)
    const storagePath = await this.storeRawFile(attachment);

    const { data, error } = await this.supabase
      .from('report_attachments')
      .insert({
        ingestion_id: ingestionId,
        filename: attachment.filename,
        file_type: attachment.contentType,
        file_size: attachment.size,
        file_hash: hash,
        storage_path: storagePath,
        extraction_status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private async checkDuplicate(fileHash: string) {
    const { data } = await this.supabase
      .from('report_attachments')
      .select('id, ingestion_id')
      .eq('file_hash', fileHash)
      .single();

    return data;
  }

  private async updateAttachmentClassification(
    attachmentId: string,
    classification: any
  ) {
    const { error } = await this.supabase
      .from('report_attachments')
      .update({
        report_type: classification.reportType,
        structure_type: classification.structureType,
        classification_confidence: classification.confidence,
        classification_metadata: classification.metadata
      })
      .eq('id', attachmentId);

    if (error) throw error;
  }

  private async extractStructuredData(
    content: any,
    classification: any,
    contentType: string
  ) {
    // Route to appropriate extractor based on classification and content type
    const extractorMap = {
      'application/pdf': () => import('./services/extractors/pdf'),
      'application/vnd.ms-excel': () => import('./services/extractors/excel'),
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 
        () => import('./services/extractors/excel'),
      'text/csv': () => import('./services/extractors/csv'),
      'text/plain': () => import('./services/extractors/text')
    };

    const extractorModule = extractorMap[contentType] || extractorMap['text/plain'];
    const { extract } = await extractorModule();

    return extract(content, classification);
  }

  private async updateFieldMappings(
    extracted: any,
    normalized: any,
    companyId: string
  ) {
    // Learn from successful mappings to improve future extractions
    const mappings = this.identifySuccessfulMappings(extracted, normalized);

    for (const mapping of mappings) {
      await this.supabase
        .from('field_mapping_templates')
        .upsert({
          company_id: companyId,
          report_type: normalized.reportType,
          source_field: mapping.source,
          target_field: mapping.target,
          confidence_score: mapping.confidence,
          usage_count: 1,
          last_used: new Date()
        }, {
          onConflict: 'company_id,report_type,source_field',
          ignoreDuplicates: false
        });
    }
  }

  private identifySuccessfulMappings(extracted: any, normalized: any) {
    // Implement logic to identify which field mappings were successful
    const mappings = [];
    
    // This is a simplified example
    Object.keys(extracted.fields).forEach(sourceField => {
      Object.keys(normalized.data).forEach(targetField => {
        if (this.fieldsMatch(extracted.fields[sourceField], normalized.data[targetField])) {
          mappings.push({
            source: sourceField,
            target: targetField,
            confidence: 0.95
          });
        }
      });
    });

    return mappings;
  }

  private fieldsMatch(sourceValue: any, targetValue: any): boolean {
    // Implement matching logic
    return sourceValue === targetValue;
  }

  private async updateIngestionStatus(
    ingestionId: string,
    status: string,
    metadata?: any
  ) {
    const updates: any = {
      status,
      updated_at: new Date()
    };

    if (status === 'completed') {
      updates.completed_at = new Date();
    }

    if (metadata?.error) {
      updates.error_message = metadata.error;
    }

    const { error } = await this.supabase
      .from('report_ingestions')
      .update(updates)
      .eq('id', ingestionId);

    if (error) throw error;
  }

  private async storeRawFile(attachment: EmailAttachment): Promise<string> {
    // Implement your file storage solution
    // This could be Supabase Storage, S3, or local filesystem
    const filename = `${Date.now()}_${attachment.filename}`;
    const path = `raw_reports/${filename}`;
    
    // Example: Store in Supabase Storage
    // const { data, error } = await this.supabase.storage
    //   .from('reports')
    //   .upload(path, attachment.data);

    return path;
  }
}

// Export singleton instance
export const financialPipeline = new FinancialPipeline();