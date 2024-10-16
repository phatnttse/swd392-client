import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, Subject, from, throwError } from 'rxjs';
import { mergeMap, switchMap, catchError } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { UserAccount } from '../models/account.model';

@Injectable({
  providedIn: 'root',
})
export class EndpointBase {
  private taskPauser: Subject<boolean> | null = null;
  private isRefreshingLogin = false;

  constructor(protected http: HttpClient, private authService: AuthService) {}

  // Tạo header cho request
  protected get requestHeaders(): {
    headers: HttpHeaders | { [header: string]: string | string[] };
  } {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.accessToken}`,
      // 'Content-Type': 'application/json',
      Accept: 'application/json, text/plain, */*',
    });

    return { headers };
  }

  // Lấy thông tin tài khoản
  public refreshLogin(): Observable<UserAccount | null> {
    return this.authService.refreshLogin().pipe(
      catchError((error: HttpErrorResponse) => {
        return this.handleError(error, () => this.refreshLogin());
      })
    );
  }

  // Xử lý lỗi custom
  protected handleError<T>(
    error: any,
    continuation: () => Observable<T>
  ): Observable<T> {
    if (error.status === 401) {
      if (this.isRefreshingLogin) {
        return this.pauseTask(continuation);
      }

      this.isRefreshingLogin = true;

      return from(this.authService.refreshLogin()).pipe(
        mergeMap(() => {
          this.isRefreshingLogin = false;
          this.resumeTasks(true);

          return continuation();
        }),
        catchError((refreshLoginError) => {
          this.isRefreshingLogin = false;
          this.resumeTasks(false);
          this.authService.reLogin();

          if (refreshLoginError.status === 401 || refreshLoginError.error) {
            return throwError(() => new Error('session expired'));
          } else {
            return throwError(
              () => refreshLoginError || new Error('server error')
            );
          }
        })
      );
    }
    return throwError(() => error);
  }

  // Tạm dừng task
  private pauseTask<T>(continuation: () => Observable<T>) {
    if (!this.taskPauser) {
      this.taskPauser = new Subject();
    }

    return this.taskPauser.pipe(
      switchMap((continueOp) => {
        return continueOp
          ? continuation()
          : throwError(() => new Error('session expired'));
      })
    );
  }

  // Tiếp tục task
  private resumeTasks(continueOp: boolean) {
    setTimeout(() => {
      if (this.taskPauser) {
        this.taskPauser.next(continueOp);
        this.taskPauser.complete();
        this.taskPauser = null;
      }
    });
  }
}
