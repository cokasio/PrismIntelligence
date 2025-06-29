// Test CloudMailin webhook locally
import express from 'express';
import multiTenantRoutes from '../src/routes/multi-tenant';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '50mb' })); // CloudMailin can send large attachments
app.use(multiTenantRoutes);

// Test endpoint to verify server is running
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    env: {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_KEY,
      hasCloudMailinSecret: !!process.env.CLOUDMAILIN_SECRET
    }
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📧 CloudMailin webhook: http://localhost:${PORT}/webhook/cloudmailin`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});

// For testing with ngrok:
// 1. Install ngrok: https://ngrok.com
// 2. Run: ngrok http 3000
// 3. Use the HTTPS URL for CloudMailin webhook