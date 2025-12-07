import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Account as AccountService } from '../../services/account';
import { Router } from '@angular/router';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const router = inject(Router);

  return accountService.currentSesion$.pipe(
    map(user => {
      if (user) return true;
      else {
        return router.parseUrl('/login');
      }
    })
  )
};
