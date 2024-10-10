import { Injectable } from '@angular/core';
import { EndpointBase } from './endpoint-base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { BehaviorSubject, catchError, Observable } from 'rxjs';
import { AppConfigurationService } from './configuration.service';
import { Flower, FlowerPaginated } from '../models/flower.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService extends EndpointBase {
  API_URL: string = '';

  // Trạng thái của danh sách hoa mới nhất
  public flowerNewestDataSource = new BehaviorSubject<Flower[] | null>(null);
  flowerNewestData$ = this.flowerNewestDataSource.asObservable();

  public flowerPaginatedDataSource = new BehaviorSubject<Flower[] | null>(null);
  flowerPaginatedData$ = this.flowerPaginatedDataSource.asObservable();

  constructor(
    http: HttpClient,
    authService: AuthService,
    private appConfig: AppConfigurationService
  ) {
    super(http, authService);
    this.API_URL = appConfig['API_URL'];
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
      .get<FlowerPaginated>(`${this.API_URL}/flowers`, { params })
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

  addFlower(flower: Flower): Observable<Flower> {
    return this.http
      .post<Flower>(`${this.API_URL}/flowers`, flower, this.requestHeaders)
      .pipe(
        catchError((error) => {
          return this.handleError(error, () => this.addFlower(flower));
        })
      );
  }

  updateFlower(flower: Flower): Observable<Flower> {
    return this.http
      .put<Flower>(`${this.API_URL}/flowers`, flower, this.requestHeaders)
      .pipe(
        catchError((error) => {
          return this.handleError(error, () => this.updateFlower(flower));
        })
      );
  }
}
