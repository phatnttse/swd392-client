import { AdminProductManagementComponent } from './admin/admin-product-management/admin-product-management.component';
import { Routes } from '@angular/router';
import { AdminGuard } from '../../guards/admin.guard';

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
            './../seller-admin/admin/admin-product-management/admin-product-management.component'
          ).then((m) => m.AdminProductManagementComponent);
        },
      },
      {
        path: 'category-management',
        loadComponent() {
          return import(
            './../seller-admin/admin/admin-category-management/admin-category-management.component'
          ).then((m) => m.AdminCategoryManagementComponent);
        },
      },
      {
        path: 'user-management',
        loadComponent() {
          return import(
            './../seller-admin/admin/admin-user-management/admin-user-management.component'
          ).then((m) => m.AdminUserManagementComponent);
        },
      },
      {
        path: '',
        loadComponent() {
          return import(
            './../seller-admin/admin/admin-dashboard-management/admin-dashboard-management.component'
          ).then((m) => m.AdminDashboardManagementComponent);
        },
      }
    ],
    canActivate: [AdminGuard],
    canActivateChild: [AdminGuard],
  },
];
