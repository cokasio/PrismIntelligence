/**
 * Report Generator Utility
 * This module creates beautiful, professional HTML reports from AI analysis
 * Think of it as a skilled designer who transforms data into compelling visual stories
 */

import { AIAnalysisResult } from '../services/ai';
import { createLogger } from './logger';

const logger = createLogger('report-generator');

/**
 * Generate a complete HTML analysis report
 * This is what property managers receive in their inbox
 */
export async function createAnalysisReport(analysisData: AIAnalysisResult): Promise<string> {
  logger.debug('Generating analysis report', {
    reportId: analysisData.reportId,
    insightCount: analysisData.pass3_insights.data.length,
    actionCount: analysisData.pass4_actions.data.length,
  });

  try {
    // Extract key data for the report
    const propertyInfo = analysisData.pass1_extraction.data.propertyInfo || {};
    const period = analysisData.pass1_extraction.data.reportPeriod || {};
    const insights = analysisData.pass3_insights.data || [];
    const actions = analysisData.pass4_actions.data || [];
    
    // Count actions by priority
    const urgentActions = actions.filter(a => a.priority === 'urgent');
    const highActions = actions.filter(a => a.priority === 'high');
    const mediumActions = actions.filter(a => a.priority === 'medium');
    const lowActions = actions.filter(a => a.priority === 'low');

    // Generate the HTML report
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Property Analysis Report - ${propertyInfo.name || 'Property Report'}</title>
    <style>
        /* Reset and base styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        /* Header styles */
        .header {
            background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .header .subtitle {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .header .date {
            font-size: 14px;
            opacity: 0.8;
            margin-top: 10px;
        }
        
        /* Content sections */
        .content {
            padding: 30px;
        }
        
        .section {
            margin-bottom: 40px;
        }
        
        .section h2 {
            font-size: 22px;
            color: #2c3e50;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e0e0e0;
        }
        
        /* Executive summary */
        .executive-summary {
            background-color: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid #4A90E2;
        }
        
        .executive-summary h3 {
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 15px;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 6px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .summary-card .number {
            font-size: 36px;
            font-weight: bold;
            color: #4A90E2;
        }
        
        .summary-card .label {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
        }
        
        /* Key metrics */
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .metric-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            border-left: 3px solid #4A90E2;
        }
        
        .metric-card h4 {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        
        .metric-value {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
        }
        
        /* Insights */
        .insight-card {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            padding: 20px;
            margin-bottom: 15px;
            transition: box-shadow 0.3s ease;
        }
        
        .insight-card:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .insight-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .insight-category {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .category-revenue { background: #e3f2fd; color: #1976d2; }
        .category-expense { background: #fce4ec; color: #c2185b; }
        .category-occupancy { background: #e8f5e9; color: #388e3c; }
        .category-maintenance { background: #fff3e0; color: #f57c00; }
        .category-risk { background: #ffebee; color: #d32f2f; }
        .category-opportunity { background: #f3e5f5; color: #7b1fa2; }
        
        .insight-priority {
            display: flex;
            gap: 2px;
        }
        
        .priority-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #ddd;
        }
        
        .priority-dot.active { background: #f57c00; }
        
        .insight-text {
            font-size: 16px;
            color: #444;
            line-height: 1.5;
        }
        
        /* Actions */
        .action-card {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            padding: 20px;
            margin-bottom: 15px;
            border-left: 4px solid #4A90E2;
        }
        
        .action-card.urgent {
            border-left-color: #d32f2f;
            background: #ffebee;
        }
        
        .action-card.high {
            border-left-color: #f57c00;
            background: #fff3e0;
        }
        
        .action-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
        }
        
        .action-priority {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .priority-urgent { background: #d32f2f; color: white; }
        .priority-high { background: #f57c00; color: white; }
        .priority-medium { background: #fbc02d; color: #333; }
        .priority-low { background: #689f38; color: white; }
        
        .action-text {
            font-size: 16px;
            color: #333;
            margin-bottom: 10px;
        }
        
        .action-details {
            display: flex;
            gap: 20px;
            font-size: 14px;
            color: #666;
        }
        
        .action-detail {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        /* Footer */
        .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        
        .footer .logo {
            font-weight: bold;
            color: #4A90E2;
            margin-bottom: 10px;
        }
        
        /* Responsive */
        @media (max-width: 600px) {
            .header {
                padding: 30px 20px;
            }
            
            .content {
                padding: 20px;
            }
            
            .summary-grid {
                grid-template-columns: 1fr;
            }
            
            .action-details {
                flex-direction: column;
                gap: 5px;
            }
        }
        
        /* Print styles */
        @media print {
            body {
                background: white;
            }
            
            .container {
                box-shadow: none;
                max-width: 100%;
            }
            
            .insight-card,
            .action-card {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>Property Intelligence Report</h1>
            <div class="subtitle">${propertyInfo.name || 'Property Analysis'}</div>
            <div class="date">
                ${period.startDate && period.endDate ? 
                  `Period: ${formatDate(period.startDate)} - ${formatDate(period.endDate)}` :
                  `Generated on ${new Date().toLocaleDateString()}`
                }
            </div>
        </div>
        
        <!-- Content -->
        <div class="content">
            <!-- Executive Summary -->
            <div class="executive-summary">
                <h3>Executive Summary</h3>
                <p>
                    Our AI analysis has identified <strong>${insights.length} key insights</strong> and 
                    recommends <strong>${actions.length} specific actions</strong> to optimize your property performance.
                    ${urgentActions.length > 0 ? 
                      `<strong style="color: #d32f2f;">${urgentActions.length} urgent actions require immediate attention.</strong>` : 
                      ''
                    }
                </p>
                
                <div class="summary-grid">
                    <div class="summary-card">
                        <div class="number">${insights.length}</div>
                        <div class="label">Key Insights</div>
                    </div>
                    <div class="summary-card">
                        <div class="number">${actions.length}</div>
                        <div class="label">Recommended Actions</div>
                    </div>
                    <div class="summary-card">
                        <div class="number">${urgentActions.length + highActions.length}</div>
                        <div class="label">High Priority Items</div>
                    </div>
                </div>
            </div>
            
            <!-- Key Metrics -->
            ${generateMetricsSection(analysisData.pass1_extraction.data)}
            
            <!-- Insights Section -->
            <div class="section">
                <h2>Key Insights</h2>
                ${insights.map(insight => generateInsightCard(insight)).join('')}
            </div>
            
            <!-- Actions Section -->
            <div class="section">
                <h2>Recommended Actions</h2>
                
                ${urgentActions.length > 0 ? `
                    <h3 style="color: #d32f2f; margin-bottom: 15px;">🚨 Urgent Actions</h3>
                    ${urgentActions.map(action => generateActionCard(action)).join('')}
                ` : ''}
                
                ${highActions.length > 0 ? `
                    <h3 style="color: #f57c00; margin: 20px 0 15px;">⚡ High Priority</h3>
                    ${highActions.map(action => generateActionCard(action)).join('')}
                ` : ''}
                
                ${mediumActions.length > 0 ? `
                    <h3 style="color: #fbc02d; margin: 20px 0 15px;">📋 Medium Priority</h3>
                    ${mediumActions.map(action => generateActionCard(action)).join('')}
                ` : ''}
                
                ${lowActions.length > 0 ? `
                    <h3 style="color: #689f38; margin: 20px 0 15px;">💡 Low Priority</h3>
                    ${lowActions.map(action => generateActionCard(action)).join('')}
                ` : ''}
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="logo">Prism Intelligence</div>
            <p>Transforming Property Data into Actionable Insights</p>
            <p style="margin-top: 10px; font-size: 12px;">
                This report was generated automatically using advanced AI analysis. 
                For questions or support, reply to this email.
            </p>
        </div>
    </div>
</body>
</html>`;

    logger.debug('Report generation completed', {
      reportId: analysisData.reportId,
      htmlLength: html.length,
    });

    return html;

  } catch (error) {
    logger.error('Failed to generate report', { error });
    throw error;
  }
}

/**
 * Generate the metrics section of the report
 */
function generateMetricsSection(extractedData: any): string {
  const financialMetrics = extractedData.financialMetrics || {};
  const operationalMetrics = extractedData.operationalMetrics || {};
  
  // Only show metrics that have values
  const metricsToShow = [];
  
  if (financialMetrics.totalRevenue) {
    metricsToShow.push({
      label: 'Total Revenue',
      value: formatCurrency(financialMetrics.totalRevenue),
    });
  }
  
  if (financialMetrics.totalExpenses) {
    metricsToShow.push({
      label: 'Total Expenses',
      value: formatCurrency(financialMetrics.totalExpenses),
    });
  }
  
  if (financialMetrics.netOperatingIncome) {
    metricsToShow.push({
      label: 'Net Operating Income',
      value: formatCurrency(financialMetrics.netOperatingIncome),
    });
  }
  
  if (financialMetrics.occupancyRate) {
    metricsToShow.push({
      label: 'Occupancy Rate',
      value: `${financialMetrics.occupancyRate}%`,
    });
  }
  
  // Add operational metrics
  Object.entries(operationalMetrics).forEach(([key, value]) => {
    if (value) {
      metricsToShow.push({
        label: formatMetricLabel(key),
        value: formatMetricValue(key, value),
      });
    }
  });
  
  if (metricsToShow.length === 0) {
    return '';
  }
  
  return `
    <div class="section">
        <h2>Key Metrics</h2>
        <div class="metrics-grid">
            ${metricsToShow.map(metric => `
                <div class="metric-card">
                    <h4>${metric.label}</h4>
                    <div class="metric-value">${metric.value}</div>
                </div>
            `).join('')}
        </div>
    </div>
  `;
}

/**
 * Generate an insight card HTML
 */
function generateInsightCard(insight: any): string {
  const priorityDots = Array(5).fill(0).map((_, i) => 
    `<div class="priority-dot ${i < insight.priority ? 'active' : ''}"></div>`
  ).join('');
  
  return `
    <div class="insight-card">
        <div class="insight-header">
            <span class="insight-category category-${insight.category}">${insight.category}</span>
            <div class="insight-priority">${priorityDots}</div>
        </div>
        <div class="insight-text">${escapeHtml(insight.insight)}</div>
    </div>
  `;
}

/**
 * Generate an action card HTML
 */
function generateActionCard(action: any): string {
  return `
    <div class="action-card ${action.priority}">
        <div class="action-header">
            <span class="action-priority priority-${action.priority}">${action.priority}</span>
        </div>
        <div class="action-text">${escapeHtml(action.action)}</div>
        <div class="action-details">
            <div class="action-detail">
                <span>👤</span>
                <span>${action.assignTo}</span>
            </div>
            <div class="action-detail">
                <span>📅</span>
                <span>${action.dueDate}</span>
            </div>
            ${action.estimatedValue ? `
                <div class="action-detail">
                    <span>💰</span>
                    <span>${formatCurrency(action.estimatedValue)} impact</span>
                </div>
            ` : ''}
        </div>
        ${action.expectedImpact ? `
            <div style="margin-top: 10px; font-size: 14px; color: #666;">
                <strong>Expected Impact:</strong> ${escapeHtml(action.expectedImpact)}
            </div>
        ` : ''}
    </div>
  `;
}

/**
 * Format a date string for display
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Format currency values
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format metric labels (convert camelCase to Title Case)
 */
function formatMetricLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Format metric values based on the key
 */
function formatMetricValue(key: string, value: any): string {
  if (typeof value === 'number') {
    if (key.toLowerCase().includes('rate') || key.toLowerCase().includes('percent')) {
      return `${value}%`;
    }
    if (key.toLowerCase().includes('days')) {
      return `${value} days`;
    }
    if (key.toLowerCase().includes('count') || key.toLowerCase().includes('number')) {
      return value.toString();
    }
    // Assume currency for other numbers
    return formatCurrency(value);
  }
  return String(value);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  
  return text.replace(/[&<>"']/g, char => map[char]);
}

/**
 * Generate a simple text version of the report
 * Useful for email clients that don't support HTML
 */
export function createTextReport(analysisData: AIAnalysisResult): string {
  const insights = analysisData.pass3_insights.data || [];
  const actions = analysisData.pass4_actions.data || [];
  
  let text = `PROPERTY INTELLIGENCE REPORT\n`;
  text += `${'='.repeat(50)}\n\n`;
  
  text += `EXECUTIVE SUMMARY\n`;
  text += `${'-'.repeat(30)}\n`;
  text += `Total Insights: ${insights.length}\n`;
  text += `Total Actions: ${actions.length}\n`;
  text += `Urgent Actions: ${actions.filter(a => a.priority === 'urgent').length}\n\n`;
  
  text += `KEY INSIGHTS\n`;
  text += `${'-'.repeat(30)}\n`;
  insights.forEach((insight, i) => {
    text += `\n${i + 1}. [${insight.category.toUpperCase()}] ${insight.insight}\n`;
    text += `   Priority: ${'★'.repeat(insight.priority)}${'☆'.repeat(5 - insight.priority)}\n`;
  });
  
  text += `\n\nRECOMMENDED ACTIONS\n`;
  text += `${'-'.repeat(30)}\n`;
  actions.forEach((action, i) => {
    text += `\n${i + 1}. [${action.priority.toUpperCase()}] ${action.action}\n`;
    text += `   Assign to: ${action.assignTo}\n`;
    text += `   Due: ${action.dueDate}\n`;
    if (action.expectedImpact) {
      text += `   Impact: ${action.expectedImpact}\n`;
    }
  });
  
  text += `\n\n${'-'.repeat(50)}\n`;
  text += `Powered by Prism Intelligence\n`;
  text += `Transforming Property Data into Actionable Insights\n`;
  
  return text;
}

/**
 * Generate a PDF version of the report
 * This would use a library like Puppeteer or jsPDF
 */
export async function createPDFReport(analysisData: AIAnalysisResult): Promise<Buffer> {
  // For MVP, we'll just note this is a future feature
  logger.warn('PDF generation not implemented yet');
  throw new Error('PDF generation coming soon');
}

/**
 * Example usage:
 * 
 * import { createAnalysisReport } from './utils/reportGenerator';
 * 
 * const htmlReport = await createAnalysisReport(analysisResult);
 * // Send htmlReport via email
 * 
 * const textReport = createTextReport(analysisResult);
 * // Use as fallback for text-only email clients
 */