@echo off
REM Quick fix for PrismIntelligence test issues

echo Fixing test issues...

REM 1. Install missing dev dependencies
echo Installing test dependencies...
npm install --save-dev @types/jest jest-mock

REM 2. Fix TypeScript config for tests
echo Updating TypeScript config...
echo Add these to tsconfig.json under compilerOptions:
echo   "types": ["node", "jest"],
echo   "esModuleInterop": true

REM 3. Generate working test templates
echo Generating test templates...

echo Done! Now run:
echo   aider src/parsers/csv.ts src/tests/parsers/csv.test.ts -m "Fix tests to match actual API"
echo   aider src/index.ts -m "Fix unused variable warnings"

pause
