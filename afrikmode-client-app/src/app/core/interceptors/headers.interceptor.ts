import { HttpInterceptorFn } from '@angular/common/http';

export const headersInterceptor: HttpInterceptorFn = (req, next) => {
  // Vérifier si c'est un FormData (pour les uploads)
  const isFormData = req.body instanceof FormData;
  
  // Headers communs pour toutes les requêtes
  const commonHeaders: any = {
    'Accept': 'application/json',
    'Accept-Language': localStorage.getItem('language') || 'fr',
    'X-Currency': localStorage.getItem('currency') || 'XOF',
    'X-Client-Version': '1.0.0',
    'X-Platform': 'web'
  };

  // Ne pas définir Content-Type pour FormData (le navigateur le fait automatiquement avec le boundary)
  if (!isFormData) {
    commonHeaders['Content-Type'] = 'application/json';
  }

  // Cloner la requête avec les nouveaux headers
  const modifiedReq = req.clone({
    setHeaders: commonHeaders
  });

  return next(modifiedReq);
};