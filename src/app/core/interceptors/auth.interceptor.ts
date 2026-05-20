import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { catchError, throwError, tap } from 'rxjs';
import { EventLoggerService } from '@core/services/event-logger';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(EventLoggerService);
  const correlationId = crypto?.randomUUID?.() || Math.random().toString(36).substring(2);
  const isLeavePolling = req.url.includes('leaveservice?status=PENDING') || req.url.includes('leaveservice');

  if (!isLeavePolling) {
    logger.log('AuthInterceptor', 'HTTP_REQUEST_STARTED', { url: req.url, id: correlationId });
  }
  const token = localStorage.getItem('authToken');

  const authReq = token ? req.clone({
    setHeaders: {
      Authorization: token.startsWith('Bearer ') ? token : 'Bearer ' + token
    }
  }) : req;

  return next(authReq).pipe(
    tap(event => {
      if (event instanceof HttpResponse && !isLeavePolling) {
        logger.log('AuthInterceptor', 'HTTP_RESPONSE_RECEIVED', { id: correlationId });
      }
    }),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        localStorage.removeItem('authToken');
      }
      if (!isLeavePolling) {
        logger.log('AuthInterceptor', 'HTTP_ERROR', { url: req.url, id: correlationId, error: error.status });
      }
      return throwError(() => error);
    })
  );
};
