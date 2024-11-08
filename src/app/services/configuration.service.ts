import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class AppConfigurationService {
  private config: any;
  private API_URL: string = '';
  private NOTIFICATION_URL: string = '';
  private INTEGRATION_URL: string = '';
  private WEBSOCKET_URL: string = '';
  private Config_Language: any = []; // Cấu hình ngôn ngữ
  public static readonly Default_Language: string = 'vi'; // Ngôn ngữ mặc định
  private firebaseConfig: any; // Cấu hình firebase

  constructor(private http: HttpClient, private translate: TranslateService) {}

  // Hàm tải cấu hình từ file config.json
  loadConfig(): Promise<void> {
    return this.http
      .get('/assets/config.json')
      .toPromise()
      .then((config) => {
        this.config = config;
        this.API_URL = this.config.API_URL;
        this.NOTIFICATION_URL = this.config.NOTIFICATION_URL;
        this.INTEGRATION_URL = this.config.INTEGRATION_URL;
        this.WEBSOCKET_URL = this.config.WEBSOCKET_URL;
        this.Config_Language = this.config.Config_Language;
        this.firebaseConfig = this.config.firebaseConfig;
      })
      .catch((error: any) => {
        console.error('Error loading configuration file', error);
      });
  }

  getConfig(key: string): any {
    return this.config ? this.config[key] : null;
  }

  getFirebaseConfig(): any {
    return this.firebaseConfig;
  }

  // Hàm thiết lập ngôn ngữ mặc định
  private valueLangSource = new BehaviorSubject<any>(null);
  valueLang$ = this.valueLangSource.asObservable();
  setLanguageDefault(langID: any) {
    let config = this.Config_Language.find(
      (fig: any) => fig.isActive && fig.id == langID
    );

    if (!config) {
      config = this.Config_Language[0];
      langID = config.id;
    }

    // Lấy file ngôn ngữ từ assets và tránh cache bằng cách thêm timestamp
    this.http
      .get(`/assets/i18n/${config?.value || 'vi'}.json?` + String(Date.now()))
      .subscribe(
        (translations: any) => {
          this.translate.setTranslation(config?.value || 'vi', translations);
          this.translate.use(config?.value || 'vi');
          this.valueLangSource.next(config);
        },
        (error: any) => {
          console.error('Could not load translations', error);
        }
      );
  }
}
