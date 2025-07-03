/**
 * Mistral AI Service - MaintenanceBot Implementation
 * Specialized for maintenance scheduling and resource optimization
 */

import axios from 'axios';

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

export interface MistralAnalysisRequest {
  documentContent: string;
  documentType: 'work_order' | 'inspection_report' | 'vendor_quote' | 'maintenance_schedule' | 'equipment_manual' | 'other';
  analysisType: 'scheduling' | 'cost_analysis' | 'priority_assessment' | 'resource_allocation' | 'preventive_planning';
  context?: {
    propertyInfo?: any;
    existingSchedule?: any[];
    availableResources?: any[];
    budget?: number;
    companyId: string;
  };
}

export interface MistralAnalysisResponse {
  agentId: 'mistral-maintenance';
  agentName: 'MaintenanceBot (Mistral)';
  analysis: string;
  maintenanceTasks: MaintenanceTask[];
  recommendations: string[];
  confidence: number;
  evidence: Evidence[];
  reasoning: string[];
  schedule?: MaintenanceSchedule;
  costEstimate?: CostEstimate;
}

export interface MaintenanceTask {
  id: string;
  type: 'preventive' | 'corrective' | 'emergency' | 'improvement';
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedDuration: number; // in hours
  requiredSkills: string[];
  materials?: Material[];
  estimatedCost?: number;
  dueDate?: Date;
}

export interface Material {
  name: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
}

export interface MaintenanceSchedule {
  optimizedSequence: string[]; // Task IDs in optimal order
  resourceAllocation: ResourceAllocation[];
  timeline: Timeline[];
  efficiency: number; // 0-100
}

export interface ResourceAllocation {
  taskId: string;
  resourceType: 'technician' | 'contractor' | 'equipment';
  resourceId: string;
  startTime: Date;
  endTime: Date;
}

export interface Timeline {
  date: Date;
  tasks: string[];
  totalHours: number;
  resourceUtilization: number;
}

export interface CostEstimate {
  labor: number;
  materials: number;
  contractor: number;
  total: number;
  savingsOpportunities?: string[];
}

export interface Evidence {
  fact: string;
  source: string;
  confidence: number;
  calculation?: string;
}

/**
 * Mistral Maintenance Service Class
 */
export class MistralMaintenanceService {
  
  /**
   * Analyze maintenance document using Mistral
   */
  static async analyzeDocument(request: MistralAnalysisRequest): Promise<MistralAnalysisResponse> {
    try {
      const prompt = this.buildMaintenancePrompt(request);
      
      const response = await axios.post(
        MISTRAL_API_URL,
        {
          model: 'mistral-large-latest',
          messages: [
            {
              role: 'system',
              content: 'You are MaintenanceBot, an expert in property maintenance optimization and scheduling.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2, // Lower temperature for more consistent scheduling
          max_tokens: 4000
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      return this.parseMistralResponse(content, request);

    } catch (error) {
      console.error('Mistral Maintenance Service error:', error);
      throw new Error(`Mistral analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build specialized prompt for maintenance analysis
   */
  private static buildMaintenancePrompt(request: MistralAnalysisRequest): string {
    const { documentContent, documentType, analysisType, context } = request;

    const basePrompt = `You are MaintenanceBot, specialized in property maintenance optimization. Your expertise includes:
- Preventive maintenance scheduling
- Work order prioritization
- Resource allocation and scheduling
- Cost estimation and budgeting
- Vendor management
- Equipment lifecycle management
- Emergency response planning
- Maintenance efficiency optimization

DOCUMENT TYPE: ${documentType}
ANALYSIS TYPE: ${analysisType}
${context?.budget ? `BUDGET: $${context.budget}` : ''}

DOCUMENT CONTENT:
${documentContent}

${context?.existingSchedule ? `EXISTING SCHEDULE: ${JSON.stringify(context.existingSchedule, null, 2)}` : ''}
${context?.availableResources ? `AVAILABLE RESOURCES: ${JSON.stringify(context.availableResources, null, 2)}` : ''}

Please provide a comprehensive maintenance analysis in the following JSON format:

{
  "analysis": "Detailed maintenance analysis summary",
  "maintenanceTasks": [
    {
      "id": "unique_id",
      "type": "preventive|corrective|emergency|improvement",
      "title": "Task title",
      "description": "Detailed description",
      "priority": "critical|high|medium|low",
      "estimatedDuration": 2.5,
      "requiredSkills": ["plumbing", "electrical"],
      "materials": [
        {
          "name": "Material name",
          "quantity": 5,
          "unit": "units",
          "estimatedCost": 50
        }
      ],
      "estimatedCost": 500,
      "dueDate": "ISO date"
    }
  ],
  "recommendations": ["Specific actionable recommendations"],
  "confidence": 85,
  "evidence": [
    {
      "fact": "Specific finding",
      "source": "Document reference",
      "confidence": 90,
      "calculation": "Cost or time calculation"
    }
  ],
  "reasoning": ["Step-by-step maintenance logic"],
  "schedule": {
    "optimizedSequence": ["task_id_1", "task_id_2"],
    "resourceAllocation": [
      {
        "taskId": "task_id",
        "resourceType": "technician",
        "resourceId": "tech_1",
        "startTime": "ISO datetime",
        "endTime": "ISO datetime"
      }
    ],
    "timeline": [
      {
        "date": "ISO date",
        "tasks": ["task_id_1"],
        "totalHours": 8,
        "resourceUtilization": 0.85
      }
    ],
    "efficiency": 85
  },
  "costEstimate": {
    "labor": 1000,
    "materials": 500,
    "contractor": 0,
    "total": 1500,
    "savingsOpportunities": ["Bulk material purchase", "Preventive vs reactive"]
  }
}

CRITICAL REQUIREMENTS:
1. Prioritize tasks based on safety and operational impact
2. Optimize scheduling to minimize downtime
3. Consider resource availability and skills matching
4. Provide accurate cost estimates with breakdown
5. Identify preventive maintenance opportunities
6. Flag any safety or compliance concerns
7. Optimize for cost efficiency without compromising quality
8. Consider seasonal factors and weather impacts

Respond ONLY with valid JSON. Do not include any explanatory text outside the JSON.`;

    return basePrompt;
  }

  /**
   * Parse Mistral's JSON response
   */
  private static parseMistralResponse(responseText: string, request: MistralAnalysisRequest): MistralAnalysisResponse {
    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Mistral response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!parsed.analysis || !parsed.maintenanceTasks || !parsed.recommendations) {
        throw new Error('Missing required fields in Mistral response');
      }

      // Process maintenance tasks
      parsed.maintenanceTasks = parsed.maintenanceTasks.map((task: any, index: number) => ({
        id: task.id || `mistral-task-${Date.now()}-${index}`,
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined
      }));

      // Process schedule if present
      if (parsed.schedule) {
        if (parsed.schedule.resourceAllocation) {
          parsed.schedule.resourceAllocation = parsed.schedule.resourceAllocation.map((alloc: any) => ({
            ...alloc,
            startTime: new Date(alloc.startTime),
            endTime: new Date(alloc.endTime)
          }));
        }
        if (parsed.schedule.timeline) {
          parsed.schedule.timeline = parsed.schedule.timeline.map((t: any) => ({
            ...t,
            date: new Date(t.date)
          }));
        }
      }

      return {
        agentId: 'mistral-maintenance',
        agentName: 'MaintenanceBot (Mistral)',
        analysis: parsed.analysis,
        maintenanceTasks: parsed.maintenanceTasks,
        recommendations: parsed.recommendations,
        confidence: parsed.confidence || 75,
        evidence: parsed.evidence || [],
        reasoning: parsed.reasoning || [],
        schedule: parsed.schedule,
        costEstimate: parsed.costEstimate
      };

    } catch (error) {
      console.error('Error parsing Mistral response:', error);
      
      // Fallback response
      return {
        agentId: 'mistral-maintenance',
        agentName: 'MaintenanceBot (Mistral)',
        analysis: 'Maintenance analysis completed with parsing issues. Manual review recommended.',
        maintenanceTasks: [{
          id: `fallback-${Date.now()}`,
          type: 'corrective',
          title: 'Manual Review Required',
          description: 'AI analysis completed but response formatting needs adjustment.',
          priority: 'medium',
          estimatedDuration: 1,
          requiredSkills: ['general']
        }],
        recommendations: ['Review maintenance requirements manually'],
        confidence: 60,
        evidence: [],
        reasoning: ['Response parsing encountered formatting issues']
      };
    }
  }

  /**
   * Optimize maintenance schedule
   */
  static optimizeSchedule(
    tasks: MaintenanceTask[],
    resources: any[],
    constraints?: {
      maxDailyHours?: number;
      urgentDeadline?: Date;
      budgetLimit?: number;
    }
  ): MaintenanceSchedule {
    // Simple scheduling algorithm - in production, use more sophisticated optimization
    const sortedTasks = [...tasks].sort((a, b) => {
      // Priority weight
      const priorityWeight = {
        critical: 4,
        high: 3,
        medium: 2,
        low: 1
      };
      
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    });

    const optimizedSequence = sortedTasks.map(t => t.id);
    
    // Simple resource allocation
    const resourceAllocation: ResourceAllocation[] = [];
    let currentTime = new Date();
    
    sortedTasks.forEach(task => {
      const allocation: ResourceAllocation = {
        taskId: task.id,
        resourceType: 'technician',
        resourceId: 'tech_1', // Simplified - would match skills in production
        startTime: new Date(currentTime),
        endTime: new Date(currentTime.getTime() + task.estimatedDuration * 60 * 60 * 1000)
      };
      
      resourceAllocation.push(allocation);
      currentTime = allocation.endTime;
    });

    return {
      optimizedSequence,
      resourceAllocation,
      timeline: [], // Would calculate daily timeline in production
      efficiency: 85 // Simplified metric
    };
  }

  /**
   * Calculate maintenance cost estimate
   */
  static calculateCostEstimate(tasks: MaintenanceTask[]): CostEstimate {
    let labor = 0;
    let materials = 0;
    let contractor = 0;

    tasks.forEach(task => {
      // Labor cost (assuming $75/hour average)
      labor += task.estimatedDuration * 75;
      
      // Materials cost
      if (task.materials) {
        task.materials.forEach(material => {
          materials += material.estimatedCost;
        });
      }
      
      // Add estimated cost if provided
      if (task.estimatedCost) {
        const taskLabor = task.estimatedDuration * 75;
        const taskMaterials = task.estimatedCost - taskLabor;
        if (taskMaterials > materials) {
          materials = taskMaterials;
        }
      }
    });

    const total = labor + materials + contractor;

    const savingsOpportunities = [];
    if (materials > 1000) {
      savingsOpportunities.push('Consider bulk material purchasing for 10-15% savings');
    }
    if (tasks.filter(t => t.type === 'corrective').length > tasks.length * 0.5) {
      savingsOpportunities.push('Increase preventive maintenance to reduce corrective costs');
    }

    return {
      labor,
      materials,
      contractor,
      total,
      savingsOpportunities
    };
  }

  /**
   * Get token usage estimation
   */
  static estimateTokenUsage(request: MistralAnalysisRequest): { 
    inputTokens: number; 
    estimatedOutputTokens: number; 
    estimatedCost: number 
  } {
    const inputWords = request.documentContent.length / 4;
    const inputTokens = Math.ceil(inputWords / 0.75);
    
    const estimatedOutputTokens = 2000;
    
    // Mistral pricing estimate
    const inputCost = (inputTokens / 1000000) * 0.25;
    const outputCost = (estimatedOutputTokens / 1000000) * 0.25;
    const estimatedCost = inputCost + outputCost;

    return {
      inputTokens,
      estimatedOutputTokens,
      estimatedCost
    };
  }
}

export { MistralMaintenanceService as default };