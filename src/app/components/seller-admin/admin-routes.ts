import { AdminProductManagementComponent } from './admin/admin-product-management/admin-product-management.component';
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
        path:'product-management',
        loadComponent(){
          return import('./../seller-admin/admin/admin-product-management/admin-product-management.component').then(
            (m) => m.AdminProductManagementComponent
          );
        }
      },
      {
        path:'product-detail-management/:id',
        loadComponent(){
          return import('./../seller-admin/admin/admin-product-detail-management/admin-product-detail-management.component').then(
            (m) => m.AdminProductDetailManagementComponent
          );
        }
      },
      {
        path:'category-management',
        loadComponent(){
          return import('./../seller-admin/admin/admin-category-management/admin-category-management.component').then(
            (m) => m.AdminCategoryManagementComponent
          );
        }
      }
    ],
  },
];
