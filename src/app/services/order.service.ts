import { Injectable } from '@angular/core';
import { EndpointBase } from './endpoint-base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { AppConfigurationService } from './configuration.service';
import { BehaviorSubject, catchError, Observable } from 'rxjs';
import {
  Order,
  OrderByAccountResponse,
  OrderCountStatusResponse,
  OrderLineChart,
  OrderResponse,
  UpdateOrderStatusResponse,
} from '../models/order.model';

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
  ): Observable<Order> {
    return this.http
      .post<Order>(
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

  orderByCOD(
    buyerName: string,
    buyerAddress: string,
    buyerPhone: string,
    paymentMethod: string,
    note: string,
    orderDetails: any[]
  ): Observable<Order> {
    return this.http
      .post<Order>(
        `${this.API_URL}/orders/by-cod`,
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
            this.orderByCOD(
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

  getOrderById(orderId: string): Observable<OrderResponse> {
    return this.http
      .get<OrderResponse>(`${this.API_URL}/orders/${orderId}`, {
        headers: this.requestHeaders.headers,
      })
      .pipe(
        catchError((error) => {
          return this.handleError(error, () => this.getOrderById(orderId));
        })
      );
  }

  updateOrderStatus(
    orderDetailId: number,
    reason: string,
    status: string
  ): Observable<UpdateOrderStatusResponse> {
    return this.http
      .patch<UpdateOrderStatusResponse>(
        `${this.API_URL}/orders/update/${orderDetailId}`,
        { reason, status },
        this.requestHeaders
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () =>
            this.updateOrderStatus(orderDetailId, reason, status)
          );
        })
      );
  }

  getOrderReport(startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http
      .get<any>(`${this.API_URL}/orders/dashboard/report`, {
        params: params,
        headers: this.requestHeaders.headers,
      })
      .pipe(
        catchError((error) => {
          return this.handleError(error, () =>
            this.getOrderReport(startDate, endDate)
          );
        })
      );
  }

  getOrderLineChart(
    startDate: string,
    endDate: string
  ): Observable<OrderLineChart[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http
      .get<OrderLineChart[]>(`${this.API_URL}/orders/dashboard/line-chart`, {
        params: params,
        headers: this.requestHeaders.headers,
      })
      .pipe(
        catchError((error) => {
          return this.handleError(error, () =>
            this.getOrderLineChart(startDate, endDate)
          );
        })
      );
  }

  getOrderStatusCount(): Observable<OrderCountStatusResponse> {
    return this.http
      .get<OrderCountStatusResponse>(`${this.API_URL}/orders/count-status`, {
        headers: this.requestHeaders.headers,
      })
      .pipe(
        catchError((error) => {
          return this.handleError(error, () => this.getOrderStatusCount());
        })
      );
  }
}
