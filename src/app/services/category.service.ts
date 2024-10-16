import { Injectable } from '@angular/core';
import { EndpointBase } from './endpoint-base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { AppConfigurationService } from './configuration.service';
import { BehaviorSubject, catchError, Observable } from 'rxjs';
import { FlowerCategory } from '../models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService extends EndpointBase {
  API_URL: string = '';

  // Trạng thái của category
  public categoryDataSource = new BehaviorSubject<FlowerCategory[]>([]);
  categoryData$ = this.categoryDataSource.asObservable();

  // Trạng thái của category đã convert
  public convertedCategoryDataSource = new BehaviorSubject<any[]>([]);
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

}
