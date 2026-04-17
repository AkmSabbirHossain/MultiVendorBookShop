using OnlineBookShop.Server.DTOs;

namespace OnlineBookShop.Server.Interfaces
{
    public interface IVendorService
    {
        Task<VendorResponseDto> RegisterVendorAsync(VendorRegisterDto dto, int userId);
        Task<VendorResponseDto?> GetVendorByUserIdAsync(int userId);
        Task ApproveVendorAsync(int vendorId);
        Task RejectVendorAsync(int vendorId);
        Task<List<VendorResponseDto>> GetPendingVendorsAsync();
      
    }
}
