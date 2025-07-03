#!/usr/bin/env node

/**
 * Prism Intelligence - API Key Security Enhancer
 * Implements production-ready API key management with rotation and vaults
 */

require('dotenv').config({ path: '../.env' });
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class APIKeySecurityEnhancer {
  constructor() {
    this.encryptionKey = this.generateOrRetrieveEncryptionKey();
    this.vaultPath = path.join(__dirname, '../.vault');
  }

  generateOrRetrieveEncryptionKey() {
    const keyPath = path.join(__dirname, '../.encryption-key');
    
    if (fs.existsSync(keyPath)) {
      return fs.readFileSync(keyPath, 'utf8').trim();
    }
    
    // Generate new 32-byte key
    const key = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(keyPath, key);
    console.log('🔐 Generated new encryption key');
    return key;
  }

  encrypt(text) {
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, this.encryptionKey);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: cipher.getAuthTag().toString('hex')
    };
  }

  decrypt(encryptedData) {
    const algorithm = 'aes-256-gcm';
    const decipher = crypto.createDecipher(algorithm, this.encryptionKey);
    
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  createSecureVault() {
    console.log('🔒 Creating secure API key vault...');
    
    const apiKeys = {
      anthropic: process.env.ANTHROPIC_API_KEY,
      gemini: process.env.GEMINI_API_KEY,
      openai: process.env.OPENAI_API_KEY,
      deepseek: process.env.DEEPSEEK_API_KEY,
      mistral: process.env.MISTRAL_API_KEY,
      supabase_url: process.env.SUPABASE_URL,
      supabase_anon_key: process.env.SUPABASE_ANON_KEY,
      supabase_service_key: process.env.SUPABASE_SERVICE_KEY
    };

    const encryptedVault = {};
    
    Object.entries(apiKeys).forEach(([key, value]) => {
      if (value) {
        encryptedVault[key] = this.encrypt(value);
      }
    });

    // Add metadata
    encryptedVault._metadata = {
      created: new Date().toISOString(),
      version: '1.0',
      algorithm: 'aes-256-gcm'
    };

    fs.writeFileSync(this.vaultPath, JSON.stringify(encryptedVault, null, 2));
    console.log('✅ Secure vault created at .vault');
  }

  generateSupabaseVaultMigration() {
    console.log('💾 Generating Supabase Vault migration...');
    
    const migrationSQL = `
-- Prism Intelligence - Secure API Key Vault
-- Create encrypted storage for production API keys

CREATE TABLE IF NOT EXISTS api_key_vault (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL UNIQUE,
  encrypted_key TEXT NOT NULL,
  encryption_metadata JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_rotation TIMESTAMP WITH TIME ZONE,
  rotation_schedule INTERVAL DEFAULT '30 days'
);

-- Enable Row Level Security
ALTER TABLE api_key_vault ENABLE ROW LEVEL SECURITY;

-- Create policies for service access only
CREATE POLICY "Service role can read api keys" ON api_key_vault
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Service role can write api keys" ON api_key_vault
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update api keys" ON api_key_vault
  FOR UPDATE USING (auth.role() = 'service_role');

-- Create function to trigger key rotation alerts
CREATE OR REPLACE FUNCTION check_key_rotation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_rotation + NEW.rotation_schedule < NOW() THEN
    -- Insert into alerts table (create if needed)
    INSERT INTO system_alerts (alert_type, message, severity, created_at)
    VALUES (
      'key_rotation_required',
      'API key for ' || NEW.service_name || ' requires rotation',
      'medium',
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create alerts table if it doesn't exist
CREATE TABLE IF NOT EXISTS system_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'low',
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create trigger for key rotation monitoring
CREATE TRIGGER key_rotation_check
  AFTER UPDATE OF last_rotation ON api_key_vault
  FOR EACH ROW
  EXECUTE FUNCTION check_key_rotation();

-- Insert initial API keys (run manually with actual encrypted values)
/*
INSERT INTO api_key_vault (service_name, encrypted_key, encryption_metadata) VALUES
('anthropic', 'encrypted_claude_key', '{"algorithm": "aes-256-gcm", "iv": "...", "tag": "..."}'),
('gemini', 'encrypted_gemini_key', '{"algorithm": "aes-256-gcm", "iv": "...", "tag": "..."}'),
('openai', 'encrypted_openai_key', '{"algorithm": "aes-256-gcm", "iv": "...", "tag": "..."}'),
('deepseek', 'encrypted_deepseek_key', '{"algorithm": "aes-256-gcm", "iv": "...", "tag": "..."}'),
('mistral', 'encrypted_mistral_key', '{"algorithm": "aes-256-gcm", "iv": "...", "tag": "..."}'');
*/

-- Create view for easy access (with decryption in application layer)
CREATE VIEW api_keys_status AS
SELECT 
  service_name,
  created_at,
  last_rotation,
  (last_rotation + rotation_schedule) AS next_rotation_due,
  CASE 
    WHEN last_rotation + rotation_schedule < NOW() THEN 'REQUIRES_ROTATION'
    WHEN last_rotation + rotation_schedule < NOW() + INTERVAL '7 days' THEN 'ROTATION_SOON'
    ELSE 'CURRENT'
  END AS status
FROM api_key_vault;
`;

    fs.writeFileSync(
      path.join(__dirname, '../database/migrations/003_api_key_vault.sql'),
      migrationSQL
    );
    
    console.log('✅ Supabase vault migration created');
  }

  generateEnvironmentTemplates() {
    console.log('📝 Generating environment templates...');
    
    // Development template
    const devTemplate = `# Prism Intelligence - Development Environment
# Copy this file to .env and fill in your actual values

# Application Settings
NODE_ENV=development
PORT=3000
USE_MOCK_AI=true
DEMO_MODE=true

# Database (Development - Use your actual Supabase project)
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# AI APIs (Development - Safe to use directly)
ANTHROPIC_API_KEY=your-claude-key
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key
DEEPSEEK_API_KEY=your-deepseek-key
MISTRAL_API_KEY=your-mistral-key

# Email (Development)
CLOUDMAILIN_ADDRESS=your-test-address@cloudmailin.net
CLOUDMAILIN_SECRET=your-webhook-secret

# Security (Development)
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-32-character-encryption-key
`;

    // Production template
    const prodTemplate = `# Prism Intelligence - Production Environment
# Use secure vault for API keys in production

# Application Settings
NODE_ENV=production
PORT=3000
USE_MOCK_AI=false
DEMO_MODE=false

# Database (Production)
SUPABASE_URL=\${VAULT:supabase_url}
SUPABASE_ANON_KEY=\${VAULT:supabase_anon_key}
SUPABASE_SERVICE_KEY=\${VAULT:supabase_service_key}

# AI APIs (Production - Retrieved from secure vault)
ANTHROPIC_API_KEY=\${VAULT:anthropic}
GEMINI_API_KEY=\${VAULT:gemini}
OPENAI_API_KEY=\${VAULT:openai}
DEEPSEEK_API_KEY=\${VAULT:deepseek}
MISTRAL_API_KEY=\${VAULT:mistral}

# Email (Production)
CLOUDMAILIN_ADDRESS=\${VAULT:cloudmailin_address}
CLOUDMAILIN_SECRET=\${VAULT:cloudmailin_secret}

# Security (Production - Use platform secrets)
JWT_SECRET=\${PLATFORM_SECRET:jwt_secret}
ENCRYPTION_KEY=\${PLATFORM_SECRET:encryption_key}

# Monitoring
SENTRY_DSN=\${VAULT:sentry_dsn}
DATADOG_API_KEY=\${VAULT:datadog_key}
`;

    fs.writeFileSync(path.join(__dirname, '../.env.development'), devTemplate);
    fs.writeFileSync(path.join(__dirname, '../.env.production'), prodTemplate);
    
    console.log('✅ Environment templates created');
  }

  generateKeyRotationScript() {
    console.log('🔄 Generating API key rotation script...');
    
    const rotationScript = `#!/usr/bin/env node

/**
 * Prism Intelligence - API Key Rotation Script
 * Automates the process of rotating API keys for security
 */

const { createClient } = require('@supabase/supabase-js');

class APIKeyRotator {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  }

  async rotateAnthropicKey() {
    console.log('🔄 Rotating Anthropic API key...');
    // Implementation depends on Anthropic's key rotation API
    // For now, alert user to manually rotate
    
    await this.recordRotationEvent('anthropic', 'manual_rotation_required');
    console.log('⚠️  Anthropic key rotation requires manual intervention');
    console.log('   1. Visit https://console.anthropic.com');
    console.log('   2. Generate new API key');
    console.log('   3. Update vault with new key');
  }

  async rotateOpenAIKey() {
    console.log('🔄 Rotating OpenAI API key...');
    // Implementation depends on OpenAI's key rotation API
    
    await this.recordRotationEvent('openai', 'manual_rotation_required');
    console.log('⚠️  OpenAI key rotation requires manual intervention');
  }

  async recordRotationEvent(service, status) {
    const { error } = await this.supabase
      .from('api_key_vault')
      .update({ 
        last_rotation: new Date().toISOString(),
        rotation_status: status
      })
      .eq('service_name', service);

    if (error) {
      console.error(\`Error recording rotation for \${service}:\`, error);
    }
  }

  async checkRotationSchedule() {
    const { data, error } = await this.supabase
      .from('api_keys_status')
      .select('*')
      .in('status', ['REQUIRES_ROTATION', 'ROTATION_SOON']);

    if (error) {
      console.error('Error checking rotation schedule:', error);
      return;
    }

    if (data.length === 0) {
      console.log('✅ All API keys are current');
      return;
    }

    console.log('⚠️  Keys requiring attention:');
    data.forEach(key => {
      const urgency = key.status === 'REQUIRES_ROTATION' ? '🚨 URGENT' : '⚠️  SOON';
      console.log(\`   \${urgency} \${key.service_name} - Next rotation: \${key.next_rotation_due}\`);
    });
  }
}

// CLI interface
const action = process.argv[2];
const rotator = new APIKeyRotator();

switch (action) {
  case 'check':
    rotator.checkRotationSchedule();
    break;
  case 'rotate':
    const service = process.argv[3];
    if (!service) {
      console.log('Usage: node rotate-keys.js rotate <service>');
      process.exit(1);
    }
    // Implement service-specific rotation
    break;
  default:
    console.log('Usage: node rotate-keys.js <check|rotate>');
}
`;

    fs.writeFileSync(
      path.join(__dirname, '../scripts/rotate-keys.js'),
      rotationScript
    );
    
    console.log('✅ Key rotation script created');
  }

  async enhanceSecurity() {
    console.log('🛡️  Prism Intelligence - API Key Security Enhancement');
    console.log('=====================================================\n');

    // Create necessary directories
    const dirs = [
      '../database/migrations',
      '../scripts'
    ];
    
    dirs.forEach(dir => {
      const fullPath = path.join(__dirname, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });

    // Run all security enhancements
    this.createSecureVault();
    this.generateSupabaseVaultMigration();
    this.generateEnvironmentTemplates();
    this.generateKeyRotationScript();

    console.log('\n🎯 SECURITY ENHANCEMENT COMPLETE');
    console.log('==================================');
    console.log('✅ Encrypted local vault created');
    console.log('✅ Supabase vault migration ready');
    console.log('✅ Environment templates generated');
    console.log('✅ Key rotation script created');
    
    console.log('\n🔄 NEXT STEPS FOR PRODUCTION');
    console.log('==============================');
    console.log('1. Run Supabase migration: supabase db push');
    console.log('2. Set up key rotation schedule (monthly recommended)');
    console.log('3. Configure platform secrets (Railway/Vercel/etc)');
    console.log('4. Test vault access in staging environment');
  }
}

// Execute if run directly
if (require.main === module) {
  const enhancer = new APIKeySecurityEnhancer();
  enhancer.enhanceSecurity().catch(console.error);
}

module.exports = APIKeySecurityEnhancer;
`;

    fs.writeFileSync(
      path.join(__dirname, '../scripts/enhance-security.js'),
      securityScript
    );
    
    console.log('✅ Security enhancement script created');
  }
}

module.exports = APIKeySecurityEnhancer;
