using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineBookShop.Server.DTOs;
using OnlineBookShop.Server.Interfaces;

namespace OnlineBookShop.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class WishlistController : ControllerBase
    {
        private readonly IWishlistService _wishlistService;

        public WishlistController(IWishlistService wishlistService)
        {
            _wishlistService = wishlistService;
        }

        [HttpGet]
        public async Task<IActionResult> GetWishlist()
        {
            var userId = int.Parse(User.FindFirst("id").Value);
            var wishlist = await _wishlistService.GetWishlistAsync(userId);
            return Ok(wishlist);
        }

        [HttpPost("{bookId}")]
        public async Task<IActionResult> AddToWishlist(int bookId)
        {
            var userId = int.Parse(User.FindFirst("id").Value);
            var item = await _wishlistService.AddToWishlistAsync(userId, bookId);
            return Ok(item);
        }

        [HttpDelete("{bookId}")]
        public async Task<IActionResult> RemoveFromWishlist(int bookId)
        {
            var userId = int.Parse(User.FindFirst("id").Value);
            await _wishlistService.RemoveFromWishlistAsync(userId, bookId);
            return NoContent();
        }
    }

}
