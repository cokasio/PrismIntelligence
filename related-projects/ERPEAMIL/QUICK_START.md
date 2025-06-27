# 🚀 Quick Start Guide for ERPEAMIL

## Prerequisites Check
- ✅ Node.js 18+ installed
- ✅ PostgreSQL database (local or Supabase)
- ✅ npm or yarn package manager

## Step-by-Step Setup

### 1️⃣ Create Environment Configuration
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual values
# At minimum, you need DATABASE_URL
```

### 2️⃣ Install Dependencies
```bash
npm install
# or
yarn install
```

### 3️⃣ Set Up Database

#### Option A: Using Local PostgreSQL
```bash
# Make sure PostgreSQL is running
# Create a new database
createdb erpeamil_dev

# Update .env with your connection string:
# DATABASE_URL=postgresql://postgres:password@localhost:5432/erpeamil_dev
```

#### Option B: Using Supabase (Recommended)
1. Go to https://supabase.com/dashboard
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string
5. Update .env with Supabase URL

### 4️⃣ Run Database Migrations
```bash
npm run db:push
```

### 5️⃣ Start the Development Server
```bash
npm run dev
```

### 6️⃣ Access the Application
Open your browser to: http://localhost:5000

## 🔥 Common Issues & Solutions

### Issue: "DATABASE_URL must be set"
**Solution**: Create .env file and add DATABASE_URL

### Issue: "Cannot connect to database"
**Solution**: 
- Check PostgreSQL is running: `pg_ctl status`
- Verify credentials in DATABASE_URL
- For Supabase, check SSL settings

### Issue: "Port 5000 already in use"
**Solution**: 
- Change port in .env: `PORT=3000`
- Or kill process on port 5000

### Issue: "Module not found"
**Solution**: 
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🎯 Testing the Application

1. **Create New Session**: Click "New Analysis"
2. **Upload Test File**: Drag & drop a CSV/Excel file
3. **Chat Interface**: Ask questions about the data
4. **Check WebSocket**: Look for "Connected" indicator

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push database changes
- `npm run check` - TypeScript type checking

## 🔧 Optional: Enable All AI Features

To use all AI agents, add these to .env:
- OPENAI_API_KEY (for Income Analyst)
- ANTHROPIC_API_KEY (for Balance Analyst)
- GOOGLE_API_KEY (for Cash Flow Analyst)
- DEEPSEEK_API_KEY (for Strategic Advisor)

Without API keys, the app will still work but AI features will be limited.

## ✨ You're Ready!

Once the server starts, you should see:
```
Server running on http://localhost:5000
WebSocket server listening...
Database connected successfully
```

Happy analyzing! 🚀