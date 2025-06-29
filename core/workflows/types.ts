// Core types for the financial pipeline
export interface EmailAttachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  data: Buffer | string;
  emailId: string;
  sender: string;
  receivedAt: Date;
}

export interface IngestionContext {
  companyId: string;
  propertyId?: string;
  emailId: string;
  userId?: string;
  source: 'email' | 'upload' | 'api';
}

export enum ReportType {
  INCOME_STATEMENT = 'income_statement',
  BALANCE_SHEET = 'balance_sheet',
  CASH_FLOW = 'cash_flow_statement',
  TRIAL_BALANCE = 'trial_balance',
  GENERAL_LEDGER = 'general_ledger',
  OPERATIONAL = 'operational_report',
  CUSTOM = 'custom_report'
}

export enum StructureType {
  STRUCTURED = 'structured',
  SEMI_STRUCTURED = 'semi_structured',
  UNSTRUCTURED = 'unstructured'
}

export interface ClassificationResult {
  reportType: ReportType;
  structureType: StructureType;
  confidence: number;
  indicators: string[];
  timePeriod?: {
    start: Date;
    end: Date;
  };
  metadata: Record<string, any>;
}

export interface ExtractedData {
  fields: Record<string, any>;
  tables: Array<{
    name: string;
    headers: string[];
    rows: any[][];
  }>;
  metadata: {
    currency?: string;
    unit?: string;
    period?: {
      start: Date;
      end: Date;
    };
  };
}

export interface NormalizedFinancialData {
  reportType: ReportType;
  companyId: string;
  propertyId?: string;
  period: {
    start: Date;
    end: Date;
  };
  currency: string;
  data: Record<string, any>;
  metrics: FinancialMetric[];
  quality: QualityMetrics;
}

export interface FinancialMetric {
  name: string;
  value: number;
  unit: string;
  category: string;
  confidence: number;
  isDerived: boolean;
  formula?: string;
}

export interface QualityMetrics {
  completeness: number;      // % of expected fields found
  accuracy: number;          // Validation rules passed
  consistency: number;       // Cross-reference accuracy
  confidence: number;        // AI extraction confidence
  overallScore: number;      // Weighted average
  issues: QualityIssue[];
}

export interface QualityIssue {
  field: string;
  issue: string;
  severity: 'low' | 'medium' | 'high';
  suggestion?: string;
}

export interface ProcessingResult {
  success: boolean;
  ingestionId: string;
  attachmentId: string;
  data?: NormalizedFinancialData;
  errors?: ProcessingError[];
  warnings?: string[];
}

export interface ProcessingError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

// Standard schemas for different report types
export const INCOME_STATEMENT_SCHEMA = {
  revenue: {
    rental_income: { type: 'number', required: true },
    other_income: { type: 'number', required: false },
    total_revenue: { type: 'number', required: true }
  },
  expenses: {
    operating_expenses: { type: 'number', required: true },
    maintenance: { type: 'number', required: false },
    utilities: { type: 'number', required: false },
    management_fees: { type: 'number', required: false },
    insurance: { type: 'number', required: false },
    property_tax: { type: 'number', required: false },
    other_expenses: { type: 'number', required: false },
    total_expenses: { type: 'number', required: true }
  },
  calculations: {
    net_operating_income: { type: 'number', derived: true },
    net_income: { type: 'number', required: true }
  }
};

export const BALANCE_SHEET_SCHEMA = {
  assets: {
    current_assets: {
      cash: { type: 'number', required: true },
      accounts_receivable: { type: 'number', required: false },
      prepaid_expenses: { type: 'number', required: false },
      total_current_assets: { type: 'number', required: true }
    },
    fixed_assets: {
      property_value: { type: 'number', required: true },
      accumulated_depreciation: { type: 'number', required: false },
      equipment: { type: 'number', required: false },
      total_fixed_assets: { type: 'number', required: true }
    },
    total_assets: { type: 'number', required: true }
  },
  liabilities: {
    current_liabilities: {
      accounts_payable: { type: 'number', required: false },
      accrued_expenses: { type: 'number', required: false },
      current_portion_debt: { type: 'number', required: false },
      total_current_liabilities: { type: 'number', required: true }
    },
    long_term_liabilities: {
      mortgage_payable: { type: 'number', required: false },
      other_long_term_debt: { type: 'number', required: false },
      total_long_term_liabilities: { type: 'number', required: true }
    },
    total_liabilities: { type: 'number', required: true }
  },
  equity: {
    contributed_capital: { type: 'number', required: false },
    retained_earnings: { type: 'number', required: false },
    total_equity: { type: 'number', required: true }
  }
};

// Field mapping variations
export const FIELD_VARIATIONS = {
  revenue: ['revenue', 'income', 'sales', 'gross receipts', 'total income', 'rental income'],
  expenses: ['expenses', 'costs', 'expenditures', 'operating costs', 'total expenses'],
  net_income: ['net income', 'profit', 'earnings', 'bottom line', 'net profit'],
  assets: ['assets', 'total assets', 'property and equipment'],
  liabilities: ['liabilities', 'debt', 'obligations', 'total liabilities'],
  cash: ['cash', 'cash and equivalents', 'bank balance'],
  occupancy_rate: ['occupancy', 'occupancy rate', 'occupied %', 'leased %']
};// Update IngestionContext to use investor_id
export interface IngestionContext {
  companyId: string;  // Keep for backward compatibility
  investorId: string; // New field
  propertyId?: string;
  emailId: string;
  userId?: string;
  source: 'email' | 'upload' | 'api';
}

// Or better yet, just update to use investorId everywhere:
export interface IngestionContext {
  investorId: string;  // Changed from companyId
  propertyId?: string;
  emailId: string;
  userId?: string;
  source: 'email' | 'upload' | 'api';
}