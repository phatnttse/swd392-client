import { PaginatedResponse } from "./paginated.model";

export interface FlowerCategory {
  id: number;
  name: string;
  categoryParent: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

