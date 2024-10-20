import { Injectable } from '@angular/core';
import { EndpointBase } from './endpoint-base.service';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { AppConfigurationService } from './configuration.service';
import { BehaviorSubject, catchError, combineLatestWith, map, Observable, throwError } from 'rxjs';
import { ConvertedCategory, FlowerCategory } from '../models/category.model';
import { BaseResponse } from '../models/base.model';

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

  getCategoryById(id: string): Observable<FlowerCategory>{
    return this.http.get<FlowerCategory>(`${this.API_URL}/flower-categories/${id}`).pipe(
      catchError((error) => {
        return this.handleError(error, () => this.getCategoryById(id));
      })
    );
  }

  addnewCategory(formdata: FormData): Observable<FlowerCategory>{
    return this.http.post<FlowerCategory>(`${this.API_URL}/flower-categories`, formdata, this.requestHeaders).pipe(
      catchError((error) => {
        return this.handleError(error, () => this.addnewCategory(formdata));
      })
    );
  }

  updateCategory(id: number, updatedCategory: FlowerCategory): Observable<any>{
      return this.http.put( `${this.API_URL}/flower-categories/${id}`,
        updatedCategory)
  }

  deleteCategory(id: number): Observable<any>{
      return this.http.delete(`${this.API_URL}/flower-categories/${id}`);
  }
}
