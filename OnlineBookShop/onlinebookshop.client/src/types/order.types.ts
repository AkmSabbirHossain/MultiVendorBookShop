// =============================================
// order.types.ts
// =============================================

export type OrderStatus = "Pending" | "Paid" | "Shipped" | "Delivered" | "Cancelled";

export interface OrderItemCreateDto {
    bookId: number;
    quantity: number;
}

export interface OrderCreateDto {
    addressId: number;
    items: OrderItemCreateDto[];
}

export interface OrderItemResponseDto {
    orderItemId: number;
    bookId: number;
    quantity: number;
    price: number;
}

export interface OrderAddressDto {
    addressId: number;
    street: string;
    city: string;
    stateOrDivision?: string;
    postalCode?: string;
    country: string;
}

export interface OrderResponseDto {
    orderId: number;
    userId: number;
    addressId: number;
    totalAmount: number;
    status: OrderStatus;
    orderDate: string;
    items: OrderItemResponseDto[];
    address?: OrderAddressDto;
}

// PUT /api/Order/{orderId}/status
export interface OrderStatusUpdateDto {
    newStatus: OrderStatus;
}