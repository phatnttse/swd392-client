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
  {
    path: 'cart',
    loadComponent() {
      return import('./components/cart/cart.component').then(
        (m) => m.CartComponent
      );
    },
  },
  {
    path: 'contact',
    loadComponent() {
      return import('./components/contact/contact.component').then(
        (m) => m.ContactComponent
      );
    },
  },
  {
    path: 'about-us',
    loadComponent() {
      return import('./components/about-us/about-us.component').then(
        (m) => m.AboutUsComponent
      );
    },
  },
  {
    path: 'blogs',
    loadComponent() {
      return import('./components/blog/blog.component').then(
        (m) => m.BlogComponent
      );
    },
  },
  {
    path: 'products',
    loadComponent() {
      return import('./components/products/products.component').then(
        (m) => m.ProductsComponent
      );
    },
  },
  {
    path: 'product-details/:id',
    loadComponent() {
      return import(
        './components/product-details/product-details.component'
      ).then((m) => m.ProductDetailsComponent);
    },
  },
  {
    path: 'order',
    loadComponent() {
      return import('./components/order/order.component').then(
        (m) => m.OrderComponent
      );
    },
  },
];
