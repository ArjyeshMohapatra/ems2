import { Routes } from '@angular/router';
import { EmpBasicDetailsComponent } from './emp-basic-details.component';
import { empBasicRegisDeactivateGuard } from '@core/guards';

export const EMP_BASIC_DETAILS_ROUTES: Routes = [
  {
    path: '',
    component: EmpBasicDetailsComponent,
    canDeactivate: [empBasicRegisDeactivateGuard]
  }
];