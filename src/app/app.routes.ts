import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard'
  },
  {
    path: 'routine',
    loadComponent: () => import('./features/routine/routine.component').then(m => m.RoutineComponent),
    title: 'Routine'
  },
  {
    path: 'history',
    loadComponent: () => import('./features/history/history.component').then(m => m.HistoryComponent),
    title: 'Historique'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
