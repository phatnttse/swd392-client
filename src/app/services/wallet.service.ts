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
import { WalletLogResponse } from '../models/wallet.model';

@Injectable({
  providedIn: 'root',
})
export class WalletService extends EndpointBase {
  API_URL: string = '';

  constructor(
    http: HttpClient,
    authService: AuthService,
    private appConfig: AppConfigurationService
  ) {
    super(http, authService);
    this.API_URL = appConfig['API_URL'];
  }

  getWalletLogsByAccount(): Observable<WalletLogResponse> {
    return this.http
      .get<WalletLogResponse>(
        `${this.API_URL}/wallet-logs/by-account`,
        this.requestHeaders
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () => this.getWalletLogsByAccount());
        })
      );
  }
}
