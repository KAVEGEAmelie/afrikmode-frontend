import { HttpInterceptorFn } from '@angular/common/http';

export const headersInterceptor: HttpInterceptorFn = (req, next) => {
  // Headers communs pour toutes les requêtes
  const commonHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Language': localStorage.getItem('language') || 'fr',
    'X-Currency': localStorage.getItem('currency') || 'XOF',
    'X-Client-Version': '1.0.0',
    'X-Platform': 'web'
  };

  // Cloner la requête avec les nouveaux headers
  const modifiedReq = req.clone({
    setHeaders: commonHeaders
  });

  return next(modifiedReq);
};