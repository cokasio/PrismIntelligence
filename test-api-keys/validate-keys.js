#!/usr/bin/env node

/**
 * Prism Intelligence - API Key Validation Suite
 * Tests all configured API keys and reports status
 */

require('dotenv').config({ path: '../.env' });
const https = require('https');
const { createSupabaseClient } = require('@supabase/supabase-js');

class APIKeyValidator {
  constructor() {
    this.results = {
      anthropic: { status: 'pending', details: '' },
      gemini: { status: 'pending', details: '' },
      openai: { status: 'pending', details: '' },
      deepseek: { status: 'pending', details: '' },
      mistral: { status: 'pending', details: '' },
      supabase: { status: 'pending', details: '' },
      cloudmailin: { status: 'pending', details: '' }
    };
  }

  async validateAnthropic() {
    try {
      console.log('🤖 Testing Anthropic (Claude) API...');
      
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY not found in environment');
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Test' }]
        })
      });

      if (response.ok) {
        this.results.anthropic = { 
          status: 'valid', 
          details: `Claude API authenticated successfully (${process.env.ANTHROPIC_MODEL || 'claude-3-sonnet'})` 
        };
      } else {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }
    } catch (error) {
      this.results.anthropic = { 
        status: 'error', 
        details: error.message 
      };
    }
  }

  async validateGemini() {
    try {
      console.log('🔮 Testing Google Gemini API...');
      
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not found in environment');
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Test' }] }]
          })
        }
      );

      if (response.ok) {
        this.results.gemini = { 
          status: 'valid', 
          details: `Gemini API authenticated successfully (${process.env.GEMINI_MODEL || 'gemini-1.5-pro'})` 
        };
      } else {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }
    } catch (error) {
      this.results.gemini = { 
        status: 'error', 
        details: error.message 
      };
    }
  }

  async validateOpenAI() {
    try {
      console.log('🧠 Testing OpenAI API...');
      
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not found in environment');
      }

      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const gpt4Available = data.data.some(model => model.id.includes('gpt-4'));
        
        this.results.openai = { 
          status: 'valid', 
          details: `OpenAI API authenticated successfully (${gpt4Available ? 'GPT-4 available' : 'GPT-3.5 available'})` 
        };
      } else {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }
    } catch (error) {
      this.results.openai = { 
        status: 'error', 
        details: error.message 
      };
    }
  }

  async validateDeepSeek() {
    try {
      console.log('🔍 Testing DeepSeek API...');
      
      if (!process.env.DEEPSEEK_API_KEY) {
        throw new Error('DEEPSEEK_API_KEY not found in environment');
      }

      const response = await fetch('https://api.deepseek.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        this.results.deepseek = { 
          status: 'valid', 
          details: 'DeepSeek API authenticated successfully' 
        };
      } else {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }
    } catch (error) {
      this.results.deepseek = { 
        status: 'error', 
        details: error.message 
      };
    }
  }

  async validateMistral() {
    try {
      console.log('🌪️ Testing Mistral AI API...');
      
      if (!process.env.MISTRAL_API_KEY) {
        throw new Error('MISTRAL_API_KEY not found in environment');
      }

      const response = await fetch('https://api.mistral.ai/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        this.results.mistral = { 
          status: 'valid', 
          details: 'Mistral AI API authenticated successfully' 
        };
      } else {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }
    } catch (error) {
      this.results.mistral = { 
        status: 'error', 
        details: error.message 
      };
    }
  }

  async validateSupabase() {
    try {
      console.log('💾 Testing Supabase connection...');
      
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        throw new Error('Supabase credentials not found in environment');
      }

      // Simple connection test - we'll just try to create a client
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_ANON_KEY;
      
      if (supabaseUrl.includes('supabase.co') && supabaseKey.startsWith('eyJ')) {
        this.results.supabase = { 
          status: 'valid', 
          details: 'Supabase credentials properly formatted and configured' 
        };
      } else {
        throw new Error('Invalid Supabase URL or key format');
      }
    } catch (error) {
      this.results.supabase = { 
        status: 'error', 
        details: error.message 
      };
    }
  }

  async validateCloudMailin() {
    try {
      console.log('📧 Testing CloudMailin configuration...');
      
      // Check if CloudMailin environment variables exist
      const hasCloudMailinConfig = process.env.CLOUDMAILIN_ADDRESS || 
                                  process.env.CLOUDMAILIN_SECRET ||
                                  process.env.CLOUDMAILIN_ID_1;

      if (hasCloudMailinConfig) {
        this.results.cloudmailin = { 
          status: 'configured', 
          details: 'CloudMailin credentials found in environment (webhook testing required)' 
        };
      } else {
        this.results.cloudmailin = { 
          status: 'missing', 
          details: 'No CloudMailin configuration found - email processing unavailable' 
        };
      }
    } catch (error) {
      this.results.cloudmailin = { 
        status: 'error', 
        details: error.message 
      };
    }
  }

  async runAllValidations() {
    console.log('🔑 Prism Intelligence - API Key Validation Suite');
    console.log('==================================================\n');

    // Run all validations in parallel for speed
    await Promise.all([
      this.validateAnthropic(),
      this.validateGemini(),
      this.validateOpenAI(),
      this.validateDeepSeek(),
      this.validateMistral(),
      this.validateSupabase(),
      this.validateCloudMailin()
    ]);

    this.generateReport();
  }

  generateReport() {
    console.log('\n📊 VALIDATION RESULTS');
    console.log('========================\n');

    const statusEmoji = {
      valid: '✅',
      configured: '⚠️',
      error: '❌',
      missing: '⭕',
      pending: '⏳'
    };

    let validCount = 0;
    let totalCount = 0;

    Object.entries(this.results).forEach(([service, result]) => {
      const emoji = statusEmoji[result.status] || '❓';
      const serviceName = service.charAt(0).toUpperCase() + service.slice(1);
      
      console.log(`${emoji} ${serviceName.padEnd(12)} - ${result.details}`);
      
      if (result.status === 'valid') validCount++;
      totalCount++;
    });

    console.log('\n🎯 SUMMARY');
    console.log('============');
    console.log(`✅ Valid APIs: ${validCount}/${totalCount}`);
    console.log(`⚠️  Configured: ${Object.values(this.results).filter(r => r.status === 'configured').length}`);
    console.log(`❌ Errors: ${Object.values(this.results).filter(r => r.status === 'error').length}`);
    console.log(`⭕ Missing: ${Object.values(this.results).filter(r => r.status === 'missing').length}`);

    // Agent readiness assessment
    console.log('\n🤖 AGENT READINESS');
    console.log('===================');
    
    const agentStatus = {
      'FinanceBot (Claude)': this.results.anthropic.status === 'valid' ? '✅ Ready' : '❌ Not Ready',
      'TenantBot (Gemini)': this.results.gemini.status === 'valid' ? '✅ Ready' : '❌ Not Ready',
      'RiskBot (OpenAI)': this.results.openai.status === 'valid' ? '✅ Ready' : '❌ Not Ready',
      'ComplianceBot (DeepSeek)': this.results.deepseek.status === 'valid' ? '✅ Ready' : '❌ Not Ready',
      'MaintenanceBot (Mistral)': this.results.mistral.status === 'valid' ? '✅ Ready' : '❌ Not Ready'
    };

    Object.entries(agentStatus).forEach(([agent, status]) => {
      console.log(`${status.padEnd(15)} ${agent}`);
    });

    console.log('\n🔄 NEXT STEPS');
    console.log('==============');
    
    if (validCount === 5) {
      console.log('🎉 All AI APIs are ready! Multi-agent system fully operational.');
      console.log('🚀 Ready to switch from MOCK_AI_RESPONSES=true to false');
    } else {
      console.log('⚠️  Some API keys need attention before full agent deployment.');
    }

    if (this.results.supabase.status === 'valid') {
      console.log('💾 Database ready for persistent learning and memory.');
    }

    if (this.results.cloudmailin.status !== 'valid') {
      console.log('📧 Email processing requires CloudMailin webhook configuration.');
    }

    console.log('\n💡 Run this validation anytime with: node test-api-keys/validate-keys.js');
  }
}

// Execute validation if run directly
if (require.main === module) {
  const validator = new APIKeyValidator();
  validator.runAllValidations().catch(console.error);
}

module.exports = APIKeyValidator;
