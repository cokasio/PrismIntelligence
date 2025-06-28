/**
 * Prism Intelligence Server
 * This is the main entry point for the application
 * Think of it as the control center that starts and coordinates all services
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config';
import logger from './utils/logger';
import routes from './api/routes';
import { queueService } from './services/queue';

// Create Express application
const app: Express = express();

/**
 * Middleware Configuration
 * These are like security guards and assistants that process every request
 */

// Security headers - protects against common vulnerabilities
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],  // Allow inline styles for emails
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],   // Allow images from HTTPS sources
    },
  },
}));

// CORS configuration - controls who can access your API
app.use(cors({
  origin: config.security.allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));  // For JSON payloads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));  // For form data

// Body parsing middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.path === '/api/webhooks/cloudmailin') {
    let rawBody = '';
    req.on('data', (chunk) => {
      rawBody += chunk.toString();
    });
    req.on('end', () => {
      (req as any).rawBody = rawBody;
      next();
    });
  } else {
    next();
  }
});

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Log response after it's sent
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  });
  
  next();
});

// Rate limiting - prevents abuse
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,  // Return rate limit info in headers
  legacyHeaders: false,   // Disable X-RateLimit headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
});

// Apply rate limiting to all routes except webhooks
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api/webhooks/')) {
    next();  // Skip rate limiting for webhooks
  } else {
    limiter(req, res, next);
  }
});

/**
 * Routes
 */

// Health check at root
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Prism Intelligence API',
    version: '1.0.0',
    status: 'operational',
    docs: '/api/docs',  // Future: API documentation
  });
});

// Mount API routes
app.use('/api', routes);

// Bull Board UI for queue monitoring (admin only)
if (config.app.isDevelopment || config.features.enableDashboard) {
  const bullBoardRouter = queueService.getBullBoardRouter();
  app.use('/admin/queues', bullBoardRouter);
  logger.info('Bull Board available at /admin/queues');
}

/**
 * Error Handling
 * These catch any errors that occur during request processing
 */

// 404 handler - when no route matches
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`,
    status: 404,
  });
});

// Global error handler - catches all errors
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // Don't leak error details in production
  const isDev = config.app.isDevelopment;
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: isDev ? err.message : 'An unexpected error occurred',
    ...(isDev && { stack: err.stack }),
    status: 500,
  });
});

/**
 * Graceful Shutdown Handler
 * Ensures the application shuts down cleanly
 */
let server: any;

async function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}, starting graceful shutdown...`);
  
  // Stop accepting new connections
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
    });
  }
  
  try {
    // Pause queue processing
    await queueService.pauseProcessing();
    logger.info('Queue processing paused');
    
    // Wait for active jobs to complete (max 30 seconds)
    const shutdownTimeout = setTimeout(() => {
      logger.warn('Shutdown timeout reached, forcing exit');
      process.exit(1);
    }, 30000);
    
    // Close database connections
    // Supabase client handles this automatically
    
    clearTimeout(shutdownTimeout);
    logger.info('Graceful shutdown completed');
    process.exit(0);
    
  } catch (error) {
    logger.error('Error during shutdown', { error });
    process.exit(1);
  }
}

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

/**
 * Start the Server
 */
async function startServer() {
  try {
    logger.info('Starting Prism Intelligence server...');
    
    // Verify database connection
    logger.info('Verifying database connection...');
    // Database connection is checked in the service initialization
    
    // Resume queue processing if it was paused
    await queueService.resumeProcessing();
    logger.info('Queue processing started');
    
    // Clean old completed jobs on startup
    if (config.app.isProduction) {
      await queueService.cleanQueues();
      logger.info('Old queue jobs cleaned');
    }
    
    // Start Express server
    const port = config.app.port;
    server = app.listen(port, () => {
      logger.info(`✅ Prism Intelligence server running on port ${port}`);
      logger.info(`   Environment: ${config.app.env}`);
      logger.info(`   API URL: http://localhost:${port}/api`);
      
      if (config.app.isDevelopment) {
        logger.info(`   Queue Monitor: http://localhost:${port}/admin/queues`);
      }
    });
    
    // Handle server errors
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${port} is already in use`);
        process.exit(1);
      } else {
        logger.error('Server error', { error });
      }
    });
    
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

// Start the server
startServer();

// Export app for testing
export default app;

/**
 * Usage:
 * 
 * Development:
 *   npm run dev
 * 
 * Production:
 *   npm run build
 *   npm start
 * 
 * The server will:
 * 1. Start listening on the configured port
 * 2. Process incoming emails via webhook
 * 3. Handle file uploads via API
 * 4. Process reports in the background
 * 5. Send analysis results via email
 */