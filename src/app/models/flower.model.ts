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
  price: number;
  stockBalance: number;
  categories: Category[];
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

export interface FlowerPaginated extends PaginatedResponse<Flower> {}
