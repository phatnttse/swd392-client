export enum Gender {
  FEMALE = 'FEMALE',
  MALE = 'MALE',
  OTHERS = 'OTHERS',
}

export enum Role {
  MANAGER = 'MANAGER',
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum WalletLogType {
  ADD = 'ADD',
  SUBTRACT = 'SUBTRACT',
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
}

export enum FlowerListingStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export enum PaymentMethod {
  VNPAY = 'VNPAY',
  BANKING = 'BANKING',
  WALLET = 'WALLET',
  PAYOS = 'PAYOS',
  COD = 'COD',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_DELIVERED = 'PARTIALLY_DELIVERED',
}
export enum WalletLogStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  EXPIRED = 'EXPIRED',
}

export enum WalletLogActor {
  SELLER = 'SELLER',
  BUYER = 'BUYER',
  ADMIN = 'ADMIN',
  DEPOSITOR = 'DEPOSITOR',
}
export enum TransactionType {
  ORDER = 'ORDER',
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
}

export enum OrderDetailStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  BUYER_CANCELED = 'BUYER_CANCELED',
  SELLER_CANCELED = 'SELLER_CANCELED',
  REFUNDED = 'REFUNDED',
}
export enum ParentCategory {
  COLOR = 'COLOR',
  TYPE = 'TYPE',
  EVENT_TYPE = 'EVENT_TYPE',
  SUBJECT = 'SUBJECT',
  DISPLAY = 'DISPLAY',
}

export enum NonProcessOrderStatus {
  BUYER_CANCELED = 'BUYER_CANCELED',
  SELLER_CANCELED = 'SELLER_CANCELED',
  REFUNDED = 'REFUNDED',
}

export enum BuyerCancelOrderReason {
  FoundCheaperElsewhere = 'Order.CancelReason.FoundCheaperElsewhere',
  ChangeOfMind = 'Order.CancelReason.ChangeOfMind',
  OrderByMistake = 'Order.CancelReason.OrderByMistake',
  ShippingCostTooHigh = 'Order.CancelReason.ShippingCostTooHigh',
  LongShippingTime = 'Order.CancelReason.LongShippingTime',
  Other = 'Order.CancelReason.Other',
}

export enum SellerCancelOrderReason {
  OutOfStock = 'Order.CancelReason.OutOfStock',
  PricingError = 'Order.CancelReason.PricingError',
  ShippingDelay = 'Order.CancelReason.ShippingDelay',
  CustomerRequest = 'Order.CancelReason.CustomerRequest',
  FraudulentOrder = 'Order.CancelReason.FraudulentOrder',
  Other = 'Order.CancelReason.Other',
}

export enum NotificationType {
  WELCOME = 'WELCOME',
  FLOWER_LISTING_STATUS = 'FLOWER_LISTING_STATUS',
  ORDER_STATUS = 'ORDER_STATUS',
  MARKETING = 'WALLET_LOG',
}

export enum DestinationScreenEnum {
  MY_FLOWER_LISTING = 'MY_FLOWER_LISTING',
  MY_ORDER = 'MY_ORDER',
  MY_WALLET = 'MY_WALLET',
  HOME_PAGE = 'HOME_PAGE'
}

export enum PaymentStatus {
  CANCELLED = 'CANCELLED',
  PAID = 'PAID',
}

export enum UserStatus {
  VERIFIED = 'VERIFIED',
  UNVERIFIED = 'UNVERIFIED',
  DELETED = 'DELETED',
  BAN = 'BAN',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  BLOCKED = 'BLOCKED',
  UNBLOCKED = 'UNBLOCKED',
}
