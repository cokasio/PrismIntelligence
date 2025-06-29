# AI-Driven Financial Report Ingestion Pipeline Architecture

## Overview

This document outlines the architecture for a dynamic, AI-driven pipeline that intelligently processes structured and unstructured financial report attachments, maintaining flexibility, accuracy, and compliance.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Email Ingestion Layer (CloudMailin)                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                    ↓                                     │
│                        Attachment Processor Service                      │
│                    ┌────────────────────────────────┐                  │
│                    │  • File Type Detection         │                  │
│                    │  • Virus/Security Scan         │                  │
│                    │  • Initial Metadata Extraction │                  │
│                    └────────────────────────────────┘                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                    ↓                                     │
│                      AI Classification Pipeline                          │
│         ┌─────────────────┬─────────────────┬─────────────────┐       │
│         │  Report Type    │  Data Structure  │   Confidence    │       │
│         │  Classifier     │  Analyzer        │   Scoring       │       │
│         └─────────────────┴─────────────────┴─────────────────┘       │
├─────────────────────────────────────────────────────────────────────────┤
│                                    ↓                                     │
│                    Format-Specific Extraction Layer                      │
│    ┌──────────┬──────────┬──────────┬──────────┬──────────────┐      │
│    │   PDF    │  Excel   │   CSV    │  Image   │  Unstructured │      │
│    │ Extractor│ Extractor│ Extractor│   OCR    │     Text      │      │
│    └──────────┴──────────┴──────────┴──────────┴──────────────┘      │
├─────────────────────────────────────────────────────────────────────────┤
│                                    ↓                                     │
│                    Semantic Understanding Layer                          │
│         ┌─────────────────┬─────────────────┬─────────────────┐       │
│         │  Field Mapping  │ Value Extraction │  Unit/Currency  │       │
│         │  (AI-Powered)   │ & Normalization │   Detection     │       │
│         └─────────────────┴─────────────────┴─────────────────┘       │
├─────────────────────────────────────────────────────────────────────────┤
│                                    ↓                                     │
│                      Data Validation & Storage                           │
│         ┌─────────────────┬─────────────────┬─────────────────┐       │
│         │ Schema Mapping  │ Quality Checks   │ Vector Embeddings│       │
│         │ & Validation    │ & Reconciliation │   Generation     │       │
│         └─────────────────┴─────────────────┴─────────────────┘       │
├─────────────────────────────────────────────────────────────────────────┤
│                                    ↓                                     │
│                         Supabase Database                                │
│         ┌─────────────────┬─────────────────┬─────────────────┐       │
│         │ Raw Data Store  │ Normalized Data  │  Audit Trail    │       │
│         │ (JSONB + Files) │   (Structured)   │  & Lineage      │       │
│         └─────────────────┴─────────────────┴─────────────────┘       │
└─────────────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Attachment Processor Service

**Purpose**: Initial intake and security validation

**Key Features**:
- Multi-format support (PDF, Excel, CSV, Images, HTML)
- File validation and security scanning
- Metadata extraction (filename patterns, dates, sender info)
- Duplicate detection using file hashes

**Implementation**:
```typescript
interface AttachmentMetadata {
  id: string;
  email_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  hash: string;
  received_at: Date;
  sender: string;
  initial_classification?: ReportType;
}
```

### 2. AI Classification Pipeline

**Purpose**: Intelligent document classification and structure analysis

**Three-Stage Classification**:
1. **Report Type Classifier**: Identifies document type (Income Statement, Balance Sheet, etc.)
2. **Structure Analyzer**: Determines if data is structured, semi-structured, or unstructured
3. **Confidence Scoring**: Assigns reliability scores to guide processing decisions

**AI Prompts**:
```typescript
const CLASSIFICATION_PROMPT = `
Analyze this financial document and classify it:

1. Document Type (select one):
   - income_statement
   - balance_sheet
   - cash_flow_statement
   - operational_report
   - trial_balance
   - general_ledger
   - other

2. Data Structure:
   - structured (clear tables/columns)
   - semi_structured (mixed format)
   - unstructured (narrative/text)

3. Key Indicators Found:
   - List financial terms identified
   - Time period covered
   - Company/property identifiers

4. Confidence Score (0-100):
   - Classification confidence
   - Extraction difficulty estimate
`;
```

### 3. Format-Specific Extractors

**PDF Extractor**:
- Table detection and extraction
- Text parsing with layout preservation
- Embedded Excel/CSV extraction

**Excel Extractor**:
- Multi-sheet handling
- Formula evaluation
- Named range detection
- Pivot table processing

**CSV Extractor**:
- Header detection and mapping
- Delimiter inference
- Data type detection

**OCR Pipeline** (for scanned documents):
- Pre-processing (deskew, denoise)
- Text extraction with confidence scores
- Table reconstruction

**Unstructured Text Handler**:
- NLP-based value extraction
- Context-aware parsing
- Financial entity recognition

### 4. Semantic Understanding Layer

**Purpose**: Map extracted data to standardized schema using AI

**Key Components**:

**Field Mapping Engine**:
```typescript
const FIELD_MAPPING_PROMPT = `
Map these extracted fields to standard financial categories:

Extracted: ${extractedFields}

Standard Categories:
- revenue (total_revenue, service_revenue, rental_income, other_revenue)
- expenses (operating_expenses, maintenance, utilities, payroll, other_expenses)
- assets (current_assets, fixed_assets, total_assets)
- liabilities (current_liabilities, long_term_debt, total_liabilities)
- metrics (occupancy_rate, noi, cash_flow)

Provide mapping with confidence scores.
Handle variations like "Sales" → "revenue", "Repairs" → "maintenance".
`;
```

**Value Normalization**:
- Currency conversion and standardization
- Date format normalization
- Percentage vs decimal handling
- Missing value inference

### 5. Data Validation & Quality Assurance

**Validation Rules**:
- Balance sheet equation checks
- Income statement totals verification
- Year-over-year variance thresholds
- Cross-report reconciliation

**Quality Scoring**:
```typescript
interface QualityMetrics {
  completeness: number;      // % of expected fields found
  accuracy: number;          // Validation rules passed
  consistency: number;       // Cross-reference accuracy
  confidence: number;        // AI extraction confidence
  overall_score: number;     // Weighted average
}
```

### 6. Vector Embeddings & Semantic Search

**Purpose**: Enable intelligent search and similarity matching

**Embedding Strategy**:
- Embed full documents for similarity search
- Embed individual line items for semantic matching
- Create specialized embeddings for financial metrics

```typescript
// Generate embeddings for different purposes
async function generateFinancialEmbeddings(data: ProcessedReport) {
  // Document-level embedding for similarity
  const docEmbedding = await generateEmbedding(data.fullText);
  
  // Metric-specific embeddings for search
  const metricEmbeddings = await Promise.all(
    data.metrics.map(metric => 
      generateEmbedding(`${metric.name}: ${metric.value} ${metric.context}`)
    )
  );
  
  return { docEmbedding, metricEmbeddings };
}
```

## Database Schema Extensions

### New Tables for Pipeline

```sql
-- Report ingestion tracking
CREATE TABLE report_ingestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  email_id TEXT,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attachment processing
CREATE TABLE report_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingestion_id UUID REFERENCES report_ingestions(id),
  filename TEXT,
  file_type TEXT,
  file_size INTEGER,
  file_hash TEXT,
  storage_path TEXT,
  
  -- Classification results
  report_type TEXT,
  structure_type TEXT,
  classification_confidence DECIMAL(3,2),
  
  -- Processing status
  extraction_status TEXT,
  extraction_metadata JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Extracted financial data (flexible schema)
CREATE TABLE financial_data_raw (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attachment_id UUID REFERENCES report_attachments(id),
  company_id UUID REFERENCES companies(id),
  property_id UUID REFERENCES properties(id),
  
  -- Flexible data storage
  data_type TEXT, -- income_statement, balance_sheet, etc.
  period_start DATE,
  period_end DATE,
  currency TEXT DEFAULT 'USD',
  
  -- Raw extracted data
  raw_data JSONB,
  
  -- Normalized data
  normalized_data JSONB,
  
  -- Quality metrics
  quality_score DECIMAL(3,2),
  validation_results JSONB,
  
  -- Embeddings for search
  embedding VECTOR(1536),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Standardized financial metrics
CREATE TABLE financial_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  property_id UUID REFERENCES properties(id),
  source_id UUID REFERENCES financial_data_raw(id),
  
  metric_name TEXT,
  metric_value DECIMAL(20,2),
  metric_unit TEXT,
  period_start DATE,
  period_end DATE,
  
  -- Context and lineage
  calculation_method TEXT,
  confidence_score DECIMAL(3,2),
  
  -- For semantic search
  embedding VECTOR(1536),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit trail for compliance
CREATE TABLE ingestion_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingestion_id UUID REFERENCES report_ingestions(id),
  action TEXT,
  details JSONB,
  performed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Processing Pipeline Implementation

### Stage 1: Intake and Classification

```typescript
export async function processFinancialAttachment(
  attachment: EmailAttachment,
  context: IngestionContext
): Promise<ProcessedAttachment> {
  // 1. Security validation
  await validateAttachment(attachment);
  
  // 2. Store raw file
  const storagePath = await storeRawFile(attachment);
  
  // 3. Extract initial content
  const rawContent = await extractContent(attachment);
  
  // 4. AI Classification
  const classification = await classifyDocument(rawContent);
  
  // 5. Route to appropriate processor
  const processor = getProcessor(classification.report_type, attachment.file_type);
  
  // 6. Extract structured data
  const extractedData = await processor.extract(rawContent, classification);
  
  // 7. Normalize and validate
  const normalizedData = await normalizeFinancialData(extractedData, classification);
  
  // 8. Generate embeddings
  const embeddings = await generateFinancialEmbeddings(normalizedData);
  
  // 9. Store results
  await storeProcessedData(normalizedData, embeddings, context);
  
  return {
    success: true,
    data: normalizedData,
    quality: calculateQualityScore(normalizedData)
  };
}
```

### Stage 2: Semantic Field Mapping

```typescript
export async function mapFinancialFields(
  extracted: ExtractedData,
  reportType: ReportType
): Promise<MappedData> {
  // Get standard schema for report type
  const standardSchema = getStandardSchema(reportType);
  
  // Use AI to map fields
  const mapping = await claude.createMessage({
    model: 'claude-3-opus-20240229',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `
        Map these extracted financial fields to our standard schema:
        
        Extracted Fields: ${JSON.stringify(extracted.fields)}
        Standard Schema: ${JSON.stringify(standardSchema)}
        
        Consider common variations:
        - Revenue: sales, income, gross receipts
        - Expenses: costs, expenditures, outflows
        - Net Income: profit, earnings, bottom line
        
        Return mapping with confidence scores.
      `
    }]
  });
  
  return parseMappingResponse(mapping);
}
```

### Stage 3: Income Statement Prioritization

```typescript
export class IncomeStatementProcessor {
  static priority = 1; // Highest priority
  
  async process(data: ExtractedData): Promise<IncomeStatement> {
    // Standard income statement structure
    const template = {
      revenue: {
        rental_income: 0,
        other_income: 0,
        total_revenue: 0
      },
      expenses: {
        operating: 0,
        maintenance: 0,
        utilities: 0,
        management: 0,
        other: 0,
        total_expenses: 0
      },
      noi: 0, // Net Operating Income
      net_income: 0
    };
    
    // Map extracted data to template
    const mapped = await mapToTemplate(data, template);
    
    // Calculate derived metrics
    mapped.noi = mapped.revenue.total_revenue - mapped.expenses.total_expenses;
    
    // Validate calculations
    await validateIncomeStatement(mapped);
    
    return mapped;
  }
}
```

## Advanced Features

### 1. Multi-Version Template Handling

```typescript
export class TemplateVersionManager {
  private templates: Map<string, ReportTemplate[]> = new Map();
  
  async detectTemplate(content: string): Promise<ReportTemplate> {
    // Use AI to identify template version
    const features = await extractTemplateFeatures(content);
    
    // Match against known templates
    const matches = this.findMatchingTemplates(features);
    
    // Return best match or create new template
    return matches[0] || this.createNewTemplate(features);
  }
  
  async evolveTemplate(
    template: ReportTemplate,
    newExample: ExtractedData
  ): Promise<ReportTemplate> {
    // Learn from new examples to improve template matching
    template.examples.push(newExample);
    template.confidence = recalculateConfidence(template);
    return template;
  }
}
```

### 2. Semantic Understanding with Context

```typescript
export async function extractWithContext(
  text: string,
  documentType: string,
  historicalContext?: HistoricalData
): Promise<ExtractedValues> {
  const prompt = `
    Extract financial values from this ${documentType}.
    
    Text: ${text}
    
    Historical context:
    - Previous period revenue: ${historicalContext?.previousRevenue}
    - Typical expense ratio: ${historicalContext?.expenseRatio}
    
    Instructions:
    1. Identify all monetary values with their context
    2. Infer missing values when possible
    3. Flag anomalies based on historical trends
    4. Handle abbreviated numbers (5M = 5,000,000)
  `;
  
  const extraction = await claude.extract(prompt);
  return validateAndEnrich(extraction, historicalContext);
}
```

### 3. Continuous Learning Pipeline

```typescript
export class LearningPipeline {
  async improveFromFeedback(
    originalExtraction: ExtractedData,
    corrections: UserCorrections
  ): Promise<void> {
    // Store correction patterns
    await this.storeCorrection({
      original: originalExtraction,
      corrected: corrections,
      pattern: identifyPattern(originalExtraction, corrections)
    });
    
    // Update extraction rules
    await this.updateExtractionRules(corrections);
    
    // Retrain field mapping model
    await this.retrainFieldMapper();
  }
}
```

## Scalability Considerations

### 1. Parallel Processing
- Process multiple attachments concurrently
- Implement queue-based architecture with Bull
- Set processing priorities (Income Statement > Others)

### 2. Caching Strategy
- Cache classification results for similar documents
- Store common field mappings
- Reuse embeddings for similar content

### 3. Error Recovery
- Implement retry logic with exponential backoff
- Manual review queue for low-confidence extractions
- Partial processing capability

## Compliance & Audit Features

### 1. Complete Data Lineage
```typescript
interface DataLineage {
  source_email: string;
  source_attachment: string;
  processing_steps: ProcessingStep[];
  transformations: Transformation[];
  ai_decisions: AIDecision[];
  final_values: any;
  confidence_scores: ConfidenceMap;
}
```

### 2. Immutable Audit Trail
- Every processing step logged
- Original files preserved
- All AI decisions recorded
- User corrections tracked

### 3. Compliance Checks
- SOX compliance for financial data
- GAAP/IFRS validation rules
- Data retention policies
- Access control and permissions

## Next Steps

1. **Implement Core Pipeline** (Week 1)
   - Basic attachment processing
   - PDF and Excel extractors
   - Simple classification

2. **Add AI Intelligence** (Week 2)
   - Claude integration for classification
   - Semantic field mapping
   - Income statement prioritization

3. **Build Quality Assurance** (Week 3)
   - Validation rules
   - Confidence scoring
   - Manual review interface

4. **Scale and Optimize** (Week 4)
   - Queue implementation
   - Parallel processing
   - Performance monitoring

This architecture provides the flexibility to handle any financial document format while maintaining accuracy, compliance, and scalability.