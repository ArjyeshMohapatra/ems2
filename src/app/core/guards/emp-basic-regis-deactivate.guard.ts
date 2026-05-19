import { inject } from '@angular/core';
import { CheckRegistrationService } from '@core/services';

export const empBasicRegisDeactivateGuard = () => {

  const crs = inject(CheckRegistrationService);
  return crs.checkRegistrationStatus();
};