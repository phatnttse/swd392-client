import { Injectable } from '@angular/core';
import { EndpointBase } from './endpoint-base.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { AppConfigurationService } from './configuration.service';
import { catchError, Observable } from 'rxjs';
import {
  AddBalanceResponse,
  UserAccountResponse,
  UserBalanceResponse,
} from '../models/account.model';

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
          debugger;
          return this.handleError(error, () => this.confirmChangeEmail(otp));
        })
      );
  }
}
