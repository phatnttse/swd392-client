import { BaseResponse } from './base.model';
import { Gender, Role, WalletLogType } from './enums';
import {
  PaginatedPageableResponse,
  PaginatedResponse,
} from './paginated.model';

export interface UserAccount {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender: Gender;
  role: Role;
  avatar: string;
  status: string;
  balance: number;
  externalAuthType: string;
  createAt: Date;
}

export interface UserBalanceResponse {
  name: string;
  balance: number;
}

export interface AddBalanceResponse {
  id: number;
  orderCode: number;
  addBalance: number;
  currentBalance: number;
  currency: string;
  note: string;
  walletLogTypeEnum: WalletLogType;
  checkoutUrl: string;
  paymentLinkId: string;
  createAt: Date;
}

export interface SellerProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender: Gender;
  role: Role;
  avatar: string;
  createAt: Date;
  ratingAverage: number;
  ratingCount: number;
  productCount: number;
}

export interface AccountAddress {
  id: number;
  recipientName: string;
  streetAddress: string;
  ward: string;
  district: string;
  province: string;
  phoneNumber: string;
  account: UserAccount;
  createAt: Date;
  updateAt: Date;
}

export interface UserAccountResponse extends BaseResponse<UserAccount> {}

export interface AccountPaginate extends PaginatedResponse<UserAccount> {}

export interface UserAccountPaginatedResponse
  extends BaseResponse<AccountPaginate> {}

export interface SellerProfileResponse extends BaseResponse<SellerProfile> {}

export interface AccountAddressResponse extends BaseResponse<AccountAddress> {}

export interface AccountAddressListResponse
  extends BaseResponse<AccountAddress[]> {}
