import { Injectable } from '@angular/core';
import { EndpointBase } from './endpoint-base.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { AppConfigurationService } from './configuration.service';
import { BehaviorSubject, catchError, Observable } from 'rxjs';
import { ConvertedCategory, FlowerCategory } from '../models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService extends EndpointBase {
  API_URL: string = '';

  // Trạng thái của category
  public categoryDataSource = new BehaviorSubject<FlowerCategory[]>([]);
  categoryData$ = this.categoryDataSource.asObservable();

  // Trạng thái của category đã convert
  public convertedCategoryDataSource = new BehaviorSubject<ConvertedCategory[]>(
    []
  );
  convertedCategoryData$ = this.convertedCategoryDataSource.asObservable();

  constructor(
    http: HttpClient,
    authService: AuthService,
    private appConfig: AppConfigurationService
  ) {
    super(http, authService);
    this.API_URL = appConfig['API_URL'];
  }

  getAllCategories(): Observable<FlowerCategory[]> {
    return this.http
      .get<FlowerCategory[]>(`${this.API_URL}/flower-categories`)
      .pipe(
        catchError((error) => {
          return this.handleError(error, () => this.getAllCategories());
        })
      );
  }

  getCategoryById(id: string): Observable<FlowerCategory> {
    return this.http
      .get<FlowerCategory>(`${this.API_URL}/flower-categories/${id}`)
      .pipe(
        catchError((error) => {
          return this.handleError(error, () => this.getCategoryById(id));
        })
      );
  }

  addNewCategory(formdata: FormData): Observable<FlowerCategory> {
    return this.http
      .post<FlowerCategory>(
        `${this.API_URL}/flower-categories`,
        formdata,
        this.requestHeaders
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () => this.addNewCategory(formdata));
        })
      );
  }

  updateCategory(
    id: number,
    updatedCategory: FlowerCategory
  ): Observable<FlowerCategory> {
    return this.http
      .put<FlowerCategory>(
        `${this.API_URL}/flower-categories/${id}`,
        updatedCategory,
        this.requestHeaders
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () =>
            this.updateCategory(id, updatedCategory)
          );
        })
      );
  }

  deleteCategory(id: number): Observable<FlowerCategory> {
    return this.http
      .delete<FlowerCategory>(
        `${this.API_URL}/flower-categories/${id}`,
        this.requestHeaders
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () => this.deleteCategory(id));
        })
      );
  }
}
