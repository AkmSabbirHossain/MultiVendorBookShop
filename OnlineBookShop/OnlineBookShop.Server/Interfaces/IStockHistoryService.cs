using OnlineBookShop.Server.DTOs;
using OnlineBookShop.Server.Models;

public interface IStockHistoryService
{
    Task AddStockHistoryAsync(int bookId, int oldStock, int newStock, string reason);
    Task<List<StockHistoryResponseDto>> GetBookStockHistoryAsync(int bookId);
}


