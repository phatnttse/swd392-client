import { Injectable } from '@angular/core';
import { EndpointBase } from './endpoint-base.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { AppConfigurationService } from './configuration.service';
import { catchError, Observable } from 'rxjs';
import {
  AddBalanceResponse,
  UserBalanceResponse,
} from '../models/account.model';

@Injectable({
  providedIn: 'root',
})
export class AccountService extends EndpointBase {
  API_URL: string = '';

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
}
