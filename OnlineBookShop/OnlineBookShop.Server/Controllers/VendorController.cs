using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineBookShop.Server.DTOs;
using OnlineBookShop.Server.Interfaces;
using System.Security.Claims;

namespace OnlineBookShop.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VendorController : ControllerBase
    {
        private readonly IVendorService _vendorService;

        public VendorController(IVendorService vendorService)
        {
            _vendorService = vendorService;
        }

        // Vendor register (authenticated user vendor )
        [HttpPost("register")]
        [Authorize]
        public async Task<IActionResult> RegisterVendor([FromBody] VendorRegisterDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            try
            {
                var vendor = await _vendorService.RegisterVendorAsync(dto, userId);
                return Ok(vendor);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        // Pending vendors (Admin only)
        [HttpGet("pending")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetPendingVendors()
        {
            var vendors = await _vendorService.GetPendingVendorsAsync();
            return Ok(vendors);
        }

        // Approve vendor (Admin only)
        [HttpPost("{vendorId}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveVendor(int vendorId)
        {
            await _vendorService.ApproveVendorAsync(vendorId);
            return Ok(new { Message = "Vendor approved successfully" });
        }

        // Reject vendor (Admin only)
        [HttpPost("{vendorId}/reject")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RejectVendor(int vendorId)
        {
            await _vendorService.RejectVendorAsync(vendorId);
            return Ok(new { Message = "Vendor rejected and removed" });
        }

        // Get vendor profile (Vendor himself)
        [HttpGet("me")]
        [Authorize(Roles = "Vendor")]
        public async Task<IActionResult> GetMyVendorProfile()
        {
            //var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized();

            var userId = int.Parse(userIdClaim);

            var vendor = await _vendorService.GetVendorByUserIdAsync(userId);
            if (vendor == null)
                return NotFound(new { Error = "Vendor profile not found" });

            return Ok(vendor);
        }
    }
}