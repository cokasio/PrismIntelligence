@echo off
start "Backend" cmd /c "npm run dev"
start "Frontend" cmd /c "cd frontend && npm run dev"
