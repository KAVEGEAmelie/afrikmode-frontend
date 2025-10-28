import { ApplicationConfig } from '@angular/core';
import { CORE_PROVIDERS } from './providers.config';
import { APP_ROUTES } from './routes.config';

export const APP_CONFIG: ApplicationConfig = {
  providers: [
    ...CORE_PROVIDERS,
    {
      provide: 'APP_ROUTES',
      useValue: APP_ROUTES
    }
  ]
};


