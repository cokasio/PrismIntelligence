@echo off
echo Installing additional UI dependencies...
echo.

cd frontend

echo Installing Radix UI components for Avatar, Navigation Menu, and Toast...
npm install @radix-ui/react-avatar @radix-ui/react-navigation-menu @radix-ui/react-toast

echo.
echo Installation complete!
echo.
echo Your landing page is ready to view at http://localhost:3000
echo.
pause