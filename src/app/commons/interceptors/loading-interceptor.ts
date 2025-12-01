import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { Spinner as SpinnerService } from '../../services/spinner';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const spinnerService = inject(SpinnerService);
    spinnerService.show();

    return next(req).pipe(
        finalize(() => spinnerService.hide())
    );
};
