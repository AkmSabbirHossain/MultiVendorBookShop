// =============================================
// book.types.ts
// =============================================

export interface BookResponseDto {
    bookId: number;
    title: string;
    author: string;
    price: number;
    stock: number;
    description?: string;
    imageUrl?: string;
    categoryId: number;
    vendorId: number;
    createdAt: string;
}

export interface CategoryResponseDto {
    categoryId: number;
    name: string;
}

export interface BookFilterParams {
    search?: string;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: "price_asc" | "price_desc" | "newest" | "title_asc";
    page?: number;
    pageSize?: number;
}

export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
export interface BookCreateDto {
  title: string;
  author: string;
  price: number;
  stock: number;
  description?: string;
  imageUrl?: string;
  categoryId: number;
}
 
export interface BookUpdateDto {
  title?: string;
  author?: string;
  price?: number;
  stock?: number;
  description?: string;
  imageUrl?: string;
  categoryId?: number;
}