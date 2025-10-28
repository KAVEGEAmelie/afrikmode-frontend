import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { errorInterceptor } from '../interceptors/error.interceptor';
import { headersInterceptor } from '../interceptors/headers.interceptor';

export const appHttpInterceptors = [
  headersInterceptor,  // En premier pour ajouter les headers
  authInterceptor,     // Ensuite pour ajouter le token
  errorInterceptor     // En dernier pour gérer les erreurs
];

