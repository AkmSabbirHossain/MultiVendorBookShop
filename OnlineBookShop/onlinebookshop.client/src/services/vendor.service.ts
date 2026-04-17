// =============================================
// vendor.service.ts —
// =============================================

import axiosInstance from "./axiosInstance";
import type { VendorResponseDto, VendorRegisterDto } from "../types/vendor.types";
import type { BookResponseDto, BookCreateDto, BookUpdateDto } from "../types/book.types";

const VendorService = {

    // ── POST /api/vendor/register ──
    registerVendor: async (dto: VendorRegisterDto): Promise<VendorResponseDto> => {
        const res = await axiosInstance.post<VendorResponseDto>("/vendor/register", dto);
        return res.data;
    },

    // ── GET /api/vendor/me ──
    getMyProfile: async (): Promise<VendorResponseDto> => {
        const res = await axiosInstance.get<VendorResponseDto>("/vendor/me");
        return res.data;
    },

    // ── GET /api/books?vendorId=me (vendor own books) ──
    getMyBooks: async (): Promise<BookResponseDto[]> => {
        const res = await axiosInstance.get<BookResponseDto[]>("/book/my");
        return res.data;
    },

    // ── POST /api/books ──
    createBook: async (dto: BookCreateDto): Promise<BookResponseDto> => {
        const res = await axiosInstance.post<BookResponseDto>("/book", dto);
        return res.data;
    },

    // ── PUT /api/books/:id ──
    updateBook: async (bookId: number, dto: BookUpdateDto): Promise<BookResponseDto> => {
        const res = await axiosInstance.put<BookResponseDto>(`/book/${bookId}`, dto);
        return res.data;
    },

    // ── DELETE /api/books/:id ──
    deleteBook: async (bookId: number): Promise<void> => {
        await axiosInstance.delete(`/book/${bookId}`);
    },
};

export default VendorService;