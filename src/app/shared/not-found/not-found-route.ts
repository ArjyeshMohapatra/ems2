// src/app/shared/not-found/not-found.routes.ts
import { Routes } from '@angular/router';
import { NotFoundComponent } from './not-found.component';

export const NOT_FOUND_ROUTES: Routes = [
  {
    path: '',
    component: NotFoundComponent
  }
];