// src/app/app.config.ts
// Configuration complète de l'application avec guards et interceptors
import { ApplicationConfig, provideZoneChangeDetection, LOCALE_ID } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { registerLocaleData } from '@angular/common';
import { routes } from './app.routes';

// Import des données de localisation française
import localeFr from '@angular/common/locales/fr';
import localeFrExtra from '@angular/common/locales/extra/fr';

// Enregistrer la localisation française
registerLocaleData(localeFr, 'fr', localeFrExtra);

// Import des interceptors
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { headersInterceptor } from './core/interceptors/headers.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      // Configuration pour remonter en haut de page à chaque navigation
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled'
      }),
      withComponentInputBinding()
    ),
    provideHttpClient(
      withInterceptors([
        headersInterceptor,  // En premier pour ajouter les headers
        authInterceptor,     // Ensuite pour ajouter le token
        errorInterceptor     // En dernier pour gérer les erreurs
      ])
    ),
    provideAnimations(),
    // Configuration de la localisation française
    { provide: LOCALE_ID, useValue: 'fr' }
  ]
};
