import { UserAccount } from './account.model';
import { FlowerCategory } from './category.model';
import { FlowerListingStatus } from './enums';
import { PaginatedResponse } from './paginated.model';

export interface Image {
  id: number;
  url: string;
}

export interface Flower {
  id: number;
  user: UserAccount;
  name: string;
  description: string;
  address: string;
  price: number;
  stockQuantity: number;
  categories: FlowerCategory[];
  images: Image[];
  status: FlowerListingStatus;
  views: number;
  rejectReason: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

export interface FlowerPaginated extends PaginatedResponse<Flower> {}
