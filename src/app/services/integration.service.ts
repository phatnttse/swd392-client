import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { AppConfigurationService } from './configuration.service';
import { EndpointBase } from './endpoint-base.service';
import { Observable } from 'rxjs';
import {
  FeeShipRequest,
  FeeShipResponse,
  ParseAddressResponse,
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

  parseAddress(address: string): Observable<ParseAddressResponse> {
    return this.http.post<ParseAddressResponse>(
      `${this.INTEGRATION_URL}/integration/ghtk/parse-address`,
      { address }
    );
  }

  getFeeShip(getFeeShipRequest: FeeShipRequest): Observable<FeeShipResponse> {
    return this.http.get<FeeShipResponse>(
      `${this.INTEGRATION_URL}/integration/ghtk/fee-ship`
    );
  }
}
