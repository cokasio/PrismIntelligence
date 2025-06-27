# 🔐 Supabase Connection Quick Guide

## Where to Find Your Connection Details:

1. **Supabase Dashboard**: https://supabase.com/dashboard
2. Go to: Settings → Database → Connection string
3. Select the "URI" tab
4. Copy the entire connection string

## Example Format:
```
DATABASE_URL=postgresql://postgres:YourActualPassword@db.your-project-ref.supabase.co:5432/postgres
```

## ⚠️ Common Issues:

1. **Password Placeholder**: Make sure to replace [YOUR-PASSWORD] with your actual password
2. **SSL Required**: The connection already includes SSL in the code (ssl: { rejectUnauthorized: false })
3. **Pooler vs Direct**: Use the direct connection (not pooler) for migrations

## Test Your Connection:
After updating .env, run:
```bash
npm run db:push
```

Success looks like:
```
[✓] Pulling schema from database...
[✓] Your database is now in sync with your schema
```