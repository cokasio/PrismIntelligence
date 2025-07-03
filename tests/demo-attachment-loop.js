// Simplified Attachment Intelligence Loop
require('dotenv').config();
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs').promises;

console.log('🎉 ============================================');
console.log('    PRISM INTELLIGENCE');
console.log('    Attachment Intelligence Loop - DEMO');
console.log('============================================');
console.log('');
console.log('🧠 AI-Powered Property Document Processing');
console.log('   - Gemini AI for document classification');
console.log('   - Claude AI for business intelligence');
console.log('   - Automated insights and recommendations');
console.log('');

// Initialize AI services
const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

// File processing function
async function processFile(filePath) {
  const filename = path.basename(filePath);
  const startTime = Date.now();
  
  console.log(`📁 File detected: ${filename}`);
  console.log(`🔄 Processing: ${filename}`);
  
  try {
    // Step 1: Read file content
    const fileContent = await fs.readFile(filePath, 'utf8');
    console.log(`📖 Read ${fileContent.length} characters from ${filename}`);
    
    // Step 2: Classify with Gemini
    console.log(`🧠 Classifying with Gemini: ${filename}`);
    const classificationPrompt = `
Analyze this property management document and classify it:

Filename: ${filename}
Content preview: ${fileContent.substring(0, 500)}...

Classify this document as one of:
- financial (P&L, income statements, financial summaries)
- rent_roll (tenant listings, occupancy reports)
- lease (lease agreements, contracts)
- maintenance (work orders, repair reports)

Respond with just the classification type and confidence percentage.
Example: "financial (95%)"
`;

    const geminiResult = await geminiModel.generateContent(classificationPrompt);
    const geminiResponse = geminiResult.response.text();
    console.log(`🎯 Gemini classification: ${geminiResponse.trim()}`);
    
    // Step 3: Analyze with Claude
    console.log(`💡 Generating insights with Claude: ${filename}`);
    const analysisPrompt = `
You are a property management AI analyst. Analyze this document and provide actionable business insights.

Document: ${filename}
Classification: ${geminiResponse}
Content: ${fileContent}

Please provide:
1. Executive Summary (2-3 sentences)
2. Key Findings (3-5 bullet points)
3. Action Items (2-3 specific recommendations with priorities)
4. Potential Concerns or Opportunities

Focus on practical, actionable insights that a property manager can implement immediately.
`;

    const claudeResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: analysisPrompt }]
    });
    
    const insights = claudeResponse.content[0].text;
    console.log(`✨ Claude insights generated for ${filename}`);
    console.log('');
    console.log('📊 ANALYSIS RESULTS:');
    console.log('══════════════════════════════════════════');
    console.log(insights);
    console.log('══════════════════════════════════════════');
    console.log('');
    
    // Step 4: Archive processed file
    const processedDir = 'C:/Dev/PrismIntelligence/processed';
    await fs.mkdir(processedDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archivedPath = path.join(processedDir, `${timestamp}-${filename}`);
    await fs.rename(filePath, archivedPath);
    
    const processingTime = Date.now() - startTime;
    console.log(`📦 Archived: ${filename} → ${path.basename(archivedPath)}`);
    console.log(`✅ Successfully processed: ${filename} (${processingTime}ms)`);
    console.log('');
    
  } catch (error) {
    console.error(`❌ Failed to process ${filename}:`, error.message);
    
    // Move failed files to error directory
    const errorDir = 'C:/Dev/PrismIntelligence/errors';
    await fs.mkdir(errorDir, { recursive: true });
    const errorPath = path.join(errorDir, filename);
    try {
      await fs.rename(filePath, errorPath);
      console.log(`🚫 Moved failed file to: ${errorPath}`);
    } catch (moveError) {
      console.error(`Failed to move error file: ${moveError.message}`);
    }
  }
}

// Setup file watcher
const watchedDirs = [
  'C:/Dev/PrismIntelligence/incoming',
  'C:/Dev/PrismIntelligence/incoming/financial',
  'C:/Dev/PrismIntelligence/incoming/reports',
  'C:/Dev/PrismIntelligence/incoming/leases',
  'C:/Dev/PrismIntelligence/incoming/maintenance'
];

console.log('📂 Watching directories:');
watchedDirs.forEach(dir => console.log(`   📊 ${dir}`));
console.log('');

const watcher = chokidar.watch(watchedDirs, {
  ignored: /[\/\\]\./,
  persistent: true,
  ignoreInitial: false
});

watcher
  .on('add', (filePath) => {
    if (path.extname(filePath).toLowerCase() === '.csv') {
      processFile(filePath);
    }
  })
  .on('error', error => console.error(`❌ Watcher error: ${error}`));

console.log('✅ Attachment Intelligence Loop is running!');
console.log('📁 Drop CSV files in the incoming folders to see AI processing in action');
console.log('🛑 Press Ctrl+C to stop');
console.log('');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('');
  console.log('🛑 Received shutdown signal...');
  watcher.close().then(() => {
    console.log('👋 Attachment Intelligence Loop stopped gracefully');
    process.exit(0);
  });
});
