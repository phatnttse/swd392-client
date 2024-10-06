import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { AppConfigurationService } from '../../services/configuration.service';
import { UserAccount } from '../../models/account.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, MatIconModule, TranslateModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  account?: UserAccount | null; // Thông tin người dùng
  listLanguage: any = null; // Danh sách ngôn ngữ lấy từ config
  defaultLang: any = null; // Ngôn ngữ được chọn

  constructor(
    private authService: AuthService,
    private appConfig: AppConfigurationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.userData$.subscribe(
      (userData) => (this.account = userData)
    );
    this.listLanguage = this.appConfig['Config_Language'];
    this.defaultLang = this.listLanguage[0];
  }

  btnChangeLang(lang: any) {
    this.appConfig.setLanguageDefault(lang.id);
    this.defaultLang = lang;
  }

  btnLogOut() {
    this.authService.logout();
    this.authService.userDataSource.next(null);
    this.router.navigate(['/signin']);
  }
}
