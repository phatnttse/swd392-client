import { Injectable } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';
import { NavigationExtras, Router } from '@angular/router';
import { LocalStoreManager } from './local-storage.service';
import { AppConfigurationService } from './configuration.service';
import { DBkeys } from './db-keys';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { BehaviorSubject, map, Observable, Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { UserAccount } from '../models/account.model';
import { Utilities } from './utilities';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  API_URL: string = '';
  private previousIsLoggedInCheck = false;
  private loginStatus = new Subject<boolean>();
  public reLoginDelegate:
    | {
        (): void;
      }
    | undefined;
  public loginRedirectUrl: string | null = null;

  // Trạng thái của thông tin user
  public userDataSource = new BehaviorSubject<any>(null);
  userData$ = this.userDataSource.asObservable();

  constructor(
    private auth: Auth,
    private router: Router,
    private localStorage: LocalStoreManager,
    private appConfig: AppConfigurationService,
    private http: HttpClient,
    private toastr: ToastrService
  ) {
    this.API_URL = appConfig['API_URL'];
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

  loginWithPassword(email: string, password: string): Observable<any> {
    return this.http
      .post(`${this.API_URL}/auth/login`, {
        email,
        password,
      })
      .pipe(map((response: any) => this.processLoginResponse(response)));
  }

  redirectLoginUser() {
    const redirect =
      this.loginRedirectUrl && this.loginRedirectUrl !== '/'
        ? this.loginRedirectUrl
        : '/';
    this.loginRedirectUrl = null;

    const urlParamsAndFragment = Utilities.splitInTwo(redirect, '#');
    const urlAndParams = Utilities.splitInTwo(
      urlParamsAndFragment.firstPart,
      '?'
    );

    const navigationExtras: NavigationExtras = {
      fragment: urlParamsAndFragment.secondPart,
      queryParams: urlAndParams.secondPart
        ? Utilities.getQueryParamsFromString(urlAndParams.secondPart)
        : null,
      queryParamsHandling: 'merge',
    };

    this.router.navigate([urlAndParams.firstPart], navigationExtras);
  }

  redirectForLogin() {
    this.loginRedirectUrl = this.router.url;
    this.router.navigate(['/login']);
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
      .post(`${this.API_URL}/auth/renew-access-token`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${DBkeys.REFRESH_TOKEN}`,
        }),
      })
      .pipe(map((response: any) => this.processLoginResponse(response)));
  }

  register(
    email: string,
    password: string,
    name: string,
    accountGender: string
  ) {
    return this.http
      .post(`${this.API_URL}/auth/register`, {
        email,
        password,
        name,
        accountGender,
      })
      .pipe(
        map((response: any) => this.processRegisterResponse(response)) // Xử lý phản hồi
      );
  }

  private processLoginResponse(response: any) {
    const accessToken = response.accessToken;
    const refreshToken = response.refreshToken;
    this.localStorage.savePermanentData(accessToken, DBkeys.ACCESS_TOKEN);
    this.localStorage.savePermanentData(refreshToken, DBkeys.REFRESH_TOKEN);
    this.http
      .get(`${this.API_URL}/account/profile`, {
        headers: new HttpHeaders({
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json, text/plain, */*',
        }),
      })
      .subscribe({
        next: (response: any) => {
          if (response.data) {
            const user = {
              ...response.data,
            };
            this.localStorage.savePermanentData(user, DBkeys.CURRENT_USER);
            this.userDataSource.next(user);
          }
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
        },
      });
    return response;
  }

  private processRegisterResponse(response: any) {
    const accessToken = response.accessToken;
    const refreshToken = response.refreshToken;

    // Lưu dữ liệu vào LocalStorage
    this.localStorage.savePermanentData(accessToken, DBkeys.ACCESS_TOKEN);
    this.localStorage.savePermanentData(refreshToken, DBkeys.REFRESH_TOKEN);

    // Thêm xử lý khác (nếu cần) như hiển thị thông báo đăng ký thành công
    this.toastr.success('Registration successful!');

    const user: UserAccount = response; // Chuyển phản hồi thành đối tượng người dùng
    return user;
  }

  private reevaluateLoginStatus(currentUser?: UserAccount | null) {
    const user =
      currentUser ??
      this.localStorage.getDataObject<UserAccount>(DBkeys.CURRENT_USER);
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

  gotoPage(page: string, preserveParams = true) {
    const navigationExtras: NavigationExtras = {
      queryParamsHandling: preserveParams ? 'merge' : '',
      preserveFragment: preserveParams,
    };

    this.router.navigate([page], navigationExtras);
  }

  get currentUser(): UserAccount | null {
    const user = this.localStorage.getDataObject<UserAccount>(
      DBkeys.CURRENT_USER
    );
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

  get isLoggedIn(): boolean {
    return this.currentUser != null;
  }
}
