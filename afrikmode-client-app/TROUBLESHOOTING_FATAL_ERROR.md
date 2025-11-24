# Guide de Dépannage - Erreur Fatal Error Angular

## Problème
L'application Angular se compile avec succès mais crash avec "fatal error" après le démarrage du serveur de développement.

## Solutions à Essayer (dans l'ordre)

### ✅ Solution 1 : Nettoyer le Cache (DÉJÀ FAIT)
```bash
npm run clean:win
```

### ✅ Solution 2 : Augmenter la Mémoire Node.js (DÉJÀ FAIT)
La mémoire a été augmentée de 6GB à 8GB dans `package.json`.

### Solution 3 : Vérifier si le Backend est Démarré
Le WebSocket service essaie de se connecter à `http://localhost:3001`.
- **Vérifier** : Le backend doit être démarré sur le port 3001
- **Si le backend n'est pas démarré** : L'erreur peut venir de là

### Solution 4 : Démarrer avec Plus de Détails
```bash
npm start -- --verbose
```
Cela affichera tous les fichiers et erreurs détaillées.

### Solution 5 : Vérifier les Erreurs dans la Console du Navigateur
1. Ouvrir `http://localhost:4200` dans le navigateur
2. Ouvrir la console (F12)
3. Vérifier s'il y a des erreurs JavaScript

### Solution 6 : Désactiver Temporairement le WebSocket
Si le backend n'est pas démarré, commenter temporairement la connexion WebSocket dans les composants qui l'utilisent.

### Solution 7 : Vérifier les Variables d'Environnement
Vérifier que `src/environments/environment.ts` a la bonne URL de l'API :
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001/api'
};
```

### Solution 8 : Réinstaller les Dépendances
```bash
rm -rf node_modules package-lock.json
npm install
```

### Solution 9 : Vérifier les Ports
Vérifier que le port 4200 n'est pas déjà utilisé :
```bash
netstat -ano | findstr :4200
```

### Solution 10 : Démarrer en Mode Light
```bash
npm run start:light
```
Cela utilise moins de mémoire (4GB au lieu de 8GB).

## Diagnostic Avancé

### Vérifier les Logs Complets
```bash
npm start 2>&1 | tee error.log
```
Cela sauvegardera tous les logs dans `error.log`.

### Vérifier les Services qui se Connectent au Démarrage
Services qui peuvent causer des erreurs :
1. **WebsocketService** : Se connecte à `localhost:3001`
2. **AuthService** : Vérifie le token au démarrage
3. **TokenRefreshService** : Démarre un timer

### Vérifier les Interceptors
Les interceptors dans `app.config.ts` peuvent causer des erreurs :
- `authInterceptor`
- `errorInterceptor`
- `headersInterceptor`

## Solution Rapide

1. **Démarrer le backend d'abord** :
   ```bash
   cd ../../backend
   npm start
   ```

2. **Ensuite démarrer le frontend** :
   ```bash
   cd ../thesymo-platform/afrikmode-client-app
   npm start
   ```

## Si Rien ne Fonctionne

1. Vérifier la version de Node.js (doit être >= 18) :
   ```bash
   node --version
   ```

2. Vérifier la version de npm :
   ```bash
   npm --version
   ```

3. Mettre à jour Angular CLI :
   ```bash
   npm install -g @angular/cli@latest
   ```

4. Recréer le projet si nécessaire (dernier recours)

## Erreurs Communes

### "Cannot find module"
```bash
npm install
```

### "Port already in use"
Changer le port dans `angular.json` ou tuer le processus :
```bash
# Windows
netstat -ano | findstr :4200
taskkill /PID <PID> /F
```

### "Out of memory"
Augmenter encore la mémoire dans `package.json` :
```json
"start": "node --max-old-space-size=10240 ..."
```

## Contact
Si le problème persiste, vérifier :
- Les logs complets avec `--verbose`
- La console du navigateur
- Les logs du backend

