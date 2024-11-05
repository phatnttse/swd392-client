import { Injectable } from '@angular/core';
import { EndpointBase } from './endpoint-base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { AppConfigurationService } from './configuration.service';
import { catchError, Observable } from 'rxjs';
import { WalletLogResponse } from '../models/wallet.model';
import { PaymentDetails } from '../models/payment.model';

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

  getWalletLogsByAccount(
    order: string,
    sortBy: string,
    pageNumber: number,
    pageSize: number,
    status: string[],
    type: string,
    startDate?: string,
    endDate?: string
  ): Observable<WalletLogResponse> {
    let params = new HttpParams()
      .set('order', order)
      .set('sortBy', sortBy)
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('status', status.join(',') ?? [])
      .set('type', type);

    if (startDate) {
      params = params.set('startDate', startDate);
    }

    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http
      .get<WalletLogResponse>(`${this.API_URL}/wallet-logs/by-account`, {
        params: params,
        headers: this.requestHeaders.headers,
      })
      .pipe(
        catchError((error) => {
          return this.handleError(error, () =>
            this.getWalletLogsByAccount(
              order,
              sortBy,
              pageNumber,
              pageSize,
              status,
              type
            )
          );
        })
      );
  }

  getPaymentDetails(orderCode: string): Observable<PaymentDetails> {
    return this.http
      .get<PaymentDetails>(`${this.API_URL}/payments/${orderCode}`, {
        headers: this.requestHeaders.headers,
      })
      .pipe(
        catchError((error) => {
          return this.handleError(error, () =>
            this.getPaymentDetails(orderCode)
          );
        })
      );
  }
}
