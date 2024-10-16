import { FlowerListingStatus } from './enums';
import { PaginatedResponse } from './paginated.model';

export interface User {
  id: number;
  name: string;
  avatar: string;
}
export interface Category {
  id: number;
  name: string;
  categoryParent: string;
  createdAt: string;
  updatedAt: string;
}
export interface Flower {
  id: number;
  user: User;
  name: string;
  description: string;
  address: string;
  price: number;
  stockQuantity: number;
  categories: Category[];
  imageUrl: string;
  status: FlowerListingStatus;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

export interface FlowerPaginated extends PaginatedResponse<Flower> {}
