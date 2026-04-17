// =============================================
// admin.types.ts
// =============================================

export interface AdminStatsDto {
    totalUsers: number;
    totalVendors: number;
    totalBooks: number;
    totalOrders: number;
    pendingVendors: number;
}

export interface VendorResponseDto {
    vendorId: number;
    userId: number;
    shopName: string;
    description?: string;
    logoUrl?: string;
    isApproved: boolean;
    createdAt: string;
}

export interface CategoryCreateDto {
    name: string;
}

export interface CategoryResponseDto {
    categoryId: number;
    name: string;
}