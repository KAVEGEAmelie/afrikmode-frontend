@echo off
echo 🚀 Démarrage d'AfrikMode avec mémoire maximale...
echo.

REM Set maximum memory for Node.js
set NODE_OPTIONS=--max-old-space-size=16384 --max-semi-space-size=1024

REM Navigate to the correct directory
cd /d "%~dp0"

echo 💾 Mémoire allouée: 16GB
echo 🔧 Configuration: Développement avec mémoire maximale
echo 🌐 Serveur: http://localhost:4200
echo.

REM Start the development server
ng serve --port 4200 --host 0.0.0.0 --disable-host-check --configuration development

pause













