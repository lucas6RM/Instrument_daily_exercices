import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./routine.component').then(m => m.RoutineComponent)
  }
];
