import { useCallback } from 'react'
import { toast } from 'sonner'

interface QueryIntent {
  action: string
  entities: Record<string, any>
  confidence: number
  parameters?: Record<string, any>
}

interface NLQueryResult {
  intent: QueryIntent
  sql?: string
  filters?: Record<string, any>
  visualization?: string
  temporalContext?: {
    timeframe: string
    startDate?: Date
    endDate?: Date
  }
}

export function useNaturalLanguageQueries() {
  
  const parseQuery = useCallback((query: string): NLQueryResult | null => {
    const lowerQuery = query.toLowerCase()
    
    // Complex tenant queries
    if (lowerQuery.includes('tenant') || lowerQuery.includes('resident')) {
      if (lowerQuery.includes('risk') || lowerQuery.includes('risky') || lowerQuery.includes('at-risk')) {
        return {
          intent: {
            action: 'analyze_tenant_risk',
            entities: {
              target: 'tenants',
              riskLevel: extractRiskLevel(lowerQuery)
            },
            confidence: 0.9
          },
          sql: `
            SELECT t.*, 
                   tr.risk_score,
                   tr.payment_history_score,
                   tr.complaint_count,
                   tr.late_payments_12m
            FROM tenants t
            JOIN tenant_risk_scores tr ON t.id = tr.tenant_id
            WHERE tr.risk_score > 70
            ORDER BY tr.risk_score DESC
          `,
          filters: {
            riskScore: { min: 70 },
            status: 'active'
          },
          visualization: 'risk_heatmap'
        }
      }
      
      if (lowerQuery.includes('happy') || lowerQuery.includes('satisfied')) {
        return {
          intent: {
            action: 'analyze_tenant_satisfaction',
            entities: { target: 'tenants', sentiment: 'positive' },
            confidence: 0.85
          },
          filters: {
            satisfactionScore: { min: 80 },
            complaintCount: { max: 1 }
          }
        }
      }
      
      if (lowerQuery.includes('complain') || lowerQuery.includes('complaint')) {
        const timeframe = extractTimeframe(lowerQuery)
        return {
          intent: {
            action: 'list_tenant_complaints',
            entities: { target: 'complaints' },
            confidence: 0.9
          },
          temporalContext: timeframe,
          sql: `
            SELECT c.*, t.name as tenant_name, u.unit_number
            FROM complaints c
            JOIN tenants t ON c.tenant_id = t.id
            JOIN units u ON t.unit_id = u.id
            WHERE c.created_at >= ?
            ORDER BY c.priority DESC, c.created_at DESC
          `
        }
      }
    }

    // Financial queries
    if (lowerQuery.includes('revenue') || lowerQuery.includes('income') || lowerQuery.includes('noi')) {
      const timeframe = extractTimeframe(lowerQuery)
      
      if (lowerQuery.includes('trend') || lowerQuery.includes('over time')) {
        return {
          intent: {
            action: 'analyze_revenue_trend',
            entities: { target: 'revenue', analysis: 'trend' },
            confidence: 0.9
          },
          temporalContext: timeframe,
          visualization: 'line_chart',
          sql: `
            SELECT 
              DATE_TRUNC('month', date) as month,
              SUM(rental_income) as rental_income,
              SUM(other_income) as other_income,
              SUM(total_income) as total_income
            FROM financial_reports
            WHERE date >= ?
            GROUP BY month
            ORDER BY month
          `
        }
      }
      
      if (lowerQuery.includes('by property') || lowerQuery.includes('per property')) {
        return {
          intent: {
            action: 'compare_property_revenue',
            entities: { target: 'revenue', groupBy: 'property' },
            confidence: 0.85
          },
          visualization: 'bar_chart',
          sql: `
            SELECT p.name, p.address, 
                   SUM(f.total_income) as total_revenue,
                   AVG(f.occupancy_rate) as avg_occupancy
            FROM properties p
            JOIN financial_reports f ON p.id = f.property_id
            WHERE f.date >= DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH)
            GROUP BY p.id
            ORDER BY total_revenue DESC
          `
        }
      }
    }

    // Maintenance queries
    if (lowerQuery.includes('maintenance') || lowerQuery.includes('repair')) {
      if (lowerQuery.includes('overdue') || lowerQuery.includes('late') || lowerQuery.includes('delayed')) {
        return {
          intent: {
            action: 'list_overdue_maintenance',
            entities: { target: 'maintenance', status: 'overdue' },
            confidence: 0.9
          },
          filters: {
            status: ['pending', 'in_progress'],
            dueDate: { before: new Date() }
          },
          visualization: 'timeline'
        }
      }
      
      if (lowerQuery.includes('cost') || lowerQuery.includes('expense')) {
        const timeframe = extractTimeframe(lowerQuery)
        return {
          intent: {
            action: 'analyze_maintenance_costs',
            entities: { target: 'maintenance_costs' },
            confidence: 0.85
          },
          temporalContext: timeframe,
          visualization: 'stacked_bar',
          sql: `
            SELECT 
              category,
              SUM(cost) as total_cost,
              COUNT(*) as job_count,
              AVG(cost) as avg_cost
            FROM maintenance_jobs
            WHERE completed_date >= ?
            GROUP BY category
            ORDER BY total_cost DESC
          `
        }
      }
    }

    // Occupancy queries
    if (lowerQuery.includes('vacan') || lowerQuery.includes('occupancy')) {
      if (lowerQuery.includes('trend')) {
        return {
          intent: {
            action: 'analyze_occupancy_trend',
            entities: { target: 'occupancy', analysis: 'trend' },
            confidence: 0.9
          },
          visualization: 'area_chart',
          temporalContext: extractTimeframe(lowerQuery)
        }
      }
      
      if (lowerQuery.includes('upcoming') || lowerQuery.includes('expiring')) {
        return {
          intent: {
            action: 'forecast_vacancy',
            entities: { target: 'leases', status: 'expiring' },
            confidence: 0.85
          },
          filters: {
            leaseEndDate: { 
              after: new Date(),
              before: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
            }
          }
        }
      }
    }

    // Complex analytical queries
    if (lowerQuery.includes('correlation') || lowerQuery.includes('relationship')) {
      const entities = extractEntities(lowerQuery)
      if (entities.length >= 2) {
        return {
          intent: {
            action: 'analyze_correlation',
            entities: { 
              variable1: entities[0],
              variable2: entities[1]
            },
            confidence: 0.8
          },
          visualization: 'scatter_plot'
        }
      }
    }

    // Predictive queries
    if (lowerQuery.includes('predict') || lowerQuery.includes('forecast') || lowerQuery.includes('will')) {
      if (lowerQuery.includes('rent') || lowerQuery.includes('revenue')) {
        return {
          intent: {
            action: 'predict_revenue',
            entities: { target: 'revenue', type: 'forecast' },
            confidence: 0.85
          },
          visualization: 'forecast_chart',
          parameters: {
            months: extractNumber(lowerQuery) || 6
          }
        }
      }
    }

    // Comparison queries
    if (lowerQuery.includes('compare') || lowerQuery.includes('versus') || lowerQuery.includes('vs')) {
      const entities = extractEntities(lowerQuery)
      const timeframe = extractTimeframe(lowerQuery)
      
      return {
        intent: {
          action: 'compare_entities',
          entities: { 
            targets: entities,
            metric: extractMetric(lowerQuery)
          },
          confidence: 0.8
        },
        temporalContext: timeframe,
        visualization: 'comparison_chart'
      }
    }

    // Default to general search if no specific pattern matches
    return {
      intent: {
        action: 'general_search',
        entities: { query: query },
        confidence: 0.5
      }
    }
  }, [])

  // Execute the parsed query
  const executeQuery = useCallback(async (result: NLQueryResult) => {
    toast.info(`Executing: ${result.intent.action}`, {
      description: `Confidence: ${(result.intent.confidence * 100).toFixed(0)}%`
    })

    // In a real implementation, this would:
    // 1. Execute the SQL query if present
    // 2. Apply filters to the data
    // 3. Generate the specified visualization
    // 4. Return the results

    return {
      success: true,
      data: [], // Would contain actual query results
      visualization: result.visualization,
      message: `Found results for: ${result.intent.action}`
    }
  }, [])

  return {
    parseQuery,
    executeQuery,
    examples: [
      "Show me risky tenants with payment issues",
      "What's the revenue trend for the last 6 months?",
      "Compare maintenance costs across all properties",
      "Which units will be vacant in the next 30 days?",
      "Predict next quarter's rental income",
      "Show correlation between occupancy and revenue",
      "List all tenant complaints from this month",
      "What's the average time to fill vacant units?",
      "Show me properties with declining NOI",
      "Which maintenance tasks are overdue?"
    ]
  }
}

// Helper functions
function extractTimeframe(query: string): NLQueryResult['temporalContext'] {
  const lowerQuery = query.toLowerCase()
  
  if (lowerQuery.includes('today')) {
    return {
      timeframe: 'today',
      startDate: new Date(),
      endDate: new Date()
    }
  }
  
  if (lowerQuery.includes('this week')) {
    const start = new Date()
    start.setDate(start.getDate() - start.getDay())
    return {
      timeframe: 'week',
      startDate: start,
      endDate: new Date()
    }
  }
  
  if (lowerQuery.includes('this month')) {
    const start = new Date()
    start.setDate(1)
    return {
      timeframe: 'month',
      startDate: start,
      endDate: new Date()
    }
  }
  
  if (lowerQuery.includes('last') || lowerQuery.includes('past')) {
    const match = lowerQuery.match(/(\d+)\s*(day|week|month|year)/)
    if (match) {
      const [, num, unit] = match
      const start = new Date()
      const multiplier = unit === 'day' ? 1 : unit === 'week' ? 7 : unit === 'month' ? 30 : 365
      start.setDate(start.getDate() - (parseInt(num) * multiplier))
      return {
        timeframe: `last_${num}_${unit}s`,
        startDate: start,
        endDate: new Date()
      }
    }
  }
  
  // Default to last 30 days
  const start = new Date()
  start.setDate(start.getDate() - 30)
  return {
    timeframe: 'last_30_days',
    startDate: start,
    endDate: new Date()
  }
}

function extractRiskLevel(query: string): string {
  if (query.includes('high') || query.includes('severe')) return 'high'
  if (query.includes('medium') || query.includes('moderate')) return 'medium'
  if (query.includes('low') || query.includes('minimal')) return 'low'
  return 'any'
}

function extractEntities(query: string): string[] {
  const entities: string[] = []
  const keywords = ['tenant', 'property', 'unit', 'revenue', 'maintenance', 'occupancy', 'expense']
  
  keywords.forEach(keyword => {
    if (query.toLowerCase().includes(keyword)) {
      entities.push(keyword)
    }
  })
  
  return entities
}

function extractMetric(query: string): string {
  const metrics = ['revenue', 'cost', 'occupancy', 'satisfaction', 'performance']
  for (const metric of metrics) {
    if (query.toLowerCase().includes(metric)) return metric
  }
  return 'general'
}

function extractNumber(query: string): number | null {
  const match = query.match(/\d+/)
  return match ? parseInt(match[0]) : null
}