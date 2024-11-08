import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {
  APP_INITIALIZER,
  ApplicationConfig,
  importProvidersFrom,
  Injector,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, RouterModule } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideToastr } from 'ngx-toastr';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { HttpClient, provideHttpClient, withFetch } from '@angular/common/http';
import { AppConfigurationService } from './services/configuration.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { SellerChannelRoutes } from './components/seller-admin/seller-channel-routes';
import { AdminRoutes } from './components/seller-admin/admin-routes';
import { provideNativeDateAdapter } from '@angular/material/core';

// Hàm khởi tạo ứng dụng
const appInitializerFn = (appConfigService: AppConfigurationService) => {
  return () => appConfigService.loadConfig();
};

// Hàm cung cấp cấu hình dịch
export const provideTranslation = () => ({
  defaultLanguage: AppConfigurationService.Default_Language,
  loader: {
    provide: TranslateLoader,
    useFactory: HttpLoaderFactory,
    deps: [HttpClient],
  },
});

// function loader language
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(RouterModule.forChild(SellerChannelRoutes)),
    importProvidersFrom(RouterModule.forChild(AdminRoutes)),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    provideToastr(),
    provideNativeDateAdapter(),

    // Cấu hình Firebase
    provideFirebaseApp((injector: Injector) => {
      const appConfigService = injector.get(AppConfigurationService);
      return initializeApp({
        ...appConfigService.getConfig('firebaseConfig'),
      });
    }),
    provideAuth(() => getAuth()),

    // Cấu hình APP_INITIALIZER để tải hàm khởi tạo
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFn,
      deps: [AppConfigurationService],
      multi: true, // Đảm bảo cho phép nhiều hàm APP_INITIALIZER
    },

    // Cấu hình dịch
    importProvidersFrom([TranslateModule.forRoot(provideTranslation())]),
  ],
};
