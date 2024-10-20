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
}
