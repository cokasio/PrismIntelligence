@echo off
echo Installing Magic UI components...
echo.

cd frontend

echo Installing Magic UI dependencies...
npm install framer-motion clsx tailwind-merge

echo.
echo Installing additional animation libraries...
npm install @react-spring/web react-intersection-observer

echo.
echo Installation complete!
echo.
echo Magic UI is ready to use in your landing page!
pause