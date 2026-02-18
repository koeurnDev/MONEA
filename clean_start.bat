 @echo off
echo [1/3] Killing all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

echo [2/3] Cleaning Next.js cache...
rmdir /s /q .next >nul 2>&1

echo [3/3] Starting Development Server...
npm run dev
pause
