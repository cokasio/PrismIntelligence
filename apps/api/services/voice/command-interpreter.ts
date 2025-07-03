/**
 * Voice Command Interpreter Service
 * Natural language understanding for property management commands
 */

import { logger } from '../../utils/logger';
import { ApiError } from '../../utils/api-error';
import natural from 'natural';

// Initialize NLP components
const tokenizer = new natural.WordTokenizer();
const classifier = new natural.BayesClassifier();

export interface CommandIntent {
  action: string;
  confidence: number;
  entities: Record<string, any>;
  parameters?: Record<string, any>;
  rawText: string;
  normalizedText: string;
}

export interface CommandContext {
  previousCommands?: CommandIntent[];
  currentProperty?: string;
  currentTenant?: string;
  userRole?: string;
  activeFilters?: Record<string, any>;
}

// Command patterns for property management
const COMMAND_PATTERNS = {
  // Document analysis
  analyzeDocument: [
    /analyze (?:this |the )?(?<type>financial|lease|maintenance|compliance)?\s*(?:document|file|report)?/i,
    /what does (?:this |the )?(?<type>\w+)?\s*(?:document|file|report)? (?:say|mean|show)/i,
    /review (?:this |the )?(?<type>\w+)?\s*(?:document|file|report)?/i
  ],
  
  // Tenant queries
  showTenants: [
    /show (?:me )?(?:all )?(?<filter>risky|at-risk|delinquent|happy|satisfied)?\s*tenants?/i,
    /list (?:all )?(?<filter>problem|good|late)?\s*tenants?/i,
    /who (?:is|are) (?<filter>behind|late|at risk)/i
  ],
  
  // Financial queries
  financialReport: [
    /show (?:me )?(?<period>monthly|quarterly|yearly|annual)?\s*(?<type>revenue|expenses|noi|cash flow)/i,
    /what(?:'s| is) (?:the |our )?(?<type>revenue|income|noi|occupancy)/i,
    /financial (?<type>summary|report|performance)/i
  ],
  
  // Maintenance
  maintenanceStatus: [
    /(?:show |list )?(?<filter>overdue|pending|completed|emergency)?\s*maintenance/i,
    /what maintenance is (?<filter>needed|overdue|scheduled)/i,
    /maintenance (?<type>queue|status|report)/i
  ],
  
  // Property queries
  propertyInfo: [
    /show (?:me )?(?:property |building )?(?<property>.+)/i,
    /information (?:about|on) (?<property>.+)/i,
    /(?:how is |what's the status of )?(?<property>.+)/i
  ],
  
  // Actions
  createTask: [
    /create (?:a )?(?<type>maintenance|inspection|follow-up)?\s*task/i,
    /schedule (?:a |an )?(?<type>inspection|maintenance|repair)/i,
    /add (?:a )?(?:new )?task/i
  ],
  
  // Navigation
  navigate: [
    /(?:go to|open|show) (?<destination>inbox|dashboard|reports|settings|tenants|properties)/i,
    /take me to (?<destination>\w+)/i
  ],
  
  // Help
  help: [
    /(?:what can you do|help|commands|how do i)/i,
    /show (?:me )?(?:available )?commands/i
  ]
};

// Entity extraction patterns
const ENTITY_PATTERNS = {
  date: {
    relative: /(?<relative>today|tomorrow|yesterday|this week|last week|this month|last month)/i,
    absolute: /(?<date>\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2})/i,
    range: /(?:from |between )?(?<start>.+) (?:to |and )(?<end>.+)/i
  },
  
  amount: {
    currency: /\$?(?<amount>\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    percentage: /(?<percent>\d+(?:\.\d+)?)\s*%/i
  },
  
  property: {
    building: /(?:building |property )?(?<code>[A-Z]\d+|[A-Z]{2,})/i,
    unit: /(?:unit |apartment |suite )?(?<unit>\d+[A-Z]?)/i,
    address: /(?<address>\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln))/i
  },
  
  tenant: {
    name: /(?:tenant |resident )?(?<name>[A-Z][a-z]+ [A-Z][a-z]+)/,
    email: /(?<email>[\w.-]+@[\w.-]+\.\w+)/i,
    phone: /(?<phone>\d{3}[-.]?\d{3}[-.]?\d{4})/
  },
  
  priority: /(?<priority>urgent|high|medium|low|emergency)/i,
  
  timeframe: /(?:within |in )?(?<timeframe>\d+)\s*(?<unit>hours?|days?|weeks?|months?)/i
};

export class CommandInterpreterService {
  private static classifier: natural.BayesClassifier;
  private static initialized = false;

  /**
   * Initialize the classifier with training data
   */
  static async initialize() {
    if (this.initialized) return;

    // Train classifier for intent recognition
    this.classifier = new natural.BayesClassifier();

    // Training data for intents
    const trainingData = [
      // Analyze document
      { text: 'analyze this document', intent: 'analyzeDocument' },
      { text: 'what does this report say', intent: 'analyzeDocument' },
      { text: 'review the financial statement', intent: 'analyzeDocument' },
      
      // Show tenants
      { text: 'show me risky tenants', intent: 'showTenants' },
      { text: 'list all delinquent tenants', intent: 'showTenants' },
      { text: 'who is behind on rent', intent: 'showTenants' },
      
      // Financial
      { text: 'show monthly revenue', intent: 'financialReport' },
      { text: 'what is our NOI', intent: 'financialReport' },
      { text: 'financial performance report', intent: 'financialReport' },
      
      // Maintenance
      { text: 'show overdue maintenance', intent: 'maintenanceStatus' },
      { text: 'maintenance queue', intent: 'maintenanceStatus' },
      { text: 'what repairs are needed', intent: 'maintenanceStatus' },
      
      // Create task
      { text: 'create a maintenance task', intent: 'createTask' },
      { text: 'schedule an inspection', intent: 'createTask' },
      { text: 'add new task', intent: 'createTask' },
      
      // Navigation
      { text: 'go to dashboard', intent: 'navigate' },
      { text: 'open reports', intent: 'navigate' },
      { text: 'show inbox', intent: 'navigate' },
      
      // Help
      { text: 'help', intent: 'help' },
      { text: 'what can you do', intent: 'help' },
      { text: 'show commands', intent: 'help' }
    ];

    trainingData.forEach(({ text, intent }) => {
      this.classifier.addDocument(text, intent);
    });

    this.classifier.train();
    this.initialized = true;
  }

  /**
   * Interpret voice command
   */
  static async interpretCommand(
    text: string,
    context?: CommandContext
  ): Promise<CommandIntent> {
    await this.initialize();

    const normalizedText = this.normalizeText(text);
    
    // Extract intent
    const intent = this.extractIntent(text, normalizedText);
    
    // Extract entities
    const entities = this.extractEntities(text);
    
    // Apply context
    const contextualizedIntent = this.applyContext(intent, entities, context);
    
    // Validate command
    this.validateCommand(contextualizedIntent);
    
    return contextualizedIntent;
  }

  /**
   * Normalize text for processing
   */
  private static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[.,!?;:]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extract intent from text
   */
  private static extractIntent(rawText: string, normalizedText: string): CommandIntent {
    // Try pattern matching first
    for (const [action, patterns] of Object.entries(COMMAND_PATTERNS)) {
      for (const pattern of patterns) {
        const match = rawText.match(pattern);
        if (match) {
          return {
            action,
            confidence: 0.9,
            entities: match.groups || {},
            rawText,
            normalizedText
          };
        }
      }
    }

    // Fall back to classifier
    const classifications = this.classifier.getClassifications(normalizedText);
    const topIntent = classifications[0];
    
    if (topIntent && topIntent.value > 0.7) {
      return {
        action: topIntent.label,
        confidence: topIntent.value,
        entities: {},
        rawText,
        normalizedText
      };
    }

    // Default to general query
    return {
      action: 'generalQuery',
      confidence: 0.5,
      entities: {},
      rawText,
      normalizedText
    };
  }

  /**
   * Extract entities from text
   */
  private static extractEntities(text: string): Record<string, any> {
    const entities: Record<string, any> = {};

    // Extract dates
    const dateMatch = text.match(ENTITY_PATTERNS.date.relative) || 
                     text.match(ENTITY_PATTERNS.date.absolute);
    if (dateMatch) {
      entities.date = this.parseDate(dateMatch[0]);
    }

    // Extract amounts
    const amountMatch = text.match(ENTITY_PATTERNS.amount.currency);
    if (amountMatch) {
      entities.amount = parseFloat(amountMatch.groups?.amount?.replace(/,/g, '') || '0');
    }

    // Extract percentages
    const percentMatch = text.match(ENTITY_PATTERNS.amount.percentage);
    if (percentMatch) {
      entities.percentage = parseFloat(percentMatch.groups?.percent || '0');
    }

    // Extract property references
    const propertyMatch = text.match(ENTITY_PATTERNS.property.building) ||
                         text.match(ENTITY_PATTERNS.property.unit);
    if (propertyMatch) {
      entities.property = propertyMatch.groups?.code || propertyMatch.groups?.unit;
    }

    // Extract priority
    const priorityMatch = text.match(ENTITY_PATTERNS.priority);
    if (priorityMatch) {
      entities.priority = priorityMatch.groups?.priority;
    }

    // Extract timeframe
    const timeframeMatch = text.match(ENTITY_PATTERNS.timeframe);
    if (timeframeMatch) {
      entities.timeframe = {
        value: parseInt(timeframeMatch.groups?.timeframe || '0'),
        unit: timeframeMatch.groups?.unit
      };
    }

    return entities;
  }

  /**
   * Apply context to intent
   */
  private static applyContext(
    intent: CommandIntent,
    entities: Record<string, any>,
    context?: CommandContext
  ): CommandIntent {
    if (!context) return { ...intent, entities };

    // Apply default property/tenant from context
    if (!entities.property && context.currentProperty) {
      entities.property = context.currentProperty;
    }
    
    if (!entities.tenant && context.currentTenant) {
      entities.tenant = context.currentTenant;
    }

    // Resolve pronouns based on context
    if (intent.normalizedText.includes('it') || intent.normalizedText.includes('that')) {
      const lastCommand = context.previousCommands?.[0];
      if (lastCommand?.entities.property) {
        entities.property = lastCommand.entities.property;
      }
      if (lastCommand?.entities.tenant) {
        entities.tenant = lastCommand.entities.tenant;
      }
    }

    // Apply active filters
    if (context.activeFilters) {
      entities.filters = { ...context.activeFilters, ...entities.filters };
    }

    return { ...intent, entities };
  }

  /**
   * Validate command
   */
  private static validateCommand(intent: CommandIntent): void {
    // Check required parameters for specific actions
    const requiredParams: Record<string, string[]> = {
      createTask: ['type'],
      navigate: ['destination'],
      propertyInfo: ['property']
    };

    const required = requiredParams[intent.action];
    if (required) {
      const missing = required.filter(param => !intent.entities[param]);
      if (missing.length > 0) {
        throw new ApiError(
          `Missing required information: ${missing.join(', ')}`,
          400,
          'MISSING_PARAMETERS',
          { missing }
        );
      }
    }
  }

  /**
   * Parse date from text
   */
  private static parseDate(dateText: string): Date {
    const today = new Date();
    const normalized = dateText.toLowerCase();

    // Handle relative dates
    const relativeMap: Record<string, () => Date> = {
      today: () => today,
      tomorrow: () => new Date(today.getTime() + 24 * 60 * 60 * 1000),
      yesterday: () => new Date(today.getTime() - 24 * 60 * 60 * 1000),
      'this week': () => {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return startOfWeek;
      },
      'last week': () => {
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7 - today.getDay());
        return lastWeek;
      },
      'this month': () => new Date(today.getFullYear(), today.getMonth(), 1),
      'last month': () => new Date(today.getFullYear(), today.getMonth() - 1, 1)
    };

    if (relativeMap[normalized]) {
      return relativeMap[normalized]();
    }

    // Try to parse absolute date
    const parsed = new Date(dateText);
    return isNaN(parsed.getTime()) ? today : parsed;
  }

  /**
   * Get command suggestions based on partial input
   */
  static getSuggestions(partialText: string, context?: CommandContext): string[] {
    const normalized = partialText.toLowerCase();
    const suggestions: string[] = [];

    // Common command starters
    const starters = [
      'show me',
      'list all',
      'analyze',
      'create',
      'schedule',
      'what is',
      'go to',
      'open'
    ];

    starters.forEach(starter => {
      if (starter.startsWith(normalized)) {
        suggestions.push(starter);
      }
    });

    // Context-aware suggestions
    if (context?.currentProperty) {
      suggestions.push(`show tenants in ${context.currentProperty}`);
      suggestions.push(`maintenance for ${context.currentProperty}`);
    }

    return suggestions.slice(0, 5);
  }

  /**
   * Get help text for available commands
   */
  static getHelpText(): string {
    return `
Available voice commands:

📊 Document Analysis:
- "Analyze this document"
- "What does this report say?"
- "Review the financial statement"

👥 Tenant Management:
- "Show me risky tenants"
- "List delinquent tenants"
- "Who is behind on rent?"

💰 Financial Queries:
- "Show monthly revenue"
- "What's our NOI?"
- "Financial performance report"

🔧 Maintenance:
- "Show overdue maintenance"
- "What repairs are needed?"
- "Maintenance queue"

📋 Task Management:
- "Create a maintenance task"
- "Schedule an inspection"

🧭 Navigation:
- "Go to dashboard"
- "Open reports"
- "Show inbox"

Try natural variations of these commands!
    `.trim();
  }
}