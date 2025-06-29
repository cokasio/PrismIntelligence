// Pipeline configuration and constants
export const PIPELINE_CONFIG = {
  // File processing limits
  maxFileSize: 50 * 1024 * 1024, // 50MB
  supportedFormats: [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'text/plain',
    'image/png',
    'image/jpeg'
  ],
  
  // AI Classification
  classification: {
    model: 'claude-3-opus-20240229',
    temperature: 0.1,
    maxRetries: 3,
    confidenceThreshold: 0.7
  },
  
  // Extraction settings
  extraction: {
    ocrEnabled: false, // Enable when OCR service is ready
    maxTableRows: 10000,
    maxConcurrentExtractions: 3
  },
  
  // Normalization rules
  normalization: {
    defaultCurrency: 'USD',
    requiredConfidence: 0.8,
    fieldMappingLearning: true
  },
  
  // Validation thresholds
  validation: {
    minQualityScore: 0.7,
    balanceSheetTolerance: 0.01, // 1 cent
    percentageTolerance: 0.001,   // 0.1%
    requireManualReview: 0.5      // Below 50% quality
  },
  
  // Processing priorities
  priorities: {
    income_statement: 1,      // Highest
    balance_sheet: 2,
    cash_flow_statement: 3,
    operational_report: 4,
    custom_report: 5         // Lowest
  },
  
  // Storage settings
  storage: {
    preserveOriginals: true,
    compressionEnabled: false,
    retentionDays: 2555  // 7 years for compliance
  }
};

// Standard financial periods
export const FINANCIAL_PERIODS = {
  monthly: {
    pattern: /(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}/i,
    duration: 'P1M'
  },
  quarterly: {
    pattern: /Q[1-4]\s+\d{4}/i,
    duration: 'P3M'
  },
  annual: {
    pattern: /(?:year|annual|yearly)\s+\d{4}/i,
    duration: 'P1Y'
  }
};

// Income Statement line item patterns
export const INCOME_STATEMENT_PATTERNS = {
  revenue: {
    patterns: [
      /rental\s+income/i,
      /lease\s+revenue/i,
      /gross\s+receipts/i,
      /total\s+revenue/i,
      /operating\s+revenue/i
    ],
    category: 'revenue'
  },
  expenses: {
    patterns: [
      /operating\s+expense/i,
      /maintenance/i,
      /utilities/i,
      /management\s+fee/i,
      /insurance/i,
      /property\s+tax/i
    ],
    category: 'expense'
  },
  noi: {
    patterns: [
      /net\s+operating\s+income/i,
      /noi/i,
      /operating\s+income/i
    ],
    category: 'calculation'
  }
};

// Balance Sheet patterns
export const BALANCE_SHEET_PATTERNS = {
  assets: {
    patterns: [
      /total\s+assets/i,
      /current\s+assets/i,
      /fixed\s+assets/i,
      /property.*equipment/i
    ],
    category: 'asset'
  },
  liabilities: {
    patterns: [
      /total\s+liabilities/i,
      /current\s+liabilities/i,
      /long.*term.*debt/i,
      /mortgage/i
    ],
    category: 'liability'
  },
  equity: {
    patterns: [
      /equity/i,
      /retained\s+earnings/i,
      /capital/i
    ],
    category: 'equity'
  }
};

// Queue configuration
export const QUEUE_CONFIG = {
  financial_processing: {
    name: 'financial-processing',
    concurrency: 3,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    }
  },
  high_priority: {
    name: 'financial-priority',
    concurrency: 5,
    attempts: 5
  }
};

// Export all configs
export default {
  pipeline: PIPELINE_CONFIG,
  periods: FINANCIAL_PERIODS,
  incomePatterns: INCOME_STATEMENT_PATTERNS,
  balancePatterns: BALANCE_SHEET_PATTERNS,
  queues: QUEUE_CONFIG
};