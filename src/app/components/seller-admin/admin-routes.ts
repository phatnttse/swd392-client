import { Routes } from '@angular/router';
import { AdminGuard } from '../../guards/guards/admin.guard';

export const AdminRoutes: Routes = [
  {
    path: 'admin',
    loadComponent() {
      return import('./../seller-admin/seller-admin.component').then(
        (m) => m.SellerAdminComponent
      );
    },
    canActivate: [AdminGuard],
    canActivateChild: [AdminGuard],
    children: [],
  },
];
