import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { AppConfigurationService } from './configuration.service';
import { EndpointBase } from './endpoint-base.service';
import { Observable } from 'rxjs';
import {
  FeeShipRequest,
  FeeShipResponse,
  SuggestAddressResponse,
} from '../models/integration.model';

@Injectable({
  providedIn: 'root',
})
export class IntegrationService extends EndpointBase {
  INTEGRATION_URL: string = '';
  constructor(
    http: HttpClient,
    authService: AuthService,
    private appConfig: AppConfigurationService
  ) {
    super(http, authService);
    this.INTEGRATION_URL = appConfig['INTEGRATION_URL'];
  }

  getSuggestAddress(search: string): Observable<SuggestAddressResponse> {
    return this.http.post<SuggestAddressResponse>(
      `${this.INTEGRATION_URL}/integration/ghtk/suggest-address`,
      { search },
      this.requestHeaders
    );
  }

  getFeeShip(getFeeShipRequest: FeeShipRequest): Observable<FeeShipResponse> {
    return this.http.get<FeeShipResponse>(
      `${this.INTEGRATION_URL}/integration/ghtk/fee-ship`
    );
  }
}
