import { Injectable } from '@angular/core';
import { LocalStoreManager } from './local-storage.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { DBkeys } from './db-keys';

@Injectable({
  providedIn: 'root',
})
export class AppConfigurationService {
  private config: any;
  private API_URL: string = '';
  private Config_Language: any = []; // Cấu hình ngôn ngữ
  constructor(
    private http: HttpClient,
    private translate: TranslateService,
    private localStorage: LocalStoreManager
  ) {}

  loadConfig(): Promise<void> {
    return this.http
      .get('/assets/config.json')
      .toPromise()
      .then((config) => {
        this.config = config;
        this.API_URL = this.config.API_URL;
      })
      .catch((error: any) => {
        console.error('Error loading configuration file', error);
      });
  }

  getConfig(key: string): any {
    return this.config ? this.config[key] : null;
  }

  // get ngôn ngữ từ localStorage | isAction: có hành động thay đổi
  // private langIDSource = new BehaviorSubject<any>(1);
  // langID$ = this.langIDSource.asObservable();

  private valueLangSource = new BehaviorSubject<any>(null);
  valueLang$ = this.valueLangSource.asObservable();
  setLanguageDefalt(langID: any) {
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

          this.localStorage.savePermanentData(langID, DBkeys.LANG_ID);
          this.valueLangSource.next(config);
        },
        (error: any) => {
          console.error('Could not load translations', error);
        }
      );
  }
}
