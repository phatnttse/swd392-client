import { Injectable } from '@angular/core';
import { EndpointBase } from './endpoint-base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { AppConfigurationService } from './configuration.service';
import { catchError, Observable } from 'rxjs';
import {
  AddBalanceResponse,
  SellerProfileResponse,
  UserAccount,
  UserAccountPaginatedResponse,
  UserAccountResponse,
  UserBalanceResponse,
} from '../models/account.model';
import { Role } from '../models/enums';

@Injectable({
  providedIn: 'root',
})
export class AccountService extends EndpointBase {
  API_URL: string = '';
  localStorage?: Storage;

  constructor(
    http: HttpClient,
    authService: AuthService,
    private appConfig: AppConfigurationService
  ) {
    super(http, authService);
    this.API_URL = appConfig['API_URL'];
  }

  getAccountBalance(): Observable<UserBalanceResponse> {
    return this.http
      .get<UserBalanceResponse>(
        `${this.API_URL}/account/balance`,
        this.requestHeaders
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () => this.getAccountBalance());
        })
      );
  }

  addBalance(amount: number): Observable<AddBalanceResponse> {
    return this.http
      .post<AddBalanceResponse>(
        `${this.API_URL}/account/add-balance`,
        { amount },
        this.requestHeaders
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () => this.addBalance(amount));
        })
      );
  }

  updateProfile(
    name: string,
    phone: string,
    gender: string
  ): Observable<UserAccountResponse> {
    return this.http
      .patch<UserAccountResponse>(
        `${this.API_URL}/account/update-profile`,
        { name, phone, gender },
        this.requestHeaders
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () =>
            this.updateProfile(name, phone, gender)
          );
        })
      );
  }

  uploadAvatar(file: File): Observable<UserAccountResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .post<UserAccountResponse>(
        `${this.API_URL}/account/upload-avatar`,
        formData,
        this.requestHeaders
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () => this.uploadAvatar(file));
        })
      );
  }

  changePassword(
    oldPassword: string,
    newPassword: string,
    repeatPassword: string
  ): Observable<any> {
    return this.http
      .post<any>(
        `${this.API_URL}/auth/change-password`,
        { oldPassword, newPassword, repeatPassword },
        this.requestHeaders
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () =>
            this.changePassword(oldPassword, newPassword, repeatPassword)
          );
        })
      );
  }

  changeEmail(email: string): Observable<UserAccountResponse> {
    return this.http
      .post<UserAccountResponse>(
        `${this.API_URL}/auth/change-email`,
        { email },
        this.requestHeaders
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () => this.changeEmail(email));
        })
      );
  }

  confirmChangeEmail(otp: string): Observable<UserAccountResponse> {
    return this.http
      .post<UserAccountResponse>(
        `${this.API_URL}/auth/confirm-change-email/${otp}`,
        {},
        this.requestHeaders
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () => this.confirmChangeEmail(otp));
        })
      );
  }

  getUsers(
    searchString: string,
    order: string,
    sortBy: string,
    pageNumber: number,
    pageSize: number,
    roleName: Role[]
  ): Observable<UserAccountPaginatedResponse> {
    const params = new HttpParams()
      .set('searchString', searchString)
      .set('order', order)
      .set('sortBy', sortBy)
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('roleName', roleName.join(',') ?? []);

    return this.http
      .get<UserAccountPaginatedResponse>(
        `${this.API_URL}/account/profile/all`,
        {
          params: params,
          headers: this.requestHeaders.headers,
        }
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () =>
            this.getUsers(
              searchString,
              order,
              sortBy,
              pageNumber,
              pageSize,
              roleName
            )
          );
        })
      );
  }

  getSellerProfile(id: number): Observable<SellerProfileResponse> {
    return this.http
      .get<SellerProfileResponse>(
        `${this.API_URL}/account/profile/${id}`,
        this.requestHeaders
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () => this.getSellerProfile(id));
        })
      );
  }

  updateStatusUser(status: string): Observable<UserAccountResponse> { 
    return this.http.patch<UserAccountResponse>(
      `${this.API_URL}/account/update-status-user`, 
     
      {status}
    ,
      this.requestHeaders
    ).pipe(
      catchError((error) => {
        return this.handleError(error, () => this.updateStatusUser(status));
      })
    );
  }
}
