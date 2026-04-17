// =============================================
// admin.service.ts — Admin only endpoints
//
// GET    /api/Vendor/pending          → getPendingVendors
// POST   /api/Vendor/{id}/approve    → approveVendor
// POST   /api/Vendor/{id}/reject     → rejectVendor
// GET    /api/Category               → getCategories
// POST   /api/Category               → createCategory
// DELETE /api/Category/{id}          → deleteCategory
// =============================================

import axiosInstance from "./axiosInstance";
import type {
    VendorResponseDto,
    CategoryResponseDto,
    CategoryCreateDto,
} from "../types/admin.types";

const AdminService = {

    // ── Pending Vendors ──
    getPendingVendors: async (): Promise<VendorResponseDto[]> => {
        const res = await axiosInstance.get<VendorResponseDto[]>("/Vendor/pending");
        return res.data;
    },

    // ── Approve Vendor ──
    approveVendor: async (vendorId: number): Promise<void> => {
        await axiosInstance.post(`/Vendor/${vendorId}/approve`);
    },

    // ── Reject Vendor ──
    rejectVendor: async (vendorId: number): Promise<void> => {
        await axiosInstance.post(`/Vendor/${vendorId}/reject`);
    },

    // ── All Categories ──
    getCategories: async (): Promise<CategoryResponseDto[]> => {
        const res = await axiosInstance.get<CategoryResponseDto[]>("/Category");
        return res.data;
    },

    // ── Create Category ──
    createCategory: async (dto: CategoryCreateDto): Promise<CategoryResponseDto> => {
        const res = await axiosInstance.post<CategoryResponseDto>("/Category", dto);
        return res.data;
    },

    // ── Delete Category ──
    deleteCategory: async (categoryId: number): Promise<void> => {
        await axiosInstance.delete(`/Category/${categoryId}`);
    },
};

export default AdminService;