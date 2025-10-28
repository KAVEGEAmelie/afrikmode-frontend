# Script PowerShell sécurisé pour AfrikMode
Write-Host "🚀 Démarrage sécurisé d'AfrikMode..." -ForegroundColor Green

# Variables d'environnement pour Node.js
$env:NODE_OPTIONS = "--max-old-space-size=16384 --max-semi-space-size=1024"
$env:NODE_ENV = "development"

Write-Host "💾 Mémoire allouée: 16GB" -ForegroundColor Yellow
Write-Host "🔧 Configuration: Développement sécurisé" -ForegroundColor Yellow
Write-Host "🌐 Serveur: http://localhost:4200" -ForegroundColor Cyan

# Vérifier que nous sommes dans le bon répertoire
if (!(Test-Path "package.json")) {
    Write-Host "❌ Erreur: package.json non trouvé. Vérifiez le répertoire." -ForegroundColor Red
    exit 1
}

# Démarrer le serveur avec gestion d'erreur
try {
    Write-Host "🔄 Démarrage du serveur..." -ForegroundColor Yellow
    ng serve --port 4200 --host 0.0.0.0 --disable-host-check --configuration development
} catch {
    Write-Host "❌ Erreur lors du démarrage: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Essayez de redémarrer votre ordinateur pour libérer la mémoire." -ForegroundColor Yellow
    exit 1
}













