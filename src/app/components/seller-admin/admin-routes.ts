import { Routes } from '@angular/router';

export const AdminRoutes: Routes = [
  {
    path: 'admin',
    loadComponent() {
      return import('./../seller-admin/seller-admin.component').then(
        (m) => m.SellerAdminComponent
      );
    },
    children: [],
  },
];
