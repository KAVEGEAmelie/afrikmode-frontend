import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { appHttpInterceptors } from './interceptor.config';

export const CORE_PROVIDERS = [
  provideHttpClient(withInterceptorsFromDi()),
  provideAnimations(),
  // Interceptors are handled in app.config.ts
];

