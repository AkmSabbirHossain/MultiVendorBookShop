using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineBookShop.Server.Interfaces;

namespace OnlineBookShop.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin,Customer")] // Usally stockhistory for admin
    public class StockHistoryController : ControllerBase
    {
        private readonly IStockHistoryService _stockHistoryService;

        public StockHistoryController(IStockHistoryService stockHistoryService)
        {
            _stockHistoryService = stockHistoryService;
        }

        // GET: api/StockHistory/book/{bookId}
        [HttpGet("book/{bookId}")]
        public async Task<IActionResult> GetBookStockHistory(int bookId)
        {
            var histories = await _stockHistoryService.GetBookStockHistoryAsync(bookId);
            return Ok(histories);
        }
    }
}
