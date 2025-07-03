/**
 * Text-to-Speech Service
 * Generates natural speech responses for the AI agents
 */

import { SpeechProcessorService } from './speech-processor';
import { logger } from '../../utils/logger';
import { ApiError } from '../../utils/api-error';

export interface AgentVoiceProfile {
  agentId: string;
  agentName: string;
  voiceName: string;
  languageCode: string;
  ssmlGender: 'MALE' | 'FEMALE' | 'NEUTRAL';
  speakingRate: number;
  pitch: number;
  personality: {
    formality: 'casual' | 'professional' | 'friendly';
    enthusiasm: 'low' | 'medium' | 'high';
    pace: 'slow' | 'normal' | 'fast';
  };
}

// Voice profiles for each AI agent
const AGENT_VOICE_PROFILES: Record<string, AgentVoiceProfile> = {
  'claude-finance': {
    agentId: 'claude-finance',
    agentName: 'FinanceBot',
    voiceName: 'en-US-Neural2-D',
    languageCode: 'en-US',
    ssmlGender: 'MALE',
    speakingRate: 0.95,
    pitch: -2,
    personality: {
      formality: 'professional',
      enthusiasm: 'medium',
      pace: 'normal'
    }
  },
  
  'gemini-tenant': {
    agentId: 'gemini-tenant', 
    agentName: 'TenantBot',
    voiceName: 'en-US-Neural2-F',
    languageCode: 'en-US',
    ssmlGender: 'FEMALE',
    speakingRate: 1.0,
    pitch: 0,
    personality: {
      formality: 'friendly',
      enthusiasm: 'high',
      pace: 'normal'
    }
  },
  
  'openai-risk': {
    agentId: 'openai-risk',
    agentName: 'RiskBot',
    voiceName: 'en-US-Neural2-A',
    languageCode: 'en-US',
    ssmlGender: 'FEMALE',
    speakingRate: 0.9,
    pitch: -1,
    personality: {
      formality: 'professional',
      enthusiasm: 'low',
      pace: 'slow'
    }
  },
  
  'deepseek-compliance': {
    agentId: 'deepseek-compliance',
    agentName: 'ComplianceBot',
    voiceName: 'en-US-Neural2-J',
    languageCode: 'en-US',
    ssmlGender: 'MALE',
    speakingRate: 0.85,
    pitch: 0,
    personality: {
      formality: 'professional',
      enthusiasm: 'low',
      pace: 'slow'
    }
  },
  
  'mistral-maintenance': {
    agentId: 'mistral-maintenance',
    agentName: 'MaintenanceBot',
    voiceName: 'en-US-Neural2-G',
    languageCode: 'en-US',
    ssmlGender: 'FEMALE',
    speakingRate: 1.05,
    pitch: 1,
    personality: {
      formality: 'casual',
      enthusiasm: 'medium',
      pace: 'fast'
    }
  },
  
  'system': {
    agentId: 'system',
    agentName: 'Prism Assistant',
    voiceName: 'en-US-Neural2-C',
    languageCode: 'en-US',
    ssmlGender: 'FEMALE',
    speakingRate: 1.0,
    pitch: 0,
    personality: {
      formality: 'friendly',
      enthusiasm: 'medium',
      pace: 'normal'
    }
  }
};

export class TextToSpeechService {
  /**
   * Generate speech for agent response
   */
  static async generateAgentSpeech(
    text: string,
    agentId: string = 'system',
    options: {
      emotion?: 'neutral' | 'happy' | 'concerned' | 'urgent';
      audioFormat?: 'MP3' | 'OGG_OPUS';
      addPersonality?: boolean;
    } = {}
  ): Promise<Buffer> {
    try {
      const profile = AGENT_VOICE_PROFILES[agentId] || AGENT_VOICE_PROFILES.system;
      
      // Apply personality to text if requested
      const processedText = options.addPersonality 
        ? this.applyPersonality(text, profile.personality)
        : text;
      
      // Generate SSML with appropriate emotion and style
      const ssml = this.generateEmotionalSSML(processedText, {
        emotion: options.emotion || 'neutral',
        personality: profile.personality,
        agentName: profile.agentName
      });
      
      // Generate speech
      const audio = await SpeechProcessorService.textToSpeech(ssml, {
        languageCode: profile.languageCode,
        voiceName: profile.voiceName,
        ssmlGender: profile.ssmlGender,
        audioEncoding: options.audioFormat || 'MP3',
        speakingRate: profile.speakingRate,
        pitch: profile.pitch,
        effectsProfileId: ['headphone-class-device']
      });
      
      return audio;
    } catch (error) {
      logger.error('Failed to generate agent speech', { error, agentId, text });
      throw new ApiError(
        'Failed to generate speech',
        500,
        'TTS_GENERATION_ERROR'
      );
    }
  }

  /**
   * Apply personality traits to text
   */
  private static applyPersonality(
    text: string,
    personality: AgentVoiceProfile['personality']
  ): string {
    let processed = text;
    
    // Adjust formality
    if (personality.formality === 'casual') {
      processed = processed
        .replace(/\bI would like to\b/gi, "I'd like to")
        .replace(/\bIt is\b/gi, "It's")
        .replace(/\bThere is\b/gi, "There's");
    } else if (personality.formality === 'professional') {
      processed = processed
        .replace(/\bI'd\b/gi, "I would")
        .replace(/\bIt's\b/gi, "It is")
        .replace(/\bThere's\b/gi, "There is");
    }
    
    // Add enthusiasm markers
    if (personality.enthusiasm === 'high') {
      processed = processed
        .replace(/\b(great|excellent|wonderful|perfect)\b/gi, '<emphasis level="strong">$1</emphasis>')
        .replace(/\b(good|nice|helpful)\b/gi, '<emphasis level="moderate">$1</emphasis>');
    }
    
    return processed;
  }

  /**
   * Generate SSML with emotional expression
   */
  private static generateEmotionalSSML(
    text: string,
    options: {
      emotion: 'neutral' | 'happy' | 'concerned' | 'urgent';
      personality: AgentVoiceProfile['personality'];
      agentName: string;
    }
  ): string {
    const { emotion, personality, agentName } = options;
    
    let prosodySettings = {
      rate: '1.0',
      pitch: '+0Hz',
      volume: '+0dB'
    };
    
    // Adjust prosody based on emotion
    switch (emotion) {
      case 'happy':
        prosodySettings = {
          rate: '1.1',
          pitch: '+2st',
          volume: '+1dB'
        };
        break;
      case 'concerned':
        prosodySettings = {
          rate: '0.9',
          pitch: '-1st',
          volume: '-1dB'
        };
        break;
      case 'urgent':
        prosodySettings = {
          rate: '1.2',
          pitch: '+1st',
          volume: '+2dB'
        };
        break;
    }
    
    // Apply breaks for natural speech
    let processedText = text
      .replace(/\. /g, '.<break time="300ms"/> ')
      .replace(/\? /g, '?<break time="400ms"/> ')
      .replace(/! /g, '!<break time="400ms"/> ')
      .replace(/\, /g, ',<break time="200ms"/> ');
    
    // Wrap in SSML with prosody
    return SpeechProcessorService.generateSSML(processedText, {
      prosody: prosodySettings
    });
  }

  /**
   * Generate quick response speech
   */
  static async generateQuickResponse(
    message: string,
    agentId?: string
  ): Promise<Buffer> {
    const responses = {
      'analyzing': 'Let me analyze that for you.',
      'processing': 'Processing your request now.',
      'complete': 'Analysis complete. Here are the results.',
      'error': 'I encountered an issue. Let me try again.',
      'thinking': 'Let me think about that for a moment.',
      'searching': 'Searching through your documents now.'
    };
    
    const text = responses[message as keyof typeof responses] || message;
    
    return this.generateAgentSpeech(text, agentId, {
      emotion: 'neutral',
      addPersonality: false
    });
  }

  /**
   * Get voice profile for agent
   */
  static getVoiceProfile(agentId: string): AgentVoiceProfile | null {
    return AGENT_VOICE_PROFILES[agentId] || null;
  }

  /**
   * List all available agent voices
   */
  static listAgentVoices(): AgentVoiceProfile[] {
    return Object.values(AGENT_VOICE_PROFILES);
  }
}