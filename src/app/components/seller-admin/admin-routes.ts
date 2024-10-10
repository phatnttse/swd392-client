import { Routes } from '@angular/router';

export const AdminRoutes: Routes = [
  {
    path: 'admin',
    loadComponent() {
      return import('./../seller-admin/seller-admin.component').then(
        (m) => m.SellerAdminComponent
      );
    },
    children: [
      {
        path: 'product-management',
        loadComponent() {
          return import(
            '../seller-admin/product-management/product-management.component'
          ).then((m) => m.ProductManagementComponent);
        },
      },
    ],
  },
];
