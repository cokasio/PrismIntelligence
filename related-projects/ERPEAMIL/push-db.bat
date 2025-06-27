@echo off
set DATABASE_URL=postgresql://postgres:lBa4pE1vnTtrZ0LN@db.wxesdralkicmqedqegpb.supabase.co:5432/postgres
set NODE_ENV=development

echo Pushing database schema changes...
npm run db:push

echo.
echo Database schema updated!
pause