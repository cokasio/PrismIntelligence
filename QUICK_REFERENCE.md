# Prism Intelligence - Quick Reference

## 🚀 Most Used Commands

### Start Development
```bash
# Start everything (recommended)
npm run dev

# Or use Windows batch file
start-prism-unified.bat

# Start individual services
npm run dashboard:dev        # Frontend only (port 3000)
npm run attachment-loop:dev  # File watcher only
```

### Stop Services
```bash
# Windows
stop-prism.bat

# Or manually
Ctrl+C in terminal
```

## 📁 File Processing
Drop files in: `C:\Dev\PrismIntelligence\incoming\`
- Supported: CSV, Excel, PDF, TXT
- Processed files move to: `processed\`
- Watch logs for AI analysis results

## 🔧 Common Development Tasks

### Install New Package
```bash
# For root
npm install package-name

# For specific app
npm install package-name -w apps/dashboard
npm install package-name -w apps/attachment-loop
```

### Run Tests
```bash
npm test              # All tests
npm run test:watch    # Watch mode
```

### Database
```bash
npm run db:migrate    # Run migrations
npm run db:reset      # Reset database
```

### Code Quality
```bash
npm run lint:fix      # Fix linting issues
npm run format        # Format code
```

## 🌐 URLs & Endpoints
- **Frontend**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **CloudMailin Webhook**: /api/cloudmailin/webhook

## 🔑 Required Environment Variables
```env
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
SUPABASE_URL=https://...supabase.co
SUPABASE_ANON_KEY=eyJ...
```

## 📝 Git Commands
```bash
git add .
git commit -m "[Cursor] feat: your message"
git push origin feature/your-branch
```

## 🐛 Quick Debugging
1. Check logs in terminal
2. Verify `.env` file exists
3. Ensure all services are running
4. Check `http://localhost:3000/health`
5. Look for errors in browser console

## 📚 Key Files
- Config: `.env`, `.cursorrules`
- Logs: Check terminal output
- Types: `packages/types/index.ts`
- AI Config: `core/ai/orchestrators/`

## 💡 Tips
- Always run `npm install` after pulling changes
- Use batch files on Windows for easier management
- Check file permissions if watcher fails
- Monitor AI API usage to avoid rate limits 