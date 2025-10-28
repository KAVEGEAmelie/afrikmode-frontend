# Script PowerShell optimisé pour AfrikMode
Write-Host "🚀 Démarrage d'AfrikMode avec configuration optimisée..." -ForegroundColor Green

# Variables d'environnement pour Node.js
$env:NODE_OPTIONS = "--max-old-space-size=16384 --max-semi-space-size=1024"
$env:NODE_ENV = "development"

# Variables pour ESBuild
$env:ESBUILD_BINARY_PATH = ""

Write-Host "💾 Mémoire allouée: 16GB" -ForegroundColor Yellow
Write-Host "🔧 Configuration: Développement optimisé" -ForegroundColor Yellow
Write-Host "🌐 Serveur: http://localhost:4200" -ForegroundColor Cyan

# Démarrer le serveur
try {
    ng serve --port 4200 --host 0.0.0.0 --disable-host-check --configuration development
} catch {
    Write-Host "❌ Erreur lors du démarrage. Tentative avec configuration légère..." -ForegroundColor Red
    $env:NODE_OPTIONS = "--max-old-space-size=8192"
    ng serve --port 4200 --host 0.0.0.0 --disable-host-check --configuration development --source-map=false
}













