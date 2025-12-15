import { Routes } from '@angular/router';
import { NotFoundPage } from './pages/404/404.page';
import { LoginPage } from './pages/login/login.page';
import { MainRoutes } from './main.routes';
import { MainApp } from './main-app/main-app';
import { AuthGuard } from '../ova-angular-sdk/middleware/auth.guard';

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
