# Prism Intelligence Batch Files

This directory contains batch files to easily manage the Prism Intelligence platform on Windows.

## 🚀 Available Batch Files

### Start Scripts

1. **start-prism-unified.bat** (Recommended)
   - Starts both backend and frontend in a single terminal window
   - Shows combined logs from both services
   - Press `Ctrl+C` to stop both services
   - Quick and simple for daily development

2. **start-prism-separate.bat**
   - Opens backend and frontend in separate command windows
   - Useful when you need to see logs separately
   - Each window can be closed independently
   - Better for debugging specific services

3. **start-prism.bat**
   - Enhanced version with dependency checking
   - Installs missing dependencies automatically
   - Has both unified and separate window options

### Control Scripts

4. **stop-prism.bat**
   - Stops all running Prism Intelligence services
   - Kills all Node.js processes
   - Use this to cleanly shut down everything

5. **restart-prism.bat**
   - Stops all services and restarts them
   - Useful when you need a fresh start
   - Combines stop + start operations

## 📋 Usage Examples

```batch
# Start development (recommended)
start-prism-unified.bat

# Start with separate windows for debugging
start-prism-separate.bat

# Stop all services
stop-prism.bat

# Restart everything
restart-prism.bat
```

## 🔧 What Gets Started

- **Frontend**: Next.js dashboard on http://localhost:3000
- **Backend**: Attachment Intelligence Loop (file watcher service)
  - Watches: C:/Dev/PrismIntelligence/incoming/
  - Processes property management documents with AI

## ⚠️ Troubleshooting

If services don't start properly:
1. Make sure you have Node.js 18+ installed
2. Run `npm install` in the root directory
3. Check that your .env file has required API keys
4. Use `stop-prism.bat` before starting again

## 🎯 Pro Tips

- Use unified mode for normal development
- Use separate windows when debugging specific issues
- The backend watches for files in the incoming folder
- Drop property documents in incoming folders to see AI processing 