import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'tasks',
        loadChildren: () => import('./features/tasks/tasks.routes').then((m) => m.TASKS_ROUTES),
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./features/analytics/analytics-page.component').then(
            (m) => m.AnalyticsPageComponent,
          ),
      },
      {
        path: 'team',
        loadComponent: () =>
          import('./features/team/team-page.component').then((m) => m.TeamPageComponent),
      },
      {
        path: 'calendar',
        loadComponent: () =>
          import('./shared/components/coming-soon.component').then((m) => m.ComingSoonComponent),
        data: { title: 'Calendar' },
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./shared/components/coming-soon.component').then((m) => m.ComingSoonComponent),
        data: { title: 'Settings' },
      },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];
