import { Injectable } from '@angular/core';

import {
  Auth,
  signInWithPopup,
  GoogleAuthProvider,
  User,
} from '@angular/fire/auth'; // Cập nhật import
import { NavigationExtras, Router } from '@angular/router';
import { LocalStoreManager } from './local-storage.service';
import { AppConfigurationService } from './configuration.service';
import { DBkeys } from './db-keys';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  API_URL: string = '';
  loginUrl: string = '';
  private previousIsLoggedInCheck = false;
  private loginStatus = new Subject<boolean>();
  public reLoginDelegate: { (): void } | undefined;
  public loginRedirectUrl: string | null = null;

  constructor(
    private auth: Auth,
    private router: Router,
    private localStorage: LocalStoreManager,
    private appConfig: AppConfigurationService,
    private http: HttpClient,
    private toastr: ToastrService
  ) {
    this.API_URL = appConfig['API_URL'];
    this.loginUrl = `${this.API_URL}/auth/login`;
    this.initializeLoginStatus();
  }

  private initializeLoginStatus() {
    this.localStorage.getInitEvent().subscribe(() => {
      this.reevaluateLoginStatus();
    });
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  gotoPage(page: string, preserveParams = true) {
    const navigationExtras: NavigationExtras = {
      queryParamsHandling: preserveParams ? 'merge' : '',
      preserveFragment: preserveParams,
    };

    this.router.navigate([page], navigationExtras);
  }

  loginWithPassword(email: string, password: string): Observable<any> {
    return this.http
      .post(`${this.API_URL}/auth/login`, { email, password })
      .pipe(map((response: any) => this.processLoginResponse(response)));
  }

  redirectForLogin() {
    this.loginRedirectUrl = this.router.url;
    this.router.navigate([this.loginUrl]);
  }

  reLogin() {
    if (this.reLoginDelegate) {
      this.reLoginDelegate();
    } else {
      this.redirectForLogin();
    }
  }

  refreshLogin() {
    return this.http
      .post(`${this.API_URL}/auth/refresh`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${DBkeys.REFRESH_TOKEN}`,
        }),
      })
      .pipe(map((response: any) => this.processLoginResponse(response)));
  }

  private processLoginResponse(response: any) {
    const accessToken = response.accessToken;
    const refreshToken = response.refreshToken;
    this.localStorage.savePermanentData(accessToken, DBkeys.ACCESS_TOKEN);
    this.localStorage.savePermanentData(refreshToken, DBkeys.REFRESH_TOKEN);

    const user: User = response;
    this.toastr.success(response.message);
    return user;
  }

  private reevaluateLoginStatus(currentUser?: User | null) {
    const user =
      currentUser ?? this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    const isLoggedIn = user != null;

    if (this.previousIsLoggedInCheck !== isLoggedIn) {
      setTimeout(() => {
        this.loginStatus.next(isLoggedIn);
      });
    }

    this.previousIsLoggedInCheck = isLoggedIn;
  }

  async logout() {
    this.localStorage.deleteData(DBkeys.ACCESS_TOKEN);
    this.localStorage.deleteData(DBkeys.REFRESH_TOKEN);
    this.localStorage.deleteData(DBkeys.TOKEN_EXPIRES_IN);
    this.localStorage.deleteData(DBkeys.CURRENT_USER);

    this.localStorage.clearAllStorage();

    this.reevaluateLoginStatus();
  }

  get currentUser(): User | null {
    const user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    this.reevaluateLoginStatus(user);

    return user;
  }

  get accessToken(): string | null {
    return this.localStorage.getData(DBkeys.ACCESS_TOKEN);
  }

  get accessTokenExpiryDate(): Date | null {
    return this.localStorage.getDataObject<Date>(DBkeys.TOKEN_EXPIRES_IN, true);
  }

  get refreshToken(): string | null {
    return this.localStorage.getData(DBkeys.REFRESH_TOKEN);
  }

  get isSessionExpired(): boolean {
    if (this.accessTokenExpiryDate == null) {
      return true;
    }

    return this.accessTokenExpiryDate.valueOf() <= new Date().valueOf();
  }
}
