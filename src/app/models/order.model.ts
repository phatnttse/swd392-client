import { BaseResponse } from './base.model';
import { Flower } from './flower.model';

export interface OrderDetail {
  flowerListing: Flower;
  quantity: number;
  price: number;
  status: string;
  createAt: Date;
}

export interface Order {
  id: number;
  totalAmount: number;
  note: string;
  balance: number;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  buyerAddress: string;
  orderDetails: OrderDetail[];
  status: string;
  createdAt: Date;
}

export interface OrderResponse extends BaseResponse<Order[]> {}
