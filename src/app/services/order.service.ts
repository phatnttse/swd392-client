import { Injectable } from '@angular/core';
import { EndpointBase } from './endpoint-base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { AppConfigurationService } from './configuration.service';
import { BehaviorSubject, catchError, Observable } from 'rxjs';
import { OrderByAccountResponse, OrderResponse } from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService extends EndpointBase {
  API_URL: string = '';

  // Trạng thái của order
  public orderBySellerDataSource =
    new BehaviorSubject<OrderByAccountResponse | null>(null);
  orderBySeller$ = this.orderBySellerDataSource.asObservable();

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

  getOrdersByAccount(
    order: string,
    sortBy: string,
    pageNumber: number,
    pageSize: number,
    status: string
  ): Observable<OrderByAccountResponse> {
    let params = new HttpParams()
      .set('order', order)
      .set('sortBy', sortBy)
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('status', status ?? '');

    return this.http
      .get<OrderByAccountResponse>(`${this.API_URL}/orders/by-buyer`, {
        params: params,
        headers: this.requestHeaders.headers,
      })
      .pipe(
        catchError((error) => {
          return this.handleError(error, () =>
            this.getOrdersByAccount(order, sortBy, pageNumber, pageSize, status)
          );
        })
      );
  }

  getOrdersBySeller(
    searchString: string,
    order: string,
    sortBy: string,
    pageNumber: number,
    pageSize: number,
    status: string,
    startDate?: string, // Ngày bắt đầu (yyyy-mm-dd)
    endDate?: string // Ngày kết thúc (yyyy-mm-dd)
  ): Observable<OrderByAccountResponse> {
    let params = new HttpParams()
      .set('search', searchString)
      .set('order', order)
      .set('sortBy', sortBy)
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('status', status ?? '');

    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http
      .get<OrderByAccountResponse>(`${this.API_URL}/orders/by-seller`, {
        params: params,
        headers: this.requestHeaders.headers,
      })
      .pipe(
        catchError((error) => {
          return this.handleError(error, () =>
            this.getOrdersBySeller(
              searchString,
              order,
              sortBy,
              pageNumber,
              pageSize,
              status,
              startDate,
              endDate
            )
          );
        })
      );
  }
}
