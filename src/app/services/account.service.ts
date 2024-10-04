import { Injectable } from '@angular/core';
import { EndpointBase } from './endpoint-base.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { AppConfigurationService } from './configuration.service';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccountService extends EndpointBase {
  API_URL: string = '';
  constructor(
    http: HttpClient,
    authService: AuthService,
    private appConfig: AppConfigurationService
  ) {
    super(http, authService);
    this.API_URL = appConfig['API_URL'];
  }

  getUser<T>(): Observable<T> {
    return this.http
      .get<T>(`${this.API_URL}/auth/get-details`, this.requestHeaders)
      .pipe(
        catchError((error) => {
          return this.handleError(error, () => this.getUser<T>());
        })
      );
  }
}
