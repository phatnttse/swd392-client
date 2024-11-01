import { Injectable } from '@angular/core';
import { EndpointBase } from './endpoint-base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { BehaviorSubject, catchError, Observable } from 'rxjs';
import { AppConfigurationService } from './configuration.service';
import { Flower, FlowerPaginated } from '../models/flower.model';
import { FlowerCategory } from '../models/category.model';
import { Feedback } from '../models/feedback.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService extends EndpointBase {
  API_URL: string = '';

  // Trạng thái của danh sách hoa mới nhất
  public flowerNewestDataSource = new BehaviorSubject<FlowerPaginated | null>(
    null
  );
  flowerNewestData$ = this.flowerNewestDataSource.asObservable();

  // Trạng thái của danh sách hoa đã phân trang
  public flowerPaginatedDataSource =
    new BehaviorSubject<FlowerPaginated | null>(null);
  flowerPaginatedData$ = this.flowerPaginatedDataSource.asObservable();

  // Trạng thái của hoa theo user
  public flowerByUserDataSource = new BehaviorSubject<Flower[]>([]);
  flowerByUserData$ = this.flowerByUserDataSource.asObservable();

  constructor(
    http: HttpClient,
    authService: AuthService,
    private appConfig: AppConfigurationService
  ) {
    super(http, authService);
    this.API_URL = appConfig['API_URL'];
  }

  reset(): void {
    this.flowerByUserDataSource.next([]);
  }

  getFlowers(
    searchString: string,
    order: string,
    sortBy: string,
    pageNumber: number,
    pageSize: number,
    categoryIds: number[]
  ): Observable<FlowerPaginated> {
    const params = new HttpParams()
      .set('searchString', searchString)
      .set('order', order)
      .set('sortBy', sortBy)
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('categoryIds', categoryIds.join(',') ?? []);

    return this.http
      .get<FlowerPaginated>(`${this.API_URL}/flowers`, {
        params,
      })
      .pipe(
        catchError((error) => {
          return this.handleError(error, () =>
            this.getFlowers(
              searchString,
              order,
              sortBy,
              pageNumber,
              pageSize,
              categoryIds
            )
          );
        })
      );
  }

  getFlowerById(id: number): Observable<Flower> {
    return this.http.get<Flower>(`${this.API_URL}/flowers/${id}`).pipe(
      catchError((error) => {
        return this.handleError(error, () => this.getFlowerById(id));
      })
    );
  }

  createFlower(formData: FormData): Observable<Flower> {
    return this.http
      .post<Flower>(`${this.API_URL}/flowers`, formData, this.requestHeaders)
      .pipe(
        catchError((error) => {
          return this.handleError(error, () => this.createFlower(formData));
        })
      );
  }

  updateFlower(flowerId: number, formData: FormData): Observable<Flower> {
    return this.http
      .put<Flower>(
        `${this.API_URL}/flowers/${flowerId}`,
        formData,
        this.requestHeaders
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () =>
            this.updateFlower(flowerId, formData)
          );
        })
      );
  }

  getFlowersByUserId(userId: number): Observable<Flower[]> {
    return this.http
      .get<Flower[]>(
        `${this.API_URL}/flowers/user/${userId}`,
        this.requestHeaders
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () => this.getFlowersByUserId(userId));
        })
      );
  }

  approveFlowerListing(id: number | undefined): Observable<Flower> {
    return this.http.put<Flower>(
      `${this.API_URL}/admin/flower-listings/approve/${id}`,
      {},
      this.requestHeaders
    );
  }

  getFlowerCategory() {
    return this.http.get<FlowerCategory>(
      `${this.API_URL}/flowers-categories`,
      this.requestHeaders
    );
  }

  getFeedbacksByFlowerId(flowerId: number): Observable<Feedback[]> {
    return this.http
      .get<Feedback[]>(`${this.API_URL}/feedbacks/flower/${flowerId}`)
      .pipe(
        catchError((error) => {
          return this.handleError(error, () =>
            this.getFeedbacksByFlowerId(flowerId)
          );
        })
      );
  }

  rejectFlowerListing(
    id: number | undefined,
    reason: string
  ): Observable<Flower> {
    return this.http
      .put<Flower>(
        `${this.API_URL}/admin/flower-listings/reject/${id}`,
        { reason },
        this.requestHeaders
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () =>
            this.rejectFlowerListing(id, reason)
          );
        })
      );
  }

  createFeedback(
    flowerId: number,
    description: string,
    rating: number
  ): Observable<Feedback> {
    return this.http
      .post<Feedback>(
        `${this.API_URL}/feedbacks`,
        { flowerId, description, rating },
        this.requestHeaders
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () =>
            this.createFeedback(flowerId, description, rating)
          );
        })
      );
  }

  getFeedbacksBySellerId(sellerId: number): Observable<Feedback[]> {
    return this.http
      .get<Feedback[]>(`${this.API_URL}/feedbacks/sellers/${sellerId}`)
      .pipe(
        catchError((error) => {
          return this.handleError(error, () =>
            this.getFeedbacksBySellerId(sellerId)
          );
        })
      );
  }

  deleteFeedback(feedbackId: number): Observable<any> {
    return this.http
      .delete<any>(`${this.API_URL}/feedbacks/${feedbackId}`)
      .pipe(
        catchError((error) => {
          return this.handleError(error, () => this.deleteFeedback(feedbackId));
        })
      );
  }

  restoreFeedback(feedbackId: number): Observable<any> {
    return this.http
      .put<any>(`${this.API_URL}/feedbacks/${feedbackId}/restore`, {})
      .pipe(
        catchError((error) => {
          return this.handleError(error, () =>
            this.restoreFeedback(feedbackId)
          );
        })
      );
  }
}
