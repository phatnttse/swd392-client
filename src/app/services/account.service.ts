import { Injectable } from '@angular/core';
import { EndpointBase } from './endpoint-base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { AppConfigurationService } from './configuration.service';
import { catchError, Observable } from 'rxjs';
import {
  AccountAddressListResponse,
  AccountAddressResponse,
  AddBalanceResponse,
  SellerProfileResponse,
  UserAccount,
  UserAccountPaginatedResponse,
  UserAccountResponse,
  UserBalanceResponse,
} from '../models/account.model';
import { Role } from '../models/enums';

@Injectable({
  providedIn: 'root',
})
export class AccountService extends EndpointBase {
  API_URL: string = '';
  localStorage?: Storage;

  constructor(
    http: HttpClient,
    authService: AuthService,
    private appConfig: AppConfigurationService
  ) {
    super(http, authService);
    this.API_URL = appConfig['API_URL'];
  }

  getAccountBalance(): Observable<UserBalanceResponse> {
    return this.http
      .get<UserBalanceResponse>(
        `${this.API_URL}/account/balance`,
        this.requestHeaders
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () => this.getAccountBalance());
        })
      );
  }

  addBalance(amount: number): Observable<AddBalanceResponse> {
    return this.http
      .post<AddBalanceResponse>(
        `${this.API_URL}/account/add-balance`,
        { amount },
        this.requestHeaders
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () => this.addBalance(amount));
        })
      );
  }

  updateProfile(
    name: string,
    phone: string,
    gender: string
  ): Observable<UserAccountResponse> {
    return this.http
      .patch<UserAccountResponse>(
        `${this.API_URL}/account/update-profile`,
        { name, phone, gender },
        this.requestHeaders
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () =>
            this.updateProfile(name, phone, gender)
          );
        })
      );
  }

  uploadAvatar(file: File): Observable<UserAccountResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .post<UserAccountResponse>(
        `${this.API_URL}/account/upload-avatar`,
        formData,
        this.requestHeaders
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () => this.uploadAvatar(file));
        })
      );
  }

  changePassword(
    oldPassword: string,
    newPassword: string,
    repeatPassword: string
  ): Observable<any> {
    return this.http
      .post<any>(
        `${this.API_URL}/auth/change-password`,
        { oldPassword, newPassword, repeatPassword },
        this.requestHeaders
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () =>
            this.changePassword(oldPassword, newPassword, repeatPassword)
          );
        })
      );
  }

  changeEmail(email: string): Observable<UserAccountResponse> {
    return this.http
      .post<UserAccountResponse>(
        `${this.API_URL}/auth/change-email`,
        { email },
        this.requestHeaders
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () => this.changeEmail(email));
        })
      );
  }

  confirmChangeEmail(otp: string): Observable<UserAccountResponse> {
    return this.http
      .post<UserAccountResponse>(
        `${this.API_URL}/auth/confirm-change-email/${otp}`,
        {},
        this.requestHeaders
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () => this.confirmChangeEmail(otp));
        })
      );
  }

  getUsers(
    searchString: string,
    order: string,
    sortBy: string,
    pageNumber: number,
    pageSize: number,
    roleName: Role[]
  ): Observable<UserAccountPaginatedResponse> {
    const params = new HttpParams()
      .set('searchString', searchString)
      .set('order', order)
      .set('sortBy', sortBy)
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('roleName', roleName.join(',') ?? []);

    return this.http
      .get<UserAccountPaginatedResponse>(
        `${this.API_URL}/account/profile/all`,
        {
          params: params,
          headers: this.requestHeaders.headers,
        }
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () =>
            this.getUsers(
              searchString,
              order,
              sortBy,
              pageNumber,
              pageSize,
              roleName
            )
          );
        })
      );
  }

  getSellerProfile(id: number): Observable<SellerProfileResponse> {
    return this.http
      .get<SellerProfileResponse>(`${this.API_URL}/account/profile/${id}`)
      .pipe(
        catchError((error) => {
          return this.handleError(error, () => this.getSellerProfile(id));
        })
      );
  }

  updateStatusUser(
    id: number,
    name: string,
    phone: string,
    gender: string,
    status: string
  ): Observable<UserAccountResponse> {
    return this.http
      .post<UserAccountResponse>(
        `${this.API_URL}/account/update-status-user/${id}`,
        { name, phone, gender, status },
        this.requestHeaders
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () =>
            this.updateStatusUser(id, name, phone, gender, status)
          );
        })
      );
  }

  addAddress(
    recipientName: string,
    streetAddress: string,
    ward: string,
    district: string,
    province: string,
    phoneNumber: string
  ): Observable<AccountAddressResponse> {
    return this.http
      .post<AccountAddressResponse>(
        `${this.API_URL}/address/create`,
        { recipientName, streetAddress, ward, district, province, phoneNumber },
        this.requestHeaders
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () =>
            this.addAddress(
              recipientName,
              streetAddress,
              ward,
              district,
              province,
              phoneNumber
            )
          );
        })
      );
  }

  updateAddress(
    id: number,
    recipientName: string,
    streetAddress: string,
    ward: string,
    district: string,
    province: string,
    phoneNumber: string
  ): Observable<AccountAddressResponse> {
    return this.http
      .put<AccountAddressResponse>(
        `${this.API_URL}/address/${id}`,
        { recipientName, streetAddress, ward, district, province, phoneNumber },
        this.requestHeaders
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () =>
            this.updateAddress(
              id,
              recipientName,
              streetAddress,
              ward,
              district,
              province,
              phoneNumber
            )
          );
        })
      );
  }

  getAddressByAccount(): Observable<AccountAddressListResponse> {
    return this.http
      .get<AccountAddressListResponse>(
        `${this.API_URL}/address/by-account`,
        this.requestHeaders
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () => this.getAddressByAccount());
        })
      );
  }

  deleteAddress(id: number): Observable<AccountAddressResponse> {
    return this.http
      .delete<AccountAddressResponse>(
        `${this.API_URL}/address/${id}`,
        this.requestHeaders
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () => this.deleteAddress(id));
        })
      );
  }

  getProvinces(): Observable<any> {
    return this.http.get<any>(`/assets/provinces.json`);
  }
}
