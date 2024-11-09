import { BaseResponse } from './base.model';
import { OrderDetailStatus, PaymentMethod } from './enums';
import { Flower } from './flower.model';
import { PaginatedPageableResponse } from './paginated.model';

export interface OrderDetail {
  id: number;
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

export interface OrderSummary {
  id: number;
  note: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  buyerAddress: string;
}

export interface OrderByAccount {
  id: number;
  flowerListing: Flower;
  orderSummary: OrderSummary;
  quantity: number;
  price: number;
  paymentMethod: PaymentMethod;
  status: OrderDetailStatus;
  createAt: Date;
}
export interface OrderReport {
  addToCart: number;
  totalPrice: number;
  orders: number;
  conversionRate: number;
  views: number;
}
export interface OrderLineChart {
  price: number;
  orderCount: number;
  time: string;
}

export interface OrderCountStatus {
  pendingCount: number;
  preparingCount: number;
  shippedCount: number;
  deliveredCount: number;
  buyerCancelledCount: number;
  sellerCancelledCount: number;
  refundedCount: number;
}

export interface OrderResponse extends BaseResponse<Order[]> {}
export interface PaginatedOrderByAccountResponse
  extends PaginatedPageableResponse<OrderByAccount> {}
export interface OrderByAccountResponse
  extends BaseResponse<PaginatedOrderByAccountResponse> {}
export interface UpdateOrderStatusResponse
  extends BaseResponse<OrderByAccount> {}
export interface OrderReportResponse extends BaseResponse<OrderReport> {}
export interface OrderCountStatusResponse
  extends BaseResponse<OrderCountStatus> {}
