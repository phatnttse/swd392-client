import { UserAccount } from './account.model';
import { BaseResponse } from './base.model';
import {
  PaymentMethod,
  WalletLogActor,
  WalletLogStatus,
  WalletLogType,
} from './enums';
import { PaginatedPageableResponse } from './paginated.model';

export interface WalletLog {
  id: number;
  account: UserAccount;
  type: WalletLogType;
  actor: WalletLogActor;
  amount: number;
  paymentMethod: PaymentMethod;
  status: WalletLogStatus;
  createdAt: string;
}

export interface WalletLogPaginated
  extends PaginatedPageableResponse<WalletLog> {}
export interface WalletLogResponse extends BaseResponse<WalletLogPaginated> {}
