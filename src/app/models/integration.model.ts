import { BaseResponse } from './base.model';

export interface ParseAddress {
  ward: Ward;
  district: District;
  province: Province;
  other: Other;
  corner: Corner;
  customer_coordinate_id: number;
}

export interface Ward {
  id: number;
  name: string;
  type: number;
}

export interface District {
  id: number;
  name: string;
  type: number;
}

export interface Province {
  id: number;
  name: string;
  type: number;
}

export interface Other {
  id: number;
  name: string;
  type: number;
}

export interface Corner {
  id: number;
  name: string;
  type: number;
  lat: string;
  lng: string;
  coordinate_id: number;
  hnd_type_id: number | null;
  hnd_type_name: string | null;
}

export interface FeeShipRequest {
  address: string;
  province: string;
  district: string;
  ward: string;
  pick_address: string;
  pick_province: string;
  pick_district: string;
  pick_ward: string;
  weight: number;
  value: number;
  deliver_option: string;
  tags: string[];
  transport: string;
}

export interface FeeDetails {
  name: string;
  fee: number;
  insurance_fee: number;
  include_vat: number;
  cost_id: number;
  delivery_type: string;
  a: number;
  dt: string;
  extFees: any[];
  promotion_key: string;
  delivery: boolean;
  ship_fee_only: number;
  distance: number;
  options: FeeOptions;
}

export interface FeeOptions {
  name: string;
  title: string;
  shipMoney: number;
  shipMoneyText: string;
  vatText: string;
  desc: string;
  coupon: string;
  maxUses: number;
  maxDates: number;
  maxDateString: string;
  content: string;
  activatedDate: string;
  couponTitle: string;
  discount: string;
}

export interface ParseAddressResponse extends BaseResponse<ParseAddress> {}
export interface FeeShipResponse {
  success: boolean;
  fee: FeeDetails;
  message: string;
}
