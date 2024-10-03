import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent() {
      return import('./components/home/home.component').then(
        (m) => m.HomeComponent
      );
    },
  },
  {
    path: 'signin',
    loadComponent() {
      return import('./components/sign-in/sign-in.component').then(
        (m) => m.SignInComponent
      );
    },
  },
  {
    path: 'signup',
    loadComponent() {
      return import('./components/sign-up/sign-up.component').then(
        (m) => m.SignUpComponent
      );
    },
  },
];
