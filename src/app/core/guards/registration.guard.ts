import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { CheckRegistrationService } from '@core/services';
import { map } from 'rxjs';

export const registrationGuard = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {

  const router = inject(Router);
  const crs = inject(CheckRegistrationService);

  return crs.checkRegistrationStatus().pipe(

    map(isRegistered => {
      const isRegisPath = state.url === '/emp-basic-regis';

      if (isRegistered) return isRegisPath ? router.parseUrl('/dashboard') : true;
      return isRegisPath ? true : router.parseUrl('/emp-basic-regis');
    })
  );
};