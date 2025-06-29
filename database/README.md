# Database Setup - Property Intelligence Platform

This directory contains everything you need to set up your Supabase database with pgvector support for the Property Intelligence Platform.

## Quick Start

1. **Read the Setup Guide**
   - Open `SUPABASE_SETUP_GUIDE.md` for detailed authentication instructions
   - Choose your preferred method (Dashboard, CLI, or Direct Connection)

2. **Enable pgvector Extension**
   - Go to Supabase Dashboard → Database → Extensions
   - Search for "vector" and enable it
   - This is required for AI embeddings and similarity search

3. **Run the Schema**
   - Copy the contents of `schema.sql`
   - Paste into Supabase SQL Editor and run
   - Or use one of the methods in the setup guide

4. **Configure Environment**
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase credentials
   - Never commit `.env.local` to git!

## What's Included

### 📁 Files in this Setup

- **schema.sql** - Complete database schema with:
  - Multi-tenant support (companies table)
  - Property management tables
  - AI vector embeddings for similarity search
  - Row Level Security (RLS) policies
  - Custom functions for vector operations
  
- **SUPABASE_SETUP_GUIDE.md** - Comprehensive guide covering:
  - 4 different ways to authenticate with Supabase
  - Security best practices
  - Troubleshooting tips
  - Quick test queries

- **../lib/supabase.js** - JavaScript client configuration:
  - Client-side Supabase setup
  - Server-side admin client
  - Example functions for your schema

- **../.env.example** - Environment variable template

## Key Features of the Schema

### 🧠 AI-Powered Features
- **Vector Embeddings**: Each entity has a 1536-dimension vector for semantic search
- **Similarity Search**: Find related properties, reports, and insights
- **Knowledge Base**: Store and retrieve AI-processed insights

### 🏢 Multi-Tenant Architecture
- Company-based isolation
- Row Level Security (RLS) enabled
- Secure data separation

### 📊 Core Tables
1. **companies** - Multi-tenant support
2. **properties** - Property management entities
3. **tenants** - Tenant information
4. **reports** - Uploaded and processed reports
5. **insights** - AI-generated insights
6. **action_items** - Actionable tasks from insights
7. **entity_relationships** - Graph-like connections
8. **knowledge_base** - AI learning storage

## Next Steps

After setting up the database:

1. **Test the Connection**
   ```javascript
   // In your app
   import { supabase } from './lib/supabase'
   
   const { data } = await supabase.from('companies').select('*')
   console.log(data)
   ```

2. **Set Up Authentication**
   - Configure Supabase Auth
   - Update RLS policies with your auth setup

3. **Start Building**
   - Use the example functions in `lib/supabase.js`
   - Implement vector embeddings with OpenAI
   - Build your email ingestion pipeline

## Important Security Notes

⚠️ **Service Role Key**: Only use on the server-side, never expose to clients
⚠️ **RLS Policies**: Customize the example policy for your auth system
⚠️ **Environment Variables**: Always use `.env.local` and add to `.gitignore`

## Troubleshooting

See `SUPABASE_SETUP_GUIDE.md` for common issues and solutions.

---

Ready to build the future of property intelligence! 🚀