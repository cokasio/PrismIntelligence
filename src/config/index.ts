/**
 * Environment Configuration Loader
 * This module validates and provides typed access to all environment variables
 * Think of it as a security checkpoint that ensures all settings are present and valid
 */

import dotenv from 'dotenv';
import Joi from 'joi';

// Load environment variables from .env file
dotenv.config();

/**
 * Define the shape and validation rules for our configuration
 * Joi is like a strict teacher who checks that every value meets expectations
 */
const envSchema = Joi.object({
  // Application Settings
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  APP_NAME: Joi.string().default('Prism Intelligence'),
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),

  // Database Configuration
  SUPABASE_URL: Joi.string().uri().required()
    .description('Your Supabase project URL'),
  SUPABASE_ANON_KEY: Joi.string().required()
    .description('Supabase anonymous key for client access'),
  SUPABASE_SERVICE_KEY: Joi.string().required()
    .description('Supabase service key for admin operations'),

  // AI Configuration (continued on next chunk for better readability)
});  // AI Configuration
  ANTHROPIC_API_KEY: Joi.string().required()
    .description('Your Anthropic API key for Claude'),
  ANTHROPIC_MODEL: Joi.string()
    .default('claude-3-sonnet-20240229')
    .description('Which Claude model to use'),
  ANTHROPIC_MAX_TOKENS: Joi.number()
    .min(1000).max(100000)
    .default(4096)
    .description('Maximum tokens for AI responses'),

  // Email Configuration
  SENDGRID_API_KEY: Joi.string().required()
    .description('SendGrid API key for email services'),
  SENDGRID_FROM_EMAIL: Joi.string().email().required()
    .description('Email address to send from'),
  SENDGRID_FROM_NAME: Joi.string()
    .default('Prism Intelligence')
    .description('Name to show in email from field'),
  SENDGRID_WEBHOOK_SECRET: Joi.string()
    .description('Secret for verifying SendGrid webhooks'),

  // Redis Configuration (for job queues)
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().port().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').default(''),
  REDIS_DB: Joi.number().min(0).default(0),

  // Storage Configuration
  STORAGE_BUCKET_RAW: Joi.string().default('raw-reports'),
  STORAGE_BUCKET_PROCESSED: Joi.string().default('processed-reports'),
  MAX_FILE_SIZE_MB: Joi.number().min(1).max(100).default(50),  // Security Settings
  JWT_SECRET: Joi.string().min(32).required()
    .description('Secret key for JWT tokens - must be at least 32 characters'),
  ENCRYPTION_KEY: Joi.string().length(32).required()
    .description('Exactly 32 character key for encryption'),
  ALLOWED_ORIGINS: Joi.string()
    .default('http://localhost:3000')
    .description('Comma-separated list of allowed CORS origins'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Joi.number()
    .min(60000) // At least 1 minute
    .default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: Joi.number()
    .min(1)
    .default(100),

  // Processing Configuration
  MAX_PROCESSING_TIME_MS: Joi.number()
    .min(30000) // At least 30 seconds
    .default(300000), // 5 minutes
  RETRY_ATTEMPTS: Joi.number()
    .min(0).max(10)
    .default(3),
  RETRY_DELAY_MS: Joi.number()
    .min(1000)
    .default(5000),

  // Feature Flags
  ENABLE_OCR: Joi.boolean().default(false),
  ENABLE_DASHBOARD: Joi.boolean().default(false),
  ENABLE_API_ACCESS: Joi.boolean().default(false),  // Monitoring (Optional)
  SENTRY_DSN: Joi.string().uri().allow('').default(''),
  DATADOG_API_KEY: Joi.string().allow('').default(''),

  // Development Settings
  DEBUG_MODE: Joi.boolean().default(false),
  MOCK_AI_RESPONSES: Joi.boolean().default(false),
  SKIP_EMAIL_VERIFICATION: Joi.boolean().default(false),
}).unknown(); // Allow additional env vars that might be system-specific

/**
 * Validate the environment variables and extract the values
 * This happens at startup, so any missing required values will fail fast
 */
const { error, value: validatedEnv } = envSchema.validate(process.env, {
  abortEarly: false, // Show all validation errors at once
  stripUnknown: true, // Remove any unknown variables
});

