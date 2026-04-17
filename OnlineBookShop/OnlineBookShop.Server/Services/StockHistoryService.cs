using AutoMapper;
using Microsoft.EntityFrameworkCore;
using OnlineBookShop.Server.DTOs;
using OnlineBookShop.Server.Interfaces;
using OnlineBookShop.Server.Models;

namespace OnlineBookShop.Server.Services
{
    public class StockHistoryService : IStockHistoryService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public StockHistoryService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task AddStockHistoryAsync(int bookId, int oldStock, int newStock, string reason)
        {
            var history = new StockHistory
            {
                BookId = bookId,
                OldStock = oldStock,
                NewStock = newStock,
                Reason = reason,
                ChangedAt = DateTime.UtcNow
            };

            _unitOfWork.Repository<StockHistory>().Add(history);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<List<StockHistoryResponseDto>> GetBookStockHistoryAsync(int bookId)
        {
            var histories = await _unitOfWork.Repository<StockHistory>()
                .GetQueryable()
                .Include(h => h.Book)
                .Where(h => h.BookId == bookId)
                .OrderByDescending(h => h.ChangedAt)
                .ToListAsync();

            return _mapper.Map<List<StockHistoryResponseDto>>(histories);
        }
    }
}
