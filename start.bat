@echo off
echo Starting Workforce Platform...

echo Starting Backend Server (Port 4000)...
start cmd /k "cd backend && npx ts-node --transpile-only src/index.ts"

echo Starting Frontend Server (Port 3000)...
start cmd /k "cd frontend && npm run dev"

echo Both servers are starting in new command prompt windows.
echo You can view the app at http://localhost:3000
