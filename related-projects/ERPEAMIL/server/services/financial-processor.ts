import { FinancialDocument } from '@shared/schema';

export interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  profitMargin: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  debtToEquityRatio: number;
  freeCashFlow: number;
  [key: string]: number;
}

export interface ProcessedFinancialData {
  type: 'income_statement' | 'balance_sheet' | 'cash_flow';
  metrics: FinancialMetrics;
  rawData: any[];
  summary: string;
  trends: Array<{
    period: string;
    value: number;
    metric: string;
  }>;
}

export class FinancialProcessor {
  
  async processCSVFile(fileContent: string, filename: string): Promise<ProcessedFinancialData> {
    // Simple CSV parser implementation
    const lines = fileContent.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        const value = values[index];
        row[header] = isNaN(Number(value)) ? value : Number(value);
      });
      data.push(row);
    }
    const fileType = this.determineFileType(filename, data);
    
    switch (fileType) {
      case 'income_statement':
        return this.processIncomeStatement(data);
      case 'balance_sheet':
        return this.processBalanceSheet(data);
      case 'cash_flow':
        return this.processCashFlow(data);
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  private determineFileType(filename: string, data: any[]): 'income_statement' | 'balance_sheet' | 'cash_flow' {
    const lower = filename.toLowerCase();
    
    if (lower.includes('income') || lower.includes('p&l') || lower.includes('profit')) {
      return 'income_statement';
    }
    if (lower.includes('balance') || lower.includes('assets')) {
      return 'balance_sheet';
    }
    if (lower.includes('cash') || lower.includes('flow')) {
      return 'cash_flow';
    }

    // Analyze column headers if filename doesn't give clear indication
    const headers = Object.keys(data[0] || {}).join(' ').toLowerCase();
    if (headers.includes('revenue') || headers.includes('expense')) {
      return 'income_statement';
    }
    if (headers.includes('asset') || headers.includes('liability')) {
      return 'balance_sheet';
    }
    if (headers.includes('cash') || headers.includes('operating')) {
      return 'cash_flow';
    }

    return 'income_statement'; // Default fallback
  }

  private processIncomeStatement(data: any[]): ProcessedFinancialData {
    const metrics: FinancialMetrics = {
      totalRevenue: 0,
      totalExpenses: 0,
      netIncome: 0,
      profitMargin: 0,
      totalAssets: 0,
      totalLiabilities: 0,
      totalEquity: 0,
      debtToEquityRatio: 0,
      freeCashFlow: 0
    };

    const trends: Array<{ period: string; value: number; metric: string }> = [];
    
    // Extract monthly columns (assuming format like "2023-01", "2023-02", etc.)
    const monthlyColumns = Object.keys(data[0] || {}).filter(col => 
      /^\d{4}-\d{2}$/.test(col) || /^\d{4}-\d{1,2}$/.test(col)
    );

    // Process each row
    for (const row of data) {
      const account = String(row['GL Account'] || row['Account'] || '');
      const description = String(row['Description'] || row['Account Description'] || '');
      
      // Calculate latest month totals
      const latestMonth = monthlyColumns[monthlyColumns.length - 1];
      const latestValue = Number(row[latestMonth]) || 0;

      // Classify accounts (this is a simplified classification)
      if (this.isRevenueAccount(account, description)) {
        metrics.totalRevenue += latestValue;
      } else if (this.isExpenseAccount(account, description)) {
        metrics.totalExpenses += Math.abs(latestValue);
      }

      // Add trends for key accounts
      if (monthlyColumns.length > 1) {
        monthlyColumns.forEach(month => {
          const value = Number(row[month]) || 0;
          if (value !== 0) {
            trends.push({
              period: month,
              value,
              metric: description || account
            });
          }
        });
      }
    }

    metrics.netIncome = metrics.totalRevenue - metrics.totalExpenses;
    metrics.profitMargin = metrics.totalRevenue > 0 ? 
      (metrics.netIncome / metrics.totalRevenue) * 100 : 0;

    const summary = this.generateIncomeStatementSummary(metrics, data.length);

    return {
      type: 'income_statement',
      metrics,
      rawData: data,
      summary,
      trends
    };
  }

  private processBalanceSheet(data: any[]): ProcessedFinancialData {
    const metrics: FinancialMetrics = {
      totalRevenue: 0,
      totalExpenses: 0,
      netIncome: 0,
      profitMargin: 0,
      totalAssets: 0,
      totalLiabilities: 0,
      totalEquity: 0,
      debtToEquityRatio: 0,
      freeCashFlow: 0
    };

    const trends: Array<{ period: string; value: number; metric: string }> = [];
    
    const monthlyColumns = Object.keys(data[0] || {}).filter(col => 
      /^\d{4}-\d{2}$/.test(col) || /^\d{4}-\d{1,2}$/.test(col)
    );

    for (const row of data) {
      const account = String(row['GL Account'] || row['Account'] || '');
      const description = String(row['Description'] || row['Account Description'] || '');
      
      const latestMonth = monthlyColumns[monthlyColumns.length - 1];
      const latestValue = Number(row[latestMonth]) || 0;

      // Classify balance sheet accounts
      if (this.isAssetAccount(account)) {
        metrics.totalAssets += latestValue;
      } else if (this.isLiabilityAccount(account)) {
        metrics.totalLiabilities += Math.abs(latestValue);
      } else if (this.isEquityAccount(account)) {
        metrics.totalEquity += latestValue;
      }

      // Add trends
      monthlyColumns.forEach(month => {
        const value = Number(row[month]) || 0;
        if (value !== 0) {
          trends.push({
            period: month,
            value,
            metric: description || account
          });
        }
      });
    }

    metrics.debtToEquityRatio = metrics.totalEquity > 0 ? 
      metrics.totalLiabilities / metrics.totalEquity : 0;

    const summary = this.generateBalanceSheetSummary(metrics, data.length);

    return {
      type: 'balance_sheet',
      metrics,
      rawData: data,
      summary,
      trends
    };
  }

  private processCashFlow(data: any[]): ProcessedFinancialData {
    const metrics: FinancialMetrics = {
      totalRevenue: 0,
      totalExpenses: 0,
      netIncome: 0,
      profitMargin: 0,
      totalAssets: 0,
      totalLiabilities: 0,
      totalEquity: 0,
      debtToEquityRatio: 0,
      freeCashFlow: 0
    };

    const trends: Array<{ period: string; value: number; metric: string }> = [];
    
    const monthlyColumns = Object.keys(data[0] || {}).filter(col => 
      /^\d{4}-\d{2}$/.test(col) || /^\d{4}-\d{1,2}$/.test(col)
    );

    let operatingCashFlow = 0;
    let capitalExpenditures = 0;

    for (const row of data) {
      const account = String(row['GL Account'] || row['Account'] || '');
      const description = String(row['Description'] || row['Account Description'] || '');
      
      const latestMonth = monthlyColumns[monthlyColumns.length - 1];
      const latestValue = Number(row[latestMonth]) || 0;

      // Simplified cash flow classification
      if (this.isOperatingCashFlowAccount(account, description)) {
        operatingCashFlow += latestValue;
      } else if (this.isCapitalExpenditureAccount(account, description)) {
        capitalExpenditures += Math.abs(latestValue);
      }

      monthlyColumns.forEach(month => {
        const value = Number(row[month]) || 0;
        if (value !== 0) {
          trends.push({
            period: month,
            value,
            metric: description || account
          });
        }
      });
    }

    metrics.freeCashFlow = operatingCashFlow - capitalExpenditures;

    const summary = this.generateCashFlowSummary(metrics, data.length);

    return {
      type: 'cash_flow',
      metrics,
      rawData: data,
      summary,
      trends
    };
  }

  // Account classification helper methods
  private isRevenueAccount(account: string, description: string): boolean {
    const revenueIndicators = ['4000', '4005', '4100', '4110', '4200', '4300', '4400'];
    return revenueIndicators.includes(account) || 
           description.toLowerCase().includes('rent') ||
           description.toLowerCase().includes('revenue') ||
           description.toLowerCase().includes('income');
  }

  private isExpenseAccount(account: string, description: string): boolean {
    const expenseIndicators = ['5000', '5100', '5200', '5210', '5300', '5310', '5400', '5500', '5600', '5700', '6000', '6100'];
    return expenseIndicators.includes(account) ||
           description.toLowerCase().includes('expense') ||
           description.toLowerCase().includes('cost') ||
           description.toLowerCase().includes('payroll') ||
           description.toLowerCase().includes('maintenance');
  }

  private isAssetAccount(account: string): boolean {
    return account.startsWith('1');
  }

  private isLiabilityAccount(account: string): boolean {
    return account.startsWith('2');
  }

  private isEquityAccount(account: string): boolean {
    return account.startsWith('3');
  }

  private isOperatingCashFlowAccount(account: string, description: string): boolean {
    return description.toLowerCase().includes('operating') ||
           description.toLowerCase().includes('net income');
  }

  private isCapitalExpenditureAccount(account: string, description: string): boolean {
    return description.toLowerCase().includes('capital') ||
           description.toLowerCase().includes('capex') ||
           account === '5200';
  }

  // Summary generation methods
  private generateIncomeStatementSummary(metrics: FinancialMetrics, accountCount: number): string {
    return `Income Statement Analysis: ${accountCount} accounts processed. Total Revenue: $${metrics.totalRevenue.toLocaleString()}, Total Expenses: $${metrics.totalExpenses.toLocaleString()}, Net Income: $${metrics.netIncome.toLocaleString()}, Profit Margin: ${metrics.profitMargin.toFixed(1)}%`;
  }

  private generateBalanceSheetSummary(metrics: FinancialMetrics, accountCount: number): string {
    return `Balance Sheet Analysis: ${accountCount} accounts processed. Total Assets: $${metrics.totalAssets.toLocaleString()}, Total Liabilities: $${metrics.totalLiabilities.toLocaleString()}, Total Equity: $${metrics.totalEquity.toLocaleString()}, Debt-to-Equity Ratio: ${metrics.debtToEquityRatio.toFixed(2)}`;
  }

  private generateCashFlowSummary(metrics: FinancialMetrics, accountCount: number): string {
    return `Cash Flow Analysis: ${accountCount} line items processed. Free Cash Flow: $${metrics.freeCashFlow.toLocaleString()}`;
  }
}

export const financialProcessor = new FinancialProcessor();
