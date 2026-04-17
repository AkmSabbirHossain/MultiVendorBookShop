using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineBookShop.Server.DTOs;
using OnlineBookShop.Server.Interfaces;
using System.Security.Claims;

namespace OnlineBookShop.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookController : ControllerBase
    {
        private readonly IBookService _bookService;
        private readonly IVendorService _vendorService;

        public BookController(IBookService bookService, IVendorService vendorService)
        {
            _bookService = bookService;
            _vendorService = vendorService;
        }

        // Public: Get all books
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllBooks()
        {
            var books = await _bookService.GetAllBooksAsync();
            return Ok(books);
        }

        // Public: Get book by ID
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetBook(int id)
        {
            var book = await _bookService.GetBookByIdAsync(id);
            if (book == null)
                return NotFound(new { Error = "Book not found" });

            return Ok(book);
        }

        // Vendor only: Add new book
        [HttpPost]
        [Authorize(Roles = "Vendor,Admin")]
        public async Task<IActionResult> CreateBook([FromBody] BookCreateDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            //Check Vendor record 
            var vendor = await _vendorService.GetVendorByUserIdAsync(userId);
            if (vendor == null || !vendor.IsApproved)
                return Forbid("You are not an approved vendor");

            var book = await _bookService.CreateBookAsync(dto, vendor.VendorId);  
            return CreatedAtAction(nameof(GetBook), new { id = book.BookId }, book);
        }

        // Vendor only: Update book
        [HttpPut("{id}")]
        [Authorize(Roles = "Vendor,Admin")]
        public async Task<IActionResult> UpdateBook(int id, [FromBody] BookUpdateDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            var vendor = await _vendorService.GetVendorByUserIdAsync(userId);
            if (vendor == null || !vendor.IsApproved)
                return Forbid("You are not an approved vendor");

            await _bookService.UpdateBookAsync(id, dto, vendor.VendorId);

            return Ok(new { message = "Book updated successfully" });
        }

        // Vendor only: Delete book
        [HttpDelete("{id}")]
        [Authorize(Roles = "Vendor")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            var vendor = await _vendorService.GetVendorByUserIdAsync(userId);
            if (vendor == null || !vendor.IsApproved)
                return Forbid("You are not an approved vendor");

            await _bookService.DeleteBookAsync(id, vendor.VendorId);
            return NoContent();
        }

        // Vendor: Get my books
        [HttpGet("my")]
        [Authorize(Roles = "Vendor")]
        public async Task<IActionResult> GetMyBooks()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            var vendor = await _vendorService.GetVendorByUserIdAsync(userId);
            if (vendor == null || !vendor.IsApproved)
                return Forbid("You are not an approved vendor");

            var books = await _bookService.GetBooksByVendorAsync(vendor.VendorId);
            return Ok(books);
        }
    }
}