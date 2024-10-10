import { Injectable } from '@angular/core';
import { EndpointBase } from './endpoint-base.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { AppConfigurationService } from './configuration.service';
import { BehaviorSubject, catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderService extends EndpointBase {
  API_URL: string = '';

  // Trạng thái của order
  public orderDataSource = new BehaviorSubject<any>(null);
  orderData$ = this.orderDataSource.asObservable();

  constructor(
    http: HttpClient,
    authService: AuthService,
    private appConfig: AppConfigurationService
  ) {
    super(http, authService);
    this.API_URL = appConfig['API_URL'];
  }

  orderByWallet(
    buyerName: string,
    buyerAddress: string,
    buyerPhone: string,
    paymentMethod: string,
    note: string,
    orderDetails: any[]
  ): Observable<any> {
    return this.http
      .post<any>(
        `${this.API_URL}/orders/by-wallet`,
        {
          buyerName,
          buyerAddress,
          buyerPhone,
          paymentMethod,
          note,
          orderDetails,
        },
        this.requestHeaders
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () =>
            this.orderByWallet(
              buyerName,
              buyerAddress,
              buyerPhone,
              paymentMethod,
              note,
              orderDetails
            )
          );
        })
      );
  }
}
