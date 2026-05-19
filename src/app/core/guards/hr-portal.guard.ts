import { inject } from '@angular/core';
import { LeaveService, NotificationService } from '../services';
import { Router } from '@angular/router'; 
import { catchError, map, of } from 'rxjs';

export const hrPortalGuard = () => {

  const leaveService = inject(LeaveService);
  const router = inject(Router);
  const notify = inject(NotificationService);

  return leaveService.getLeavesByStatus('PENDING').pipe(
    map(() => true),
    catchError((err) => {
      if (err.status === 403) {
        localStorage.setItem('hrPortalBlocked', 'true');
        notify.showWarning(
          'Permission denied',
          'You have to be an admin or HR in order to access this page.'
        );
        return of(router.parseUrl('/dashboard'));
      }

      return of(router.parseUrl('/login'));
    })
  );
};