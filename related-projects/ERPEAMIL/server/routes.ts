import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import { storage } from "./storage";
import { llmClients } from "./services/llm-clients";
import { financialProcessor } from "./services/financial-processor";
import { emailService } from "./services/email-service";
import { insertChatSessionSchema, insertChatMessageSchema, insertFinancialDocumentSchema, insertAgentActivitySchema, insertProjectSchema } from "@shared/schema";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExt = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    cb(null, allowedTypes.includes(fileExt));
  }
});

interface WebSocketMessage {
  type: string;
  sessionId?: number;
  data?: any;
}

interface ConnectedClient {
  ws: WebSocket;
  sessionId?: number;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server on distinct path to avoid conflicts with Vite HMR
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients: Map<string, ConnectedClient> = new Map();

  // WebSocket connection handling
  wss.on('connection', (ws: WebSocket, req) => {
    const clientId = Math.random().toString(36).substring(7);
    clients.set(clientId, { ws });
    
    console.log(`WebSocket client connected: ${clientId}`);

    ws.on('message', async (message: Buffer) => {
      try {
        const data: WebSocketMessage = JSON.parse(message.toString());
        const client = clients.get(clientId);
        
        if (data.type === 'join_session' && data.sessionId) {
          if (client) {
            client.sessionId = data.sessionId;
            clients.set(clientId, client);
          }
        }
        
        if (data.type === 'chat_message' && data.sessionId && data.data) {
          await handleChatMessage(data.sessionId, data.data, clientId);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      clients.delete(clientId);
      console.log(`WebSocket client disconnected: ${clientId}`);
    });
  });

  // Broadcast message to clients in a session
  function broadcastToSession(sessionId: number, message: any) {
    clients.forEach((client) => {
      if (client.sessionId === sessionId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    });
  }

  // Handle chat messages and trigger agent responses
  async function handleChatMessage(sessionId: number, messageData: any, clientId: string) {
    try {
      // Save user message
      const userMessage = await storage.createChatMessage({
        sessionId,
        sender: 'user',
        content: messageData.content,
        messageType: 'text',
        source: messageData.source || 'upload',
        metadata: {}
      });

      // Broadcast user message to session
      broadcastToSession(sessionId, {
        type: 'new_message',
        message: userMessage
      });

      // Update session as active
      await storage.updateChatSession(sessionId, { 
        status: 'processing',
        updatedAt: new Date()
      });

      // Trigger agent analysis if message contains analysis request
      if (messageData.content.toLowerCase().includes('analyze') || 
          messageData.content.toLowerCase().includes('financial')) {
        await triggerAgentAnalysis(sessionId);
      }

    } catch (error) {
      console.error('Error handling chat message:', error);
    }
  }

  // Trigger multi-agent analysis
  async function triggerAgentAnalysis(sessionId: number) {
    const agents = [
      { name: 'income_analyst', client: llmClients.openai, displayName: 'Income Analyst' },
      { name: 'balance_analyst', client: llmClients.anthropic, displayName: 'Balance Analyst' },
      { name: 'cashflow_analyst', client: llmClients.gemini, displayName: 'Cash Flow Analyst' },
      { name: 'strategic_advisor', client: llmClients.deepseek, displayName: 'Strategic Advisor' }
    ];

    // Get financial documents for this session
    const documents = await storage.getFinancialDocuments(sessionId);
    
    if (documents.length === 0) {
      const systemMessage = await storage.createChatMessage({
        sessionId,
        sender: 'system',
        content: 'Please upload financial documents before requesting analysis.',
        messageType: 'system',
        source: null,
        metadata: {}
      });

      broadcastToSession(sessionId, {
        type: 'new_message',
        message: systemMessage
      });
      return;
    }

    // Broadcast system message about starting analysis
    const startMessage = await storage.createChatMessage({
      sessionId,
      sender: 'system',
      content: `Starting comprehensive financial analysis with ${agents.length} specialized agents...`,
      messageType: 'system',
      source: null,
      metadata: { agentCount: agents.length }
    });

    broadcastToSession(sessionId, {
      type: 'new_message',
      message: startMessage
    });

    // Process each agent sequentially
    for (const agent of agents) {
      try {
        // Create agent activity
        const activity = await storage.createAgentActivity({
          sessionId,
          agentName: agent.name,
          activity: 'financial_analysis',
          status: 'processing',
          metadata: {}
        });

        // Broadcast agent status update
        broadcastToSession(sessionId, {
          type: 'agent_status_update',
          agent: agent.name,
          status: 'processing'
        });

        // Prepare analysis context
        const analysisContext = documents.map(doc => {
          const results = doc.analysisResults as any;
          return `Document: ${doc.filename}\nType: ${doc.fileType}\nSummary: ${results?.summary || 'Financial data processed'}`;
        }).join('\n\n');

        const prompt = `Analyze the following financial data and provide insights relevant to your specialization:\n\n${analysisContext}\n\nProvide a comprehensive analysis with specific metrics, trends, and recommendations.`;

        // Get agent response
        const response = await agent.client.analyze(prompt, `Session ${sessionId} analysis`);

        // Save agent message
        const agentMessage = await storage.createChatMessage({
          sessionId,
          sender: agent.name,
          content: response.content,
          messageType: 'analysis',
          source: null,
          metadata: {
            model: response.model,
            analysisTimestamp: response.timestamp,
            agentDisplayName: agent.displayName
          }
        });

        // Complete agent activity
        await storage.updateAgentActivity(activity.id, {
          status: 'completed',
          completedAt: new Date(),
          metadata: { responseLength: response.content.length }
        });

        // Broadcast agent response
        broadcastToSession(sessionId, {
          type: 'new_message',
          message: agentMessage
        });

        broadcastToSession(sessionId, {
          type: 'agent_status_update',
          agent: agent.name,
          status: 'completed'
        });

        // Small delay between agents for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Error with ${agent.name}:`, error);
        
        const errorMessage = await storage.createChatMessage({
          sessionId,
          sender: 'system',
          content: `Error occurred with ${agent.displayName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          messageType: 'system',
          source: null,
          metadata: { error: true, agent: agent.name }
        });

        broadcastToSession(sessionId, {
          type: 'new_message',
          message: errorMessage
        });
      }
    }

    // Update session as completed
    await storage.updateChatSession(sessionId, { 
      status: 'completed',
      updatedAt: new Date()
    });

    // Final summary message
    const summaryMessage = await storage.createChatMessage({
      sessionId,
      sender: 'system',
      content: 'Financial analysis completed by all agents. You can now ask specific questions about the results.',
      messageType: 'system',
      source: null,
      metadata: { analysisComplete: true }
    });

    broadcastToSession(sessionId, {
      type: 'new_message',
      message: summaryMessage
    });
  }

  // REST API Routes

  // Project Management Routes
  
  // Get all projects
  app.get('/api/projects', async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Create new project
  app.post('/api/projects', async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.json(project);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Update project
  app.put('/api/projects/:id', async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.updateProject(projectId, req.body);
      res.json(project);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Delete project
  app.delete('/api/projects/:id', async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      await storage.deleteProject(projectId);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get all chat sessions
  app.get('/api/sessions', async (req, res) => {
    try {
      const sessions = await storage.getChatSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Create new chat session
  app.post('/api/sessions', async (req, res) => {
    try {
      const validatedData = insertChatSessionSchema.parse(req.body);
      const session = await storage.createChatSession(validatedData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Update chat session
  app.put('/api/sessions/:id', async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await storage.updateChatSession(sessionId, req.body);
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Delete chat session
  app.delete('/api/sessions/:id', async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      await storage.deleteChatSession(sessionId);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get messages for a session
  app.get('/api/sessions/:id/messages', async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const messages = await storage.getChatMessages(sessionId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // File upload endpoint
  app.post('/api/sessions/:id/upload', upload.array('files'), async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const processedFiles = [];

      for (const file of files) {
        try {
          // Create document record
          const document = await storage.createFinancialDocument({
            sessionId,
            filename: file.originalname,
            fileType: file.mimetype,
            source: 'upload',
            status: 'processing',
            metadata: {
              size: file.size,
              uploadedAt: new Date()
            }
          });

          // Process the file
          const fileContent = file.buffer.toString('utf-8');
          const processedData = await financialProcessor.processCSVFile(fileContent, file.originalname);

          // Update document with results
          await storage.updateFinancialDocument(document.id, {
            status: 'completed',
            processedAt: new Date(),
            analysisResults: processedData
          });

          // Create a message about the file upload
          const fileMessage = await storage.createChatMessage({
            sessionId,
            sender: 'system',
            content: `File uploaded and processed: ${file.originalname}`,
            messageType: 'file',
            source: 'upload',
            metadata: {
              documentId: document.id,
              fileType: processedData.type,
              summary: processedData.summary
            }
          });

          processedFiles.push({
            document,
            processedData,
            message: fileMessage
          });

          // Broadcast file upload message
          broadcastToSession(sessionId, {
            type: 'new_message',
            message: fileMessage
          });

        } catch (fileError) {
          console.error(`Error processing file ${file.originalname}:`, fileError);
          
          const errorMessage = await storage.createChatMessage({
            sessionId,
            sender: 'system',
            content: `Error processing file ${file.originalname}: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`,
            messageType: 'system',
            source: 'upload',
            metadata: { error: true, filename: file.originalname }
          });

          broadcastToSession(sessionId, {
            type: 'new_message',
            message: errorMessage
          });
        }
      }

      res.json({ 
        message: 'Files processed successfully',
        files: processedFiles.length,
        results: processedFiles
      });

    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Email webhook endpoint (for receiving emails with attachments)
  app.post('/api/email/webhook', async (req, res) => {
    try {
      // This would be specific to your email service provider
      // For demo purposes, we'll create a mock implementation
      
      const emailData = req.body;
      
      // Create new session for email
      const session = await storage.createChatSession({
        title: `Email: ${emailData.subject || 'Financial Documents'}`,
        source: 'email',
        status: 'processing',
        metadata: {
          from: emailData.from,
          receivedAt: new Date()
        }
      });

      // Process email message
      const emailMessage = await storage.createChatMessage({
        sessionId: session.id,
        sender: 'system',
        content: `Received email from ${emailData.from} with subject: ${emailData.subject}`,
        messageType: 'file',
        source: 'email',
        metadata: {
          emailData: emailData
        }
      });

      // Broadcast new session and message to all clients
      // (In a real app, you'd target specific users)
      clients.forEach((client) => {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(JSON.stringify({
            type: 'new_session',
            session: session
          }));
          
          client.ws.send(JSON.stringify({
            type: 'new_message',
            message: emailMessage
          }));
        }
      });

      res.json({ message: 'Email processed successfully', sessionId: session.id });

    } catch (error) {
      console.error('Email webhook error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get agent activities for a session
  app.get('/api/sessions/:id/agents', async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const activities = await storage.getAgentActivities(sessionId);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get financial documents for a session
  app.get('/api/sessions/:id/documents', async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const documents = await storage.getFinancialDocuments(sessionId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  return httpServer;
}
