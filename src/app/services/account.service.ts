import { Injectable } from '@angular/core';
import { EndpointBase } from './endpoint-base.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { AppConfigurationService } from './configuration.service';
import { catchError, Observable, of } from 'rxjs';
import {
  AddBalanceResponse,
  UserAccount,
  UserBalanceResponse,
} from '../models/account.model';
import { User } from '../models/flower.model';

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
        amount,
        this.requestHeaders
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () => this.addBalance(amount));
        })
      );
  }

  getUserResponseFromLocalStorage(): Observable<UserAccount | null> {
    try {
      const userJSON = this.localStorage?.getItem('current_user');
      if (userJSON == null || userJSON == undefined) {
        return of(null);
      }

      const userResponse = JSON.parse(userJSON!);
      return of(userResponse);
    } catch (error) {
      console.error('Error retrieving user response from local storage:', error);
      return of(null);
    }
  }

  resetPassword(newPassword: string, repeatPassword: string): Observable<any>{
    const payload = {
      newPassword: newPassword,
      repeatPassword: repeatPassword
  };
    return this.http.post<any>(`${this.API_URL}/auth/reset-password`, payload, this.requestHeaders);
  }
}
