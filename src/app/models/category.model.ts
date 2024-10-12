export interface FlowerCategory {
  id: number;
  name: string;
  categoryParent: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}
export interface ConvertedCategory {
  id: string;
  name: string;
  children: SubCategory[];
}
export interface SubCategory {
  id: number;
  name: string;
}
