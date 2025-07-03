/**
 * Voice API Routes
 * RESTful endpoints for voice interface functionality
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { SpeechProcessorService } from '../services/voice/speech-processor';
import { CommandInterpreterService } from '../services/voice/command-interpreter';
import { TextToSpeechService } from '../services/voice/tts-service';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/api-error';
import { asyncHandler } from '../middleware/error-handler';
import { validate } from '../middleware/validation';
import { body } from 'express-validator';

const router = Router();

// Configure multer for audio uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'audio/wav',
      'audio/mpeg',
      'audio/mp3',
      'audio/ogg',
      'audio/webm',
      'audio/m4a'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError('Invalid audio format', 400, 'INVALID_AUDIO_FORMAT'));
    }
  }
});

/**
 * POST /voice/speech-to-text
 * Convert audio to text
 */
router.post('/speech-to-text',
  upload.single('audio'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new ApiError('Audio file required', 400, 'AUDIO_FILE_REQUIRED');
    }

    const options = {
      languageCode: req.body.languageCode || 'en-US',
      model: req.body.model || 'command_and_search',
      useEnhanced: req.body.useEnhanced !== 'false',
      enableAutomaticPunctuation: req.body.enableAutomaticPunctuation !== 'false',
      enableWordTimeOffsets: req.body.enableWordTimeOffsets === 'true',
      profanityFilter: req.body.profanityFilter === 'true'
    };

    // Validate audio format
    const validation = SpeechProcessorService.validateAudioFormat(req.file.buffer);
    if (!validation.valid) {
      throw new ApiError(validation.error || 'Invalid audio format', 400, 'INVALID_AUDIO');
    }

    // Convert speech to text
    const results = await SpeechProcessorService.speechToText(req.file.buffer, options);

    logger.info('Speech to text completed', {
      duration: req.file.size,
      results: results.length,
      confidence: results[0]?.confidence
    });

    res.json({
      success: true,
      results,
      metadata: {
        audioFormat: validation.format,
        audioSize: req.file.size,
        processingTime: Date.now() - parseInt(req.headers['x-request-start'] as string || '0')
      }
    });
  })
);

/**
 * POST /voice/interpret-command
 * Interpret voice command and extract intent
 */
router.post('/interpret-command',
  validate([
    body('text').notEmpty().withMessage('Text is required'),
    body('context').optional().isObject()
  ]),
  asyncHandler(async (req: Request, res: Response) => {
    const { text, context } = req.body;

    // Interpret the command
    const intent = await CommandInterpreterService.interpretCommand(text, context);

    logger.info('Voice command interpreted', {
      text,
      action: intent.action,
      confidence: intent.confidence,
      entities: Object.keys(intent.entities)
    });

    res.json({
      success: true,
      intent,
      suggestions: CommandInterpreterService.getSuggestions(text, context)
    });
  })
);

/**
 * POST /voice/text-to-speech
 * Convert text to speech
 */
router.post('/text-to-speech',
  validate([
    body('text').notEmpty().withMessage('Text is required'),
    body('agentId').optional().isString(),
    body('emotion').optional().isIn(['neutral', 'happy', 'concerned', 'urgent']),
    body('audioFormat').optional().isIn(['MP3', 'OGG_OPUS'])
  ]),
  asyncHandler(async (req: Request, res: Response) => {
    const { text, agentId, emotion, audioFormat, addPersonality } = req.body;

    // Generate speech
    const audioBuffer = await TextToSpeechService.generateAgentSpeech(text, agentId, {
      emotion,
      audioFormat,
      addPersonality
    });

    // Set appropriate headers
    const mimeType = audioFormat === 'OGG_OPUS' ? 'audio/ogg' : 'audio/mpeg';
    const extension = audioFormat === 'OGG_OPUS' ? 'ogg' : 'mp3';

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename="speech.${extension}"`);
    res.setHeader('Content-Length', audioBuffer.length);

    logger.info('Text to speech generated', {
      textLength: text.length,
      agentId,
      audioSize: audioBuffer.length
    });

    res.send(audioBuffer);
  })
);

/**
 * POST /voice/quick-response
 * Generate quick response audio
 */
router.post('/quick-response',
  validate([
    body('message').notEmpty().withMessage('Message is required'),
    body('agentId').optional().isString()
  ]),
  asyncHandler(async (req: Request, res: Response) => {
    const { message, agentId } = req.body;

    const audioBuffer = await TextToSpeechService.generateQuickResponse(message, agentId);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'inline; filename="response.mp3"');
    res.setHeader('Content-Length', audioBuffer.length);

    res.send(audioBuffer);
  })
);

/**
 * GET /voice/commands/help
 * Get help text for voice commands
 */
router.get('/commands/help',
  asyncHandler(async (req: Request, res: Response) => {
    const helpText = CommandInterpreterService.getHelpText();

    res.json({
      success: true,
      helpText,
      commands: {
        documentAnalysis: [
          'analyze this document',
          'what does this report say',
          'review the financial statement'
        ],
        tenantManagement: [
          'show me risky tenants',
          'list delinquent tenants',
          'who is behind on rent'
        ],
        financial: [
          'show monthly revenue',
          'what is our NOI',
          'financial performance report'
        ],
        maintenance: [
          'show overdue maintenance',
          'what repairs are needed',
          'maintenance queue'
        ],
        navigation: [
          'go to dashboard',
          'open reports',
          'show inbox'
        ]
      }
    });
  })
);

/**
 * GET /voice/agents/voices
 * Get available agent voice profiles
 */
router.get('/agents/voices',
  asyncHandler(async (req: Request, res: Response) => {
    const voices = TextToSpeechService.listAgentVoices();

    res.json({
      success: true,
      voices
    });
  })
);

/**
 * GET /voice/suggestions
 * Get command suggestions based on partial input
 */
router.get('/suggestions',
  asyncHandler(async (req: Request, res: Response) => {
    const { partial, context } = req.query as { partial?: string; context?: string };

    if (!partial) {
      throw new ApiError('Partial text required', 400, 'PARTIAL_TEXT_REQUIRED');
    }

    const contextObj = context ? JSON.parse(context) : undefined;
    const suggestions = CommandInterpreterService.getSuggestions(partial, contextObj);

    res.json({
      success: true,
      suggestions
    });
  })
);

/**
 * WebSocket endpoint for streaming voice recognition
 */
export function setupVoiceWebSocket(io: any) {
  const voiceNamespace = io.of('/voice');

  voiceNamespace.on('connection', (socket: any) => {
    logger.info('Voice WebSocket connected', { socketId: socket.id });

    let recognitionStream: any = null;

    socket.on('start-recognition', (options: any) => {
      try {
        recognitionStream = SpeechProcessorService.createStreamingRecognition(options);

        recognitionStream.on('data', (data: any) => {
          if (data.results && data.results.length > 0) {
            const result = data.results[0];
            
            socket.emit('recognition-result', {
              transcript: result.alternatives[0].transcript,
              confidence: result.alternatives[0].confidence,
              isFinal: result.isFinal
            });

            // If final result, also send command interpretation
            if (result.isFinal) {
              CommandInterpreterService.interpretCommand(
                result.alternatives[0].transcript
              ).then(intent => {
                socket.emit('command-interpreted', intent);
              }).catch(error => {
                socket.emit('recognition-error', { error: error.message });
              });
            }
          }
        });

        recognitionStream.on('error', (error: any) => {
          socket.emit('recognition-error', { error: error.message });
        });

        socket.emit('recognition-started');
      } catch (error) {
        socket.emit('recognition-error', { error: (error as Error).message });
      }
    });

    socket.on('audio-data', (audioData: any) => {
      if (recognitionStream) {
        recognitionStream.write(audioData);
      }
    });

    socket.on('stop-recognition', () => {
      if (recognitionStream) {
        recognitionStream.end();
        recognitionStream = null;
        socket.emit('recognition-stopped');
      }
    });

    socket.on('disconnect', () => {
      if (recognitionStream) {
        recognitionStream.end();
      }
      logger.info('Voice WebSocket disconnected', { socketId: socket.id });
    });
  });
}

export default router;