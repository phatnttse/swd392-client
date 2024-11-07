import { BaseResponse } from './base.model';

export interface SuggestAddress {
  AddressId: number;
  FullName: string;
  Name: string;
  Level: number;
  Type: number;
  Delivered: number;
  Picked: number;
  StreetId: number;
  WardId: number;
  DistrictId: number;
  ProvinceId: number;
  Lat: number | null;
  Lng: number | null;
  HamletNodeId: number | null;
  HamletNodeName: string | null;
  Score: number;
  PkgNumber: number | null;
  LcsRatio: number;
  Street: string;
  Ward: string;
  District: string;
  Province: string;
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

export interface ParseAddress {
  special: LocationDetail;
  district: LocationDetail;
  province: LocationDetail;
  ward: LocationDetail;
  corner: CornerDetail;
  customer_coordinate_id: number | null;
}

export interface LocationDetail {
  id: number;
  name: string;
  type: number;
}

export interface CornerDetail extends LocationDetail {
  lat: string;
  lng: string;
  coordinate_id: number | null;
  hnd_type_id: number | null;
  hnd_type_name: string | null;
}

export interface SuggestAddressResponse
  extends BaseResponse<SuggestAddress[]> {}
export interface FeeShipResponse {
  success: boolean;
  fee: FeeDetails;
  message: string;
}

export interface ParseAddressResponse extends BaseResponse<ParseAddress> {}
