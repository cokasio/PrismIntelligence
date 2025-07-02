import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables FIRST
const envPath = path.join(__dirname, '../../../.env');
console.log('Loading .env from:', envPath);
const result = config({ path: envPath });

if (result.error) {
  console.error('Error loading .env:', result.error);
} else {
  console.log('✅ Loaded .env successfully');
  console.log('ANTHROPIC_API_KEY present:', !!process.env.ANTHROPIC_API_KEY);
  console.log('ANTHROPIC_API_KEY length:', process.env.ANTHROPIC_API_KEY?.length);
  console.log('First 20 chars:', process.env.ANTHROPIC_API_KEY?.substring(0, 20));
}

// Test just the env loading
console.log('\nAll ANTHROPIC env vars:');
Object.keys(process.env).filter(k => k.includes('ANTHROPIC')).forEach(key => {
  console.log(`${key}: ${process.env[key]?.substring(0, 20)}...`);
});
