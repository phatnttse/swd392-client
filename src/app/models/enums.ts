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