if (error) {
  // If validation fails, provide a helpful error message
  console.error('❌ Environment validation failed:');
  error.details.forEach(detail => {
    console.error(`  - ${detail.message}`);
  });
  console.error('\n💡 Tip: Copy .env.example to .env and fill in your values');
  process.exit(1);
}
/**
 * Export a typed configuration object
 * This provides IntelliSense support and prevents typos when accessing config values
 */
export const config = {
  // Application
  app: {
    env: validatedEnv.NODE_ENV as 'development' | 'test' | 'production',
    port: validatedEnv.PORT as number,
    name: validatedEnv.APP_NAME as string,
    logLevel: validatedEnv.LOG_LEVEL as string,
    isDevelopment: validatedEnv.NODE_ENV === 'development',
    isProduction: validatedEnv.NODE_ENV === 'production',
  },

  // Database
  database: {
    supabaseUrl: validatedEnv.SUPABASE_URL as string,
    supabaseAnonKey: validatedEnv.SUPABASE_ANON_KEY as string,
    supabaseServiceKey: validatedEnv.SUPABASE_SERVICE_KEY as string,
  },

  // AI
  ai: {
    anthropicApiKey: validatedEnv.ANTHROPIC_API_KEY as string,
    model: validatedEnv.ANTHROPIC_MODEL as string,
    maxTokens: validatedEnv.ANTHROPIC_MAX_TOKENS as number,
  },

  // Email
  email: {
    sendgridApiKey: validatedEnv.SENDGRID_API_KEY as string,
    fromEmail: validatedEnv.SENDGRID_FROM_EMAIL as string,
    fromName: validatedEnv.SENDGRID_FROM_NAME as string,
    webhookSecret: validatedEnv.SENDGRID_WEBHOOK_SECRET as string,
  },  // Redis
  redis: {
    host: validatedEnv.REDIS_HOST as string,
    port: validatedEnv.REDIS_PORT as number,
    password: validatedEnv.REDIS_PASSWORD as string,
    db: validatedEnv.REDIS_DB as number,
  },

  // Storage
  storage: {
    bucketRaw: validatedEnv.STORAGE_BUCKET_RAW as string,
    bucketProcessed: validatedEnv.STORAGE_BUCKET_PROCESSED as string,
    maxFileSizeMB: validatedEnv.MAX_FILE_SIZE_MB as number,
    maxFileSizeBytes: (validatedEnv.MAX_FILE_SIZE_MB as number) * 1024 * 1024,
  },

  // Security
  security: {
    jwtSecret: validatedEnv.JWT_SECRET as string,
    encryptionKey: validatedEnv.ENCRYPTION_KEY as string,
    allowedOrigins: (validatedEnv.ALLOWED_ORIGINS as string).split(',').map(o => o.trim()),
  },

  // Rate Limiting
  rateLimit: {
    windowMs: validatedEnv.RATE_LIMIT_WINDOW_MS as number,
    maxRequests: validatedEnv.RATE_LIMIT_MAX_REQUESTS as number,
  },

  // Processing
  processing: {
    maxTimeMs: validatedEnv.MAX_PROCESSING_TIME_MS as number,
    retryAttempts: validatedEnv.RETRY_ATTEMPTS as number,
    retryDelayMs: validatedEnv.RETRY_DELAY_MS as number,
  },  // Features
  features: {
    enableOCR: validatedEnv.ENABLE_OCR as boolean,
    enableDashboard: validatedEnv.ENABLE_DASHBOARD as boolean,
    enableAPIAccess: validatedEnv.ENABLE_API_ACCESS as boolean,
  },

  // Monitoring
  monitoring: {
    sentryDSN: validatedEnv.SENTRY_DSN as string,
    datadogApiKey: validatedEnv.DATADOG_API_KEY as string,
  },

  // Development
  dev: {
    debugMode: validatedEnv.DEBUG_MODE as boolean,
    mockAIResponses: validatedEnv.MOCK_AI_RESPONSES as boolean,
    skipEmailVerification: validatedEnv.SKIP_EMAIL_VERIFICATION as boolean,
  },
};

// Freeze the config object to prevent accidental mutations
Object.freeze(config);

/**
 * Log configuration status (but never log sensitive values!)
 */
console.log(`✅ Configuration loaded for ${config.app.env} environment`);
console.log(`   App: ${config.app.name} on port ${config.app.port}`);
console.log(`   Features: OCR=${config.features.enableOCR}, Dashboard=${config.features.enableDashboard}`);

export default config;