import { Routes } from '@angular/router';
import { UserGuard } from './guards/user.guard';

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
  {
    path: 'cart',
    loadComponent() {
      return import('./components/cart/cart.component').then(
        (m) => m.CartComponent
      );
    },
    data: { breadcrumb: 'BreadCrumb.Cart' },
    canActivate: [UserGuard],
  },
  {
    path: 'contact',
    loadComponent() {
      return import('./components/contact/contact.component').then(
        (m) => m.ContactComponent
      );
    },
    data: { breadcrumb: 'BreadCrumb.Contact' },
  },
  {
    path: 'about-us',
    loadComponent() {
      return import('./components/about-us/about-us.component').then(
        (m) => m.AboutUsComponent
      );
    },
    data: { breadcrumb: 'BreadCrumb.AboutUs' },
  },
  {
    path: 'blogs',
    loadComponent() {
      return import('./components/blog/blog.component').then(
        (m) => m.BlogComponent
      );
    },
    data: { breadcrumb: 'BreadCrumb.Blog' },
  },
  {
    path: 'products',
    loadComponent() {
      return import('./components/products/products.component').then(
        (m) => m.ProductsComponent
      );
    },
    data: { breadcrumb: 'BreadCrumb.Product' },
  },
  {
    path: 'product-details/:id',
    loadComponent() {
      return import(
        './components/product-details/product-details.component'
      ).then((m) => m.ProductDetailsComponent);
    },
    data: { breadcrumb: 'BreadCrumb.ProductDetail' },
  },
  {
    path: 'order',
    loadComponent() {
      return import('./components/order/order.component').then(
        (m) => m.OrderComponent
      );
    },
    data: { breadcrumb: 'BreadCrumb.Order' },
    canActivate: [UserGuard],
  },
  {
    path: 'wallet',
    loadComponent() {
      return import('./components/wallet/wallet.component').then(
        (m) => m.WalletComponent
      );
    },
    data: { breadcrumb: 'BreadCrumb.Wallet' },
    canActivate: [UserGuard],
  },
  {
    path: 'order-history',
    loadComponent() {
      return import('./components/order-history/order-history.component').then(
        (m) => m.OrderHistoryComponent
      );
    },
    data: { breadcrumb: 'BreadCrumb.OrderHistory' },
    canActivate: [UserGuard],
  },
  {
    path: 'forgot-password',
    loadComponent() {
      return import(
        './components/forgot-password/forgot-password.component'
      ).then((m) => m.ForgotPasswordComponent);
    },
  },
  {
    path: 'reset-password',
    loadComponent() {
      return import(
        './components/reset-password/reset-password.component'
      ).then((m) => m.ResetPasswordComponent);
    },
  },
  {
    path: 'profile',
    loadComponent() {
      return import('./components/profile/profile.component').then(
        (m) => m.ProfileComponent
      );
    },
    data: { breadcrumb: 'BreadCrumb.Profile' },
    canActivate: [UserGuard],
  },
  {
    path: 'seller-profile/:name',
    loadComponent() {
      return import(
        './components/seller-profile/seller-profile.component'
      ).then((m) => m.SellerProfileComponent);
    },
    data: { breadcrumb: 'BreadCrumb.SellerProfile' },
  },
];
