// Configuration ESBuild pour optimiser la compilation
module.exports = {
  // Limiter le nombre de workers pour éviter le crash
  maxWorkers: 2,
  
  // Configuration de mémoire
  memoryLimit: 16384,
  
  // Optimisations
  minify: false,
  sourcemap: false,
  
  // Limiter les plugins
  plugins: [],
  
  // Configuration des chunks
  chunkSizeWarningLimit: 1000,
  
  // Désactiver certaines optimisations en dev
  optimizeDeps: {
    disabled: true
  }
};













