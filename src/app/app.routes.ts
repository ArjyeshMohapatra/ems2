import { Routes } from '@angular/router';

import { LoginComponent, SIGNUP_ROUTES, FORGOT_PASSWORD_ROUTES } from '@auth';
import { ATTENDANCE_ROUTES, EDIT_PROFILE_ROUTES, EMPLOYEES_DETAILS_ROUTES, HR_PORTAL_ROUTES, LEAVE_MGMT_ROUTES } from '@features';
import { DASHBOARD_ROUTES } from './layout/dashboard/dashboard-route'; // No alias for layout yet
import { EMP_BASIC_DETAILS_ROUTES } from './layout/emp-basic-details/emp-basic-details-route';
import { NOT_FOUND_ROUTES } from '@shared';
import { EventVisualizerComponent } from '@shared/ui/event-visualizer/event-visualizer';

import { guestGuard, authGuard, registrationGuard, hrPortalGuard } from '@core/guards';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
        component: LoginComponent,
    canActivate: [guestGuard]
  },
  {
    path: 'signup',
    loadChildren: () =>
      import('./auth/signup/signup-route')
      .then(m => m.SIGNUP_ROUTES),
    canActivate: [guestGuard]
  },
  {
    path: 'forgot-password',
    loadChildren: () =>
      import('./auth/forgot-password/forgot-password-route')
      .then(m => m.FORGOT_PASSWORD_ROUTES),
    canActivate: [guestGuard]
  },
  {
    path: 'attendance-mgmt',
    loadChildren: () =>
      import('./features/attendance-mgmt/attendance-mgmt-route')
        .then(m => m.ATTENDANCE_ROUTES),
    canActivate: [authGuard, registrationGuard]
  },
  {
    path: 'edit-profile',
    loadChildren: () =>
      import('./features/edit-profile/edit-profile-route')
        .then(m => m.EDIT_PROFILE_ROUTES),
    canActivate: [authGuard, registrationGuard]
  },
  {
    path:'employees-details',
    loadChildren: () =>
      import('./features/employees-details/employees-details-route')
        .then(m => m.EMPLOYEES_DETAILS_ROUTES),
    canActivate: [authGuard, registrationGuard]
  },
  {
    path: 'hr-portal',
    loadChildren: () =>
      import('./features/hr-portal/hr-portal-route')
        .then(m => m.HR_PORTAL_ROUTES),
    canActivate: [authGuard, registrationGuard, hrPortalGuard]  
  },
  {
    path: 'leave-mgmt',
    loadChildren: () =>
      import('./features/leave-mgmt/leave-mgmt-route')
        .then(m => m.LEAVE_MGMT_ROUTES),
    canActivate: [authGuard, registrationGuard]
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./layout/dashboard/dashboard-route')
        .then(m => m.DASHBOARD_ROUTES),
    canActivate: [authGuard, registrationGuard]
  },
  {
    path: 'emp-basic-regis',
    loadChildren: () =>
      import('./layout/emp-basic-details/emp-basic-details-route')
        .then(m => m.EMP_BASIC_DETAILS_ROUTES),
    canActivate: [authGuard, registrationGuard]
  },
  {
    path: 'debug/events',
    component: EventVisualizerComponent

  },
  {
    path: '**',
    loadChildren: () =>
      import('./shared/not-found/not-found-route')
        .then(m => m.NOT_FOUND_ROUTES)
  },

];
