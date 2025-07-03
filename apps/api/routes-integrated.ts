/**
 * Enhanced API Routes with Integration
 * Connects HTTP endpoints to the Integration Orchestrator
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { integrationOrchestrator } from './services/integration-orchestrator';
import { enhancedReinforcementLearning } from '../reinforcement-learning/enhanced-rl-engine';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// WebSocket connections map
const activeConnections = new Map<string, any>();

/**
 * Document Upload Endpoint
 * Triggers the complete AI processing pipeline
 */
router.post('/api/upload', upload.single('document'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate task ID
    const taskId = uuidv4();
    const userId = req.headers['user-id'] as string || 'anonymous';

    // Start processing in background
    integrationOrchestrator.processDocument({
      taskId,
      file: file.buffer,
      filename: file.originalname,
      userId,
      documentType: req.body.documentType
    }).catch(error => {
      console.error('Document processing error:', error);
    });

    // Send immediate response with task ID
    res.json({
      success: true,
      taskId,
      message: 'Document queued for processing',
      websocketUrl: `/ws/insights/${taskId}`
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process upload' });
  }
});

/**
 * Get Insights for a Task
 */
router.get('/api/insights/:taskId', async (req: Request, res: Response) => {
  const { taskId } = req.params;
  
  // TODO: Retrieve from database
  // For now, return mock data
  res.json({
    taskId,
    status: 'processing',
    insights: [],
    agentActivity: [
      { agent: 'FinanceBot', status: 'analyzing', timestamp: new Date() },
      { agent: 'RiskFlaggerAgent', status: 'waiting', timestamp: new Date() }
    ]
  });
});

/**
 * Submit Feedback for Reinforcement Learning
 */
router.post('/api/feedback', async (req: Request, res: Response) => {
  try {
    const { insightId, feedbackType, userId, editedContent } = req.body;

    // Record feedback for learning
    await enhancedReinforcementLearning.recordEnhancedFeedback({
      id: uuidv4(),
      agentId: req.body.agentId,
      insightId,
      feedbackType,
      timestamp: new Date(),
      userId,
      taskType: req.body.taskType || 'general',
      editedContent
    });

    res.json({ success: true, message: 'Feedback recorded' });

  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ error: 'Failed to record feedback' });
  }
});

/**
 * Get Agent Debate Log
 */
router.get('/api/debate/:taskId', async (req: Request, res: Response) => {
  const { taskId } = req.params;
  
  // TODO: Retrieve actual debate log
  res.json({
    taskId,
    debateEntries: [
      {
        timestamp: new Date(),
        phase: 'proposal',
        agentId: 'FinanceBot',
        action: 'initial_proposal',
        content: 'Revenue increased 15% YoY'
      },
      {
        timestamp: new Date(),
        phase: 'challenge',
        agentId: 'RiskFlaggerAgent',
        action: 'challenge',
        content: 'But expense ratio is concerning'
      }
    ]
  });
});

/**
 * WebSocket Setup for Real-time Updates
 */
export function setupWebSocket(io: any) {
  io.on('connection', (socket: any) => {
    console.log('Client connected:', socket.id);

    socket.on('subscribe', ({ taskId, userId }: any) => {
      socket.join(`task-${taskId}`);
      activeConnections.set(socket.id, { taskId, userId });

      // Subscribe to orchestrator events
      const handlers = {
        'processing-started': (data: any) => {
          if (data.taskId === taskId) {
            socket.emit('status', { status: 'processing', message: 'Analysis started' });
          }
        },
        'agent-proposals': (data: any) => {
          if (data.taskId === taskId) {
            socket.emit('agent-activity', data.proposals);
          }
        },
        'consensus-reached': (data: any) => {
          if (data.taskId === taskId) {
            socket.emit('debate-update', data.consensus);
          }
        },
        'processing-complete': (data: any) => {
          if (data.taskId === taskId) {
            socket.emit('insights-ready', data.insights);
          }
        }
      };

      // Register event handlers
      Object.entries(handlers).forEach(([event, handler]) => {
        integrationOrchestrator.on(event, handler);
      });

      // Clean up on disconnect
      socket.on('disconnect', () => {
        Object.entries(handlers).forEach(([event, handler]) => {
          integrationOrchestrator.off(event, handler);
        });
        activeConnections.delete(socket.id);
      });
    });
  });
}

export default router;
