import { Routes } from '@angular/router';

import { NotFoundPage } from './pages/404/404.page';

import { LoginPage } from './pages/login/login.page';
import { AuthGuard } from '../services/ova-backend-service/middleware/auth.guard';

import { MainRoutes } from './main.routes';
import { MainApp } from './main-app/main-app';

export const routes: Routes = [
  {
    path: '',
    component: MainApp,
    children: [...MainRoutes],
    canActivate: [AuthGuard],
  },

  // Public routes outside the layout shell
  {
    path: 'login',
    component: LoginPage,
  },
  {
    path: '**',
    component: NotFoundPage,
  },
];
