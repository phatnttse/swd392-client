import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {
  APP_INITIALIZER,
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideToastr } from 'ngx-toastr';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { FIRE_BASE } from './configurations/firebase.config';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { HttpClient, provideHttpClient, withFetch } from '@angular/common/http';
import { AppConfigurationService } from './services/configuration.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

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

// Hàm tải file ngôn ngữ
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    provideToastr(),

    // Cấu hình Firebase
    provideFirebaseApp(() =>
      initializeApp({
        ...FIRE_BASE.firebaseConfig,
      })
    ),
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
