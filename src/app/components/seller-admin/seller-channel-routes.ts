import { Routes } from '@angular/router';

export const SellerChannelRoutes: Routes = [
  {
    path: 'seller-channel',
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
            './../seller-admin/seller/seller-product-management/seller-product-management.component'
          ).then((m) => m.SellerProductManagementComponent);
        },
      },
      {
        path: 'order-management',
        loadComponent() {
          return import(
            './../seller-admin/seller/seller-order-management/seller-order-management.component'
          ).then((m) => m.SellerOrderManagementComponent);
        },
      },
    ],
  },
];
