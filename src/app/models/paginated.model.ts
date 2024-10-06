export interface PaginatedResponse<T> {
  content: T[];
  pageNumber: number;
  totalPages: number;
  pageSize: number;
  numberOfElements: number;
  totalElements: number;
}
