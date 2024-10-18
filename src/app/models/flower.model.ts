import { UserAccount } from './account.model';
import { FlowerListingStatus } from './enums';
import { PaginatedResponse } from './paginated.model';

export interface Category {
  id: number;
  name: string;
  categoryParent: string;
  createdAt: string;
  updatedAt: string;
}
export interface Flower {
  id: number;
  user: UserAccount;
  name: string;
  description: string;
  address: string;
  price: number;
  stockQuantity: number;
  categories: Category[];
  imageUrl: string;
  status: FlowerListingStatus;
  views: number;
  rejectReason: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

export interface FlowerPaginated extends PaginatedResponse<Flower> {}
