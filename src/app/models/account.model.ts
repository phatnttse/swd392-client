import { BaseResponse } from './base.model';
import { Gender, Role, WalletLogType } from './enums';
import { PaginatedPageableResponse, PaginatedResponse } from './paginated.model';

export interface UserAccount {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender: Gender;
  role: Role;
  avatar: string;
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

export interface UserAccountResponse extends BaseResponse<UserAccount> {}

export interface AccountPaginate extends PaginatedResponse<UserAccount>{}

export interface UserAccountPaginatedResponse extends BaseResponse<AccountPaginate>{}