@echo off
echo Starting AfrikMode Development Server...
echo.

REM Set Node.js memory limit
set NODE_OPTIONS=--max-old-space-size=8192

REM Start the development server
ng serve --port 4200 --host 0.0.0.0 --disable-host-check --configuration development

pause













