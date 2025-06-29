# 🧠 Attachment Intelligence Loop for PrismIntelligence
## Advanced File Processing Architecture

### 🎯 Core Innovation: "Drop Folder Intelligence"

Instead of complex email attachment parsing, we create an intelligent file processing pipeline that watches designated folders and automatically processes any files dropped there.

## ⚙️ ENHANCED SYSTEM FLOW

```
┌─────────────────────┐
│   Email System     │ ← SendGrid/CloudMailin/IMAP
│   (extracts files) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Drop Folder Watch  │ ← C:\PrismIntelligence\incoming\
│  (file detection)   │   - reports/
└──────────┬──────────┘   - leases/
           │              - maintenance/
           ▼              - financial/
┌─────────────────────┐
│      AIDR Core      │ ← Intelligent file classification
│  (Route & Classify) │   "Is this a rent roll or P&L?"
└──────────┬──────────┘
           │
           ▼
    ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
    │   Gemini    │         │   Claude    │         │  Specialized│
    │  (Complex   │         │  (Business  │         │   Parsers   │
    │   Layouts)  │         │   Logic)    │         │  (CSV/JSON) │
    └─────────────┘         └─────────────┘         └─────────────┘
           │                         │                         │
           └─────────────┬───────────────────────────────────┘
                         ▼
           ┌─────────────────────────┐
           │ Structured Data Builder │ ← Normalize to PrismIntelligence schema
           │    (Schema Mapping)     │
           └─────────────┬───────────┘
                         ▼
           ┌─────────────────────────┐
           │    Supabase/Database    │ ← Store with metadata and lineage
           │   (PrismIntelligence)   │
           └─────────────┬───────────┘
                         ▼
           ┌─────────────────────────┐
           │   Intelligence Engine   │ ← Your existing AI analysis
           │  (Insights & Actions)   │
           └─────────────────────────┘
```

## 🎯 PrismIntelligence File Types & Intelligence

### 📊 Financial Reports
- **P&L Statements** → Revenue/expense analysis with variance explanations
- **Balance Sheets** → Asset utilization and debt analysis
- **Cash Flow** → Liquidity insights and forecasting
- **Rent Rolls** → Occupancy trends and lease analysis

### 📄 Lease Documents
- **New Leases** → Critical date extraction, risk assessment
- **Amendments** → Change impact analysis
- **Renewals** → Market rate comparisons

### 🔧 Maintenance Reports
- **Work Orders** → Cost trend analysis, vendor performance
- **Inspection Reports** → Risk prioritization, budget planning
- **Invoices** → Spend analysis, budget variance

### 📈 Market Reports
- **Comparables** → Competitive positioning analysis
- **Market Studies** → Investment opportunity identification

## 🛠️ Enhanced Tech Stack for PrismIntelligence

### Core Components
```javascript
// File Watcher Service
const watcher = chokidar.watch('C:/PrismIntelligence/incoming/**/*', {
  ignored: /[\/\\]\./,
  persistent: true
});

// AIDR Classification
const classifyFile = async (filePath) => {
  const metadata = await extractMetadata(filePath);
  const classification = await gemini.classify({
    filename: path.basename(filePath),
    size: metadata.size,
    preview: await getFilePreview(filePath),
    context: "property management document"
  });
  
  return {
    type: classification.documentType, // "rent_roll", "p_l", "lease", etc.
    confidence: classification.confidence,
    suggestedParser: classification.parser,
    propertyContext: classification.propertyInfo
  };
};
```

### Database Schema Enhancement
```sql
-- Enhanced schema for PrismIntelligence
CREATE TABLE parsed_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  filepath TEXT NOT NULL,
  document_type TEXT NOT NULL, -- rent_roll, financial, lease, maintenance
  property_id UUID REFERENCES properties(id),
  period_start DATE,
  period_end DATE,
  
  -- Raw data storage
  raw_content JSONB,
  
  -- Structured extraction
  financial_data JSONB, -- revenues, expenses, ratios
  lease_data JSONB,     -- tenant info, terms, dates
  maintenance_data JSONB, -- work orders, costs, schedules
  
  -- Intelligence layer
  insights JSONB,       -- AI-generated insights
  action_items JSONB,   -- Recommended actions
  risk_flags JSONB,     -- Identified risks
  
  -- Metadata
  processing_agent TEXT, -- gemini, claude, custom
  confidence_score DECIMAL(3,2),
  processing_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  
  -- Validation
  human_reviewed BOOLEAN DEFAULT FALSE,
  validation_notes TEXT
);

-- Property context for better analysis
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  property_type TEXT, -- office, retail, residential, mixed
  units INTEGER,
  square_footage INTEGER,
  market_area TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔄 Intelligent Processing Workflow

### 1. File Detection & Routing
```python
async def process_incoming_file(file_path):
    # Step 1: Classify the document
    classification = await aidr_classify(file_path)
    
    # Step 2: Route to appropriate processor
    if classification.type == "financial_statement":
        return await process_financial_document(file_path, classification)
    elif classification.type == "rent_roll":
        return await process_rent_roll(file_path, classification)
    elif classification.type == "lease_document":
        return await process_lease_document(file_path, classification)
    elif classification.type == "maintenance_report":
        return await process_maintenance_document(file_path, classification)
    
    # Step 3: Generate insights
    insights = await generate_property_insights(processed_data)
    
    # Step 4: Store with full context
    await store_with_intelligence(processed_data, insights, classification)
```

### 2. Multi-Agent Processing
```python
async def process_financial_document(file_path, classification):
    # Gemini: Extract complex table layouts
    raw_data = await gemini.extract_tables(file_path, {
        "expected_sections": ["income", "expenses", "net_operating_income"],
        "property_context": classification.propertyInfo
    })
    
    # Claude: Business intelligence analysis
    analysis = await claude.analyze_financial_performance(raw_data, {
        "compare_to": "prior_period",
        "identify_variances": True,
        "generate_insights": True,
        "create_action_items": True
    })
    
    return {
        "raw_data": raw_data,
        "analysis": analysis,
        "confidence": min(raw_data.confidence, analysis.confidence)
    }
```

## 🚀 Implementation Plan for PrismIntelligence

### Phase 1: Core File Processing (Week 1)
1. **File Watcher Service** - Monitor incoming folders
2. **AIDR Classification** - Route files intelligently
3. **Basic Parsers** - Handle CSV, Excel, PDF
4. **Database Integration** - Store structured results

### Phase 2: AI Enhancement (Week 2)
1. **Gemini Integration** - Complex layout extraction
2. **Claude Analysis** - Business intelligence layer
3. **Multi-Agent Coordination** - Best tool for each task
4. **Confidence Scoring** - Quality assessment

### Phase 3: Property Intelligence (Week 3)
1. **Property Context** - Link documents to properties
2. **Trend Analysis** - Cross-document insights
3. **Automated Insights** - AI-generated recommendations
4. **Action Items** - Specific next steps

### Phase 4: Production Features (Week 4)
1. **Human Review Workflow** - Validation interface
2. **Error Handling** - Graceful failure recovery  
3. **Performance Optimization** - Handle high volume
4. **Monitoring & Alerts** - System health tracking

## 💡 Strategic Advantages

### For Property Managers
- **Instant Processing**: Drop files, get insights immediately
- **No Training Required**: Familiar folder-based workflow
- **Multi-Format Support**: Handle any document type
- **Contextual Intelligence**: Understand property-specific nuances

### For Your Platform
- **Scalable Architecture**: Handle growing file volumes
- **Flexible Integration**: Work with any email system
- **Quality Control**: Confidence scoring and human review
- **Competitive Moat**: Unique multi-agent intelligence

## 🎯 Next Steps

1. **Build Core Watcher** - File detection and routing
2. **Implement AIDR** - Classification intelligence
3. **Add Gemini/Claude** - Multi-agent processing
4. **Create Test Suite** - Sample property documents
5. **Deploy & Test** - Real-world validation

This architecture transforms PrismIntelligence from a report processor into a true Property Intelligence Operating System!
