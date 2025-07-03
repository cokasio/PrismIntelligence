/**
 * Speech Processor Service
 * Handles speech-to-text and text-to-speech processing
 */

import { Readable } from 'stream';
import speech from '@google-cloud/speech';
import textToSpeech from '@google-cloud/text-to-speech';
import { logger } from '../../utils/logger';
import { ApiError } from '../../utils/api-error';

// Initialize clients
const speechClient = new speech.SpeechClient({
  keyFilename: process.env.GOOGLE_CLOUD_KEYFILE
});

const ttsClient = new textToSpeech.TextToSpeechClient({
  keyFilename: process.env.GOOGLE_CLOUD_KEYFILE
});

export interface SpeechToTextOptions {
  languageCode?: string;
  model?: 'default' | 'command_and_search' | 'phone_call' | 'video' | 'medical_dictation' | 'medical_conversation';
  useEnhanced?: boolean;
  enableAutomaticPunctuation?: boolean;
  enableWordTimeOffsets?: boolean;
  enableSpeakerDiarization?: boolean;
  diarizationSpeakerCount?: number;
  profanityFilter?: boolean;
  speechContexts?: Array<{
    phrases: string[];
    boost?: number;
  }>;
}

export interface TextToSpeechOptions {
  languageCode?: string;
  voiceName?: string;
  ssmlGender?: 'MALE' | 'FEMALE' | 'NEUTRAL';
  audioEncoding?: 'MP3' | 'OGG_OPUS' | 'LINEAR16';
  speakingRate?: number;
  pitch?: number;
  volumeGainDb?: number;
  effectsProfileId?: string[];
}

export interface TranscriptionResult {
  transcript: string;
  confidence: number;
  words?: Array<{
    word: string;
    startTime: number;
    endTime: number;
    confidence: number;
  }>;
  alternatives?: Array<{
    transcript: string;
    confidence: number;
  }>;
  isFinal: boolean;
}

export class SpeechProcessorService {
  /**
   * Convert speech audio to text
   */
  static async speechToText(
    audioBuffer: Buffer,
    options: SpeechToTextOptions = {}
  ): Promise<TranscriptionResult[]> {
    try {
      const {
        languageCode = 'en-US',
        model = 'command_and_search',
        useEnhanced = true,
        enableAutomaticPunctuation = true,
        enableWordTimeOffsets = false,
        enableSpeakerDiarization = false,
        diarizationSpeakerCount = 2,
        profanityFilter = false,
        speechContexts = []
      } = options;

      // Add property management context phrases
      const propertyContexts = [
        {
          phrases: [
            'tenant', 'lease', 'rent', 'maintenance', 'property',
            'apartment', 'unit', 'building', 'payment', 'inspection',
            'compliance', 'violation', 'repair', 'HVAC', 'plumbing',
            'electrical', 'covenant', 'NOI', 'DSCR', 'occupancy'
          ],
          boost: 20
        },
        ...speechContexts
      ];

      const request = {
        audio: {
          content: audioBuffer.toString('base64')
        },
        config: {
          encoding: 'WEBM_OPUS' as any,
          sampleRateHertz: 48000,
          languageCode,
          model,
          useEnhanced,
          enableAutomaticPunctuation,
          enableWordTimeOffsets,
          enableSpeakerDiarization,
          diarizationSpeakerCount,
          profanityFilter,
          speechContexts: propertyContexts,
          metadata: {
            interactionType: 'VOICE_COMMAND' as any,
            industryNaicsCodeOfAudio: 531110, // Property management
            microphoneDistance: 'NEARFIELD' as any
          }
        }
      };

      const [response] = await speechClient.recognize(request);
      
      if (!response.results) {
        throw new Error('No transcription results');
      }

      return response.results.map(result => {
        const alternative = result.alternatives?.[0];
        
        if (!alternative) {
          return {
            transcript: '',
            confidence: 0,
            isFinal: true
          };
        }

        const words = alternative.words?.map(word => ({
          word: word.word || '',
          startTime: Number(word.startTime?.seconds || 0) + 
                     Number(word.startTime?.nanos || 0) / 1e9,
          endTime: Number(word.endTime?.seconds || 0) + 
                   Number(word.endTime?.nanos || 0) / 1e9,
          confidence: word.confidence || 0
        }));

        return {
          transcript: alternative.transcript || '',
          confidence: alternative.confidence || 0,
          words: enableWordTimeOffsets ? words : undefined,
          alternatives: result.alternatives?.slice(1).map(alt => ({
            transcript: alt.transcript || '',
            confidence: alt.confidence || 0
          })),
          isFinal: true
        };
      });
    } catch (error) {
      logger.error('Speech to text failed', error);
      throw new ApiError(
        'Failed to transcribe audio',
        500,
        'SPEECH_TO_TEXT_ERROR',
        { originalError: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  /**
   * Stream speech to text for real-time transcription
   */
  static createStreamingRecognition(
    options: SpeechToTextOptions = {}
  ): NodeJS.ReadWriteStream {
    const {
      languageCode = 'en-US',
      model = 'command_and_search',
      useEnhanced = true,
      enableAutomaticPunctuation = true,
      profanityFilter = false
    } = options;

    const request = {
      config: {
        encoding: 'WEBM_OPUS' as any,
        sampleRateHertz: 48000,
        languageCode,
        model,
        useEnhanced,
        enableAutomaticPunctuation,
        profanityFilter,
        singleUtterance: false,
        interimResults: true
      }
    };

    return speechClient.streamingRecognize(request);
  }

  /**
   * Convert text to speech
   */
  static async textToSpeech(
    text: string,
    options: TextToSpeechOptions = {}
  ): Promise<Buffer> {
    try {
      const {
        languageCode = 'en-US',
        voiceName = 'en-US-Neural2-F', // Female neural voice
        ssmlGender = 'FEMALE',
        audioEncoding = 'MP3',
        speakingRate = 1.0,
        pitch = 0,
        volumeGainDb = 0,
        effectsProfileId = ['headphone-class-device']
      } = options;

      // Check if text is SSML or plain text
      const input = text.includes('<speak>') 
        ? { ssml: text }
        : { text };

      const request = {
        input,
        voice: {
          languageCode,
          name: voiceName,
          ssmlGender
        },
        audioConfig: {
          audioEncoding,
          speakingRate,
          pitch,
          volumeGainDb,
          effectsProfileId
        }
      };

      const [response] = await ttsClient.synthesizeSpeech(request);
      
      if (!response.audioContent) {
        throw new Error('No audio content generated');
      }

      return Buffer.from(response.audioContent as Uint8Array);
    } catch (error) {
      logger.error('Text to speech failed', error);
      throw new ApiError(
        'Failed to synthesize speech',
        500,
        'TEXT_TO_SPEECH_ERROR',
        { originalError: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  /**
   * Generate SSML for more natural speech
   */
  static generateSSML(
    text: string,
    options: {
      emphasis?: Array<{ text: string; level: 'strong' | 'moderate' | 'reduced' }>;
      breaks?: Array<{ position: number; time: string }>;
      prosody?: {
        rate?: string;
        pitch?: string;
        volume?: string;
      };
      sayAs?: Array<{
        text: string;
        interpretAs: 'cardinal' | 'ordinal' | 'characters' | 'fraction' | 'unit' | 'date' | 'time' | 'telephone' | 'address' | 'spell-out';
        format?: string;
      }>;
    } = {}
  ): string {
    let ssml = text;

    // Apply say-as tags
    if (options.sayAs) {
      options.sayAs.forEach(({ text: sayText, interpretAs, format }) => {
        const formatAttr = format ? ` format="${format}"` : '';
        ssml = ssml.replace(
          sayText,
          `<say-as interpret-as="${interpretAs}"${formatAttr}>${sayText}</say-as>`
        );
      });
    }

    // Apply emphasis
    if (options.emphasis) {
      options.emphasis.forEach(({ text: emphText, level }) => {
        ssml = ssml.replace(
          emphText,
          `<emphasis level="${level}">${emphText}</emphasis>`
        );
      });
    }

    // Apply breaks
    if (options.breaks) {
      options.breaks
        .sort((a, b) => b.position - a.position) // Sort in reverse to maintain positions
        .forEach(({ position, time }) => {
          ssml = ssml.slice(0, position) + `<break time="${time}"/>` + ssml.slice(position);
        });
    }

    // Apply prosody
    if (options.prosody) {
      const attrs = Object.entries(options.prosody)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');
      ssml = `<prosody ${attrs}>${ssml}</prosody>`;
    }

    return `<speak>${ssml}</speak>`;
  }

  /**
   * Get available voices
   */
  static async getAvailableVoices(languageCode: string = 'en-US'): Promise<any[]> {
    try {
      const [response] = await ttsClient.listVoices({ languageCode });
      return response.voices || [];
    } catch (error) {
      logger.error('Failed to list voices', error);
      return [];
    }
  }

  /**
   * Validate audio format
   */
  static validateAudioFormat(buffer: Buffer): {
    valid: boolean;
    format?: string;
    error?: string;
  } {
    // Check for common audio format signatures
    const signatures = {
      wav: [0x52, 0x49, 0x46, 0x46], // RIFF
      mp3: [0xFF, 0xFB],
      ogg: [0x4F, 0x67, 0x67, 0x53], // OggS
      webm: [0x1A, 0x45, 0xDF, 0xA3],
      m4a: [0x66, 0x74, 0x79, 0x70]
    };

    for (const [format, signature] of Object.entries(signatures)) {
      let match = true;
      for (let i = 0; i < signature.length; i++) {
        if (buffer[i] !== signature[i]) {
          match = false;
          break;
        }
      }
      if (match) {
        return { valid: true, format };
      }
    }

    return {
      valid: false,
      error: 'Unsupported audio format'
    };
  }

  /**
   * Estimate speech duration
   */
  static estimateSpeechDuration(text: string, wordsPerMinute: number = 150): number {
    const wordCount = text.split(/\s+/).length;
    return (wordCount / wordsPerMinute) * 60; // Duration in seconds
  }

  /**
   * Clean transcript for processing
   */
  static cleanTranscript(transcript: string): string {
    return transcript
      .toLowerCase()
      .replace(/[.,!?;:]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
}