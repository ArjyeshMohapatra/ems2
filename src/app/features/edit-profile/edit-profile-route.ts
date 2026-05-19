import { Routes } from '@angular/router';
import { EditProfileComponent } from './edit-profile.component';
import { editProfileDeactivateGuard } from '@core/guards';

export const EDIT_PROFILE_ROUTES: Routes = [
  {
    path: '',
    component: EditProfileComponent,
    canDeactivate: [editProfileDeactivateGuard]
  }
];