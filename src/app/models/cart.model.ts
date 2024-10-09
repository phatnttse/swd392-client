import { BaseResponse } from './base.model';
import { FlowerListingStatusEnum } from './enums';

export interface CartItem {
  id: number;
  quantity: number;
  flowerId: number;
  flowerName: string;
  flowerDescription: string;
  flowerPrice: number;
  eventType: string;
  stockBalance: number;
  address: string;
  status: FlowerListingStatusEnum;
}

export interface InsertUpdateCartResponse extends BaseResponse<CartItem> {}
export interface GetCartByUserResponse extends BaseResponse<CartItem[]> {}
