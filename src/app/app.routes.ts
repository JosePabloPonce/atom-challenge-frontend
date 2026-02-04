import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login-page/login-page.component').then(
        (m) => m.LoginPageComponent,
      ),
  },

  {
    path: 'tasks',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./features/tasks/tasks-page/tasks-page.component').then(
        (m) => m.TasksPageComponent,
      ),
  },

  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
