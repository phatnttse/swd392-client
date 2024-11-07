import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { AppConfigurationService } from './configuration.service';
import { EndpointBase } from './endpoint-base.service';
import { Observable } from 'rxjs';
import {
  FeeShipRequest,
  FeeShipResponse,
  ParseAddressResponse,
  SuggestAddressResponse,
} from '../models/integration.model';

@Injectable({
  providedIn: 'root',
})
export class IntegrationService extends EndpointBase {
  INTEGRATION_SUGGEST_ADDRESS_URL: string = '';
  INTEGRATION_FEE_SHIP_URL: string = '';
  constructor(
    http: HttpClient,
    authService: AuthService,
    private appConfig: AppConfigurationService
  ) {
    super(http, authService);
    this.INTEGRATION_SUGGEST_ADDRESS_URL =
      appConfig['INTEGRATION_SUGGEST_ADDRESS_URL'];
    this.INTEGRATION_FEE_SHIP_URL = appConfig['INTEGRATION_FEE_SHIP_URL'];
  }

  getSuggestAddress(search: string): Observable<SuggestAddressResponse> {
    return this.http.post<SuggestAddressResponse>(
      `${this.INTEGRATION_SUGGEST_ADDRESS_URL}/integration/ghtk/suggest-address`,
      { search },
      this.requestHeaders
    );
  }

  getParseAddress(address: string): Observable<ParseAddressResponse> {
    return this.http.post<ParseAddressResponse>(
      `${this.INTEGRATION_SUGGEST_ADDRESS_URL}/integration/ghtk/parse-address`,
      { address },
      this.requestHeaders
    );
  }

  getFeeShip(getFeeShipRequest: FeeShipRequest): Observable<FeeShipResponse> {
    // Tạo URL với các tham số truy vấn từ object request
    // const params = new HttpParams()
    //   .set('address', getFeeShipRequest.address)
    //   .set('province', getFeeShipRequest.province)
    //   .set('district', getFeeShipRequest.district)
    //   .set('ward', getFeeShipRequest.ward)
    //   .set('pick_address', getFeeShipRequest.pick_address)
    //   .set('pick_province', getFeeShipRequest.pick_province)
    //   .set('pick_district', getFeeShipRequest.pick_district)
    //   .set('pick_ward', getFeeShipRequest.pick_ward)
    //   .set('weight', getFeeShipRequest.weight.toString())
    //   .set('value', getFeeShipRequest.value.toString())
    //   .set('deliver_option', getFeeShipRequest.deliver_option)
    //   .set('tags', getFeeShipRequest.tags.join(','))
    //   .set('transport', getFeeShipRequest.transport);

    // Thực hiện request với token trong headers
    return this.http.post<FeeShipResponse>(
      `${this.INTEGRATION_FEE_SHIP_URL}/integration/ghtk/fee-ship`,
      { ...getFeeShipRequest },
      this.requestHeaders
    );
  }

  // getFeeShip(getFeeShipRequest: FeeShipRequest): Observable<FeeShipResponse> {
  //   const params = new HttpParams()
  //     .set('address', getFeeShipRequest.address)
  //     .set('province', getFeeShipRequest.province)
  //     .set('district', getFeeShipRequest.district)
  //     .set('ward', getFeeShipRequest.ward)
  //     .set('pick_address', getFeeShipRequest.pick_address)
  //     .set('pick_province', getFeeShipRequest.pick_province)
  //     .set('pick_district', getFeeShipRequest.pick_district)
  //     .set('pick_ward', getFeeShipRequest.pick_ward)
  //     .set('weight', getFeeShipRequest.weight.toString())
  //     .set('value', getFeeShipRequest.value.toString())
  //     .set('deliver_option', getFeeShipRequest.deliver_option)
  //     .set('tags', getFeeShipRequest.tags.join(','))
  //     .set('transport', getFeeShipRequest.transport);

  //   const headers = new HttpHeaders({
  //     Token: '7c6b6d731997f6ab16c5b9976808fbe8dfe5137e',
  //     'User-Agent': 'PostmanRuntime/7.42.0',
  //     Accept: '*/*',
  //     'Cache-Control': 'no-cache',
  //     'Postman-Token': 'b6c3eb83-9897-48fe-ba51-1bb6016c1ace',
  //     Host: 'services.giaohangtietkiem.vn',
  //     'Accept-Encoding': 'gzip, deflate, br',
  //     Connection: 'keep-alive',
  //   });

  //   return this.http.get<FeeShipResponse>(
  //     `https://services.giaohangtietkiem.vn/services/shipment/fee`,
  //     {
  //       params: params,
  //       headers: headers,
  //     }
  //   );
  // }
}
