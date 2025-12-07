import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Account as AccountService } from '../../services/account';
import { AlertService } from '../../services/alert';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AccountService);
  const alertService = inject(AlertService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Token expirado o no autorizado
      if (error.status === 401 && router.url !== '/login') {
        authService.cerrarSesion();
        router.navigateByUrl('/login');
        alertService.info(
          'Aviso',
          'Su sesión ha caducado, ingrese nuevamente'
        );
      }

      return throwError(() => error);
    })
  );
};
