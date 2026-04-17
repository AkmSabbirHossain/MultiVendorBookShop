// OrderService.cs 

using AutoMapper;
using Microsoft.EntityFrameworkCore;
using OnlineBookShop.Server.DTOs;
using OnlineBookShop.Server.Interfaces;
using OnlineBookShop.Server.Models;

namespace OnlineBookShop.Server.Application.Services
{
    public class OrderService : IOrderService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public OrderService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        // Customer: Create new order
        public async Task<OrderResponseDto> CreateOrderAsync(OrderCreateDto dto, int userId)
        {
            var order = new Order
            {
                UserId = userId,
                AddressId = dto.AddressId,
                OrderDate = DateTime.UtcNow,
                Status = OrderStatus.Pending,
                TotalAmount = 0m
            };

            var orderItems = new List<OrderItem>();

            foreach (var itemDto in dto.Items)
            {
                var book = await _unitOfWork.Repository<Book>()
                    .GetByIdAsync(itemDto.BookId)
                    ?? throw new KeyNotFoundException($"Book ID {itemDto.BookId} not found");

                if (book.Stock < itemDto.Quantity)
                    throw new InvalidOperationException(
                        $"Insufficient stock for '{book.Title}' (Available: {book.Stock}, Requested: {itemDto.Quantity})");

                var orderItem = new OrderItem
                {
                    BookId = itemDto.BookId,
                    Quantity = itemDto.Quantity,
                    Price = book.Price
                };

                orderItems.Add(orderItem);
                order.TotalAmount += orderItem.Quantity * orderItem.Price;

                book.Stock -= itemDto.Quantity;
                _unitOfWork.Repository<Book>().Update(book);
            }

            order.OrderItems = orderItems;
            _unitOfWork.Repository<Order>().Add(order);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<OrderResponseDto>(order);
        }

        // Specific order
        public async Task<OrderResponseDto?> GetOrderByIdAsync(int orderId, int userId)
        {
            var order = await _unitOfWork.Repository<Order>()
                .GetQueryable()
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Book)
                .Include(o => o.Address) 
                .FirstOrDefaultAsync(o => o.OrderId == orderId && o.UserId == userId);

            return order == null ? null : _mapper.Map<OrderResponseDto>(order);
        }

        // Customer: Get my orders
        public async Task<List<OrderResponseDto>> GetUserOrdersAsync(int userId)
        {
            var orders = await _unitOfWork.Repository<Order>()
                .GetQueryable()
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Book)
                .Include(o => o.Address) 
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return _mapper.Map<List<OrderResponseDto>>(orders);
        }

        // Vendor: Get vendor orders
        public async Task<List<OrderResponseDto>> GetVendorOrdersAsync(int vendorId)
        {
            var orders = await _unitOfWork.Repository<OrderItem>()
                .GetQueryable()
                .Include(oi => oi.Order)
                    .ThenInclude(o => o.OrderItems)
                        .ThenInclude(oi => oi.Book)
                .Include(oi => oi.Order)
                    .ThenInclude(o => o.Address) 
                .Where(oi => oi.Book.VendorId == vendorId)
                .Select(oi => oi.Order)
                .Distinct()
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return _mapper.Map<List<OrderResponseDto>>(orders);
        }

        // Customer: Cancel order
        public async Task CancelOrderAsync(int orderId, int userId)
        {
            var order = await _unitOfWork.Repository<Order>()
                .GetQueryable()
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Book)
                .FirstOrDefaultAsync(o => o.OrderId == orderId && o.UserId == userId)
                ?? throw new KeyNotFoundException("Order not found or does not belong to this user");

            if (order.Status != OrderStatus.Pending)
                throw new InvalidOperationException(
                    $"Order cannot be cancelled in {order.Status} status");

            order.Status = OrderStatus.Cancelled;

            foreach (var item in order.OrderItems)
            {
                if (item.Book != null)
                {
                    item.Book.Stock += item.Quantity;
                    _unitOfWork.Repository<Book>().Update(item.Book);
                }
            }

            _unitOfWork.Repository<Order>().Update(order);
            await _unitOfWork.SaveChangesAsync();
        }

        // Vendor/Admin: Update order status
        public async Task UpdateOrderStatusAsync(int orderId, OrderStatus newStatus)
        {
            var order = await _unitOfWork.Repository<Order>()
                .GetByIdAsync(orderId)
                ?? throw new KeyNotFoundException("Order not found");

            if (newStatus == OrderStatus.Cancelled && order.Status != OrderStatus.Pending)
                throw new InvalidOperationException("Only pending orders can be cancelled");

            order.Status = newStatus;
            _unitOfWork.Repository<Order>().Update(order);
            await _unitOfWork.SaveChangesAsync();
        }

        // Vendor: Ship order
        public async Task ShipOrderAsync(int orderId, int vendorId)
        {
            var orderItem = await _unitOfWork.Repository<OrderItem>()
                .GetFirstOrDefaultAsync(oi => oi.OrderId == orderId && oi.Book.VendorId == vendorId)
                ?? throw new InvalidOperationException("No items from this vendor in the order");

            var order = await _unitOfWork.Repository<Order>()
                .GetByIdAsync(orderId)
                ?? throw new KeyNotFoundException("Order not found");

            if (order.Status != OrderStatus.Paid)
                throw new InvalidOperationException("Order must be paid before shipping");

            order.Status = OrderStatus.Shipped;
            _unitOfWork.Repository<Order>().Update(order);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}