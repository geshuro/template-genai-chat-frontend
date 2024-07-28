import { Route } from '@angular/router';
import { NoAccessComponent } from '@pages/no-access/no-access.component';
import { AuthGuardService } from '@shared/services/security/auth-guard.service';

export const routes: Route[] = [
  {
    path: 'login',
    loadComponent: () =>
      import('./app/pages/login/login.component').then(x => x.LoginComponent),
  },
  { path: 'no-access', component: NoAccessComponent },
  {
    path: 'chat',
    loadComponent: () =>
      import('./app/pages/chat/chat.component').then(x => x.ChatComponent),
    canActivate: [AuthGuardService],
  },
  {
    path: 'management-menu',
    loadComponent: () =>
      import(
        './app/components/templates/layout-management/layout-management.component'
      ).then(x => x.LayoutManagementComponent),
    children: [
      {
        path: 'list',
        loadComponent: () =>
          import(
            './app/components/organisms/list-menu-management/list-menu-management.component'
          ).then(x => x.ListMenuManagementComponent),
      },
      {
        path: 'golden-set',
        loadComponent: () =>
          import(
            './app/components/templates/golden-set-management/golden-set-management.component'
          ).then(x => x.GoldenSetManagementComponent),
      },
      {
        path: 'continuous-review',
        loadComponent: () =>
          import(
            './app/components/templates/continuous-review-management/continuous-review-management.component'
          ).then(x => x.ContinuousReviewManagementComponent),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'list',
      },
      {
        path: '**',
        pathMatch: 'full',
        redirectTo: 'list',
      },
    ],
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'chat',
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'chat',
  },
];
