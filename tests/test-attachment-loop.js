// Quick test to see if we can start the attachment intelligence system
require('dotenv').config();

console.log('🎉 ============================================');
console.log('    PRISM INTELLIGENCE TEST');
console.log('    Attachment Intelligence Loop');
console.log('============================================');
console.log('');

// Check environment variables
console.log('🔍 Checking environment...');
console.log('✅ ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? 'SET' : 'MISSING');
console.log('✅ GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY ? 'SET' : 'MISSING');
console.log('✅ SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'MISSING');
console.log('');

// Test basic functionality
console.log('🧪 Testing basic AI connections...');

const testAnthropicConnection = async () => {
  try {
    const Anthropic = require('@anthropic-ai/sdk');
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    console.log('✅ Anthropic SDK initialized successfully');
    return true;
  } catch (error) {
    console.log('❌ Anthropic connection failed:', error.message);
    return false;
  }
};

const testGoogleConnection = async () => {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    console.log('✅ Google Gemini initialized successfully');
    return true;
  } catch (error) {
    console.log('❌ Google Gemini connection failed:', error.message);
    return false;
  }
};

// Run tests
(async () => {
  const anthropicOk = await testAnthropicConnection();
  const geminiOk = await testGoogleConnection();
  
  console.log('');
  if (anthropicOk && geminiOk) {
    console.log('🚀 All systems ready! Your dual AI system is configured correctly.');
    console.log('📁 Next step: Place files in C:\\Dev\\PrismIntelligence\\incoming\\ to test processing');
  } else {
    console.log('⚠️ Some issues found. Please check your API keys and try again.');
  }
  console.log('');
})().catch(console.error);
