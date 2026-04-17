// =============================================
// vendor.types.ts
// =============================================

export interface VendorResponseDto {
    vendorId: number;
    shopName: string;
    description?: string;
    logoUrl?: string;
    isApproved: boolean;
    createdAt: string;
}

export interface VendorRegisterDto {
    shopName: string;
    description?: string;
    logoUrl?: string;
}