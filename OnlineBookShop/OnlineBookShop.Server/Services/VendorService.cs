// =============================================
// VendorService.cs —
// =============================================

using AutoMapper;
using Microsoft.AspNetCore.Identity;
using OnlineBookShop.Server.DTOs;
using OnlineBookShop.Server.Interfaces;
using OnlineBookShop.Server.Models;

namespace OnlineBookShop.Server.Services
{
    public class VendorService : IVendorService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly UserManager<AppUser> _userManager;

        public VendorService(IUnitOfWork unitOfWork, IMapper mapper, UserManager<AppUser> userManager)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _userManager = userManager;
        }

        // ── Vendor Register ──
        public async Task<VendorResponseDto> RegisterVendorAsync(VendorRegisterDto dto, int userId)
        {
            var existing = await _unitOfWork.Repository<Vendor>()
                .GetFirstOrDefaultAsync(v => v.UserId == userId);

            if (existing != null)
                throw new InvalidOperationException("User is already registered as a vendor");

            var vendor = _mapper.Map<Vendor>(dto);
            vendor.UserId = userId;
            vendor.IsApproved = false;

            _unitOfWork.Repository<Vendor>().Add(vendor);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<VendorResponseDto>(vendor);
        }

        // ── Get Vendor by UserId ──
        public async Task<VendorResponseDto?> GetVendorByUserIdAsync(int userId)
        {
            var vendor = await _unitOfWork.Repository<Vendor>()
                .GetFirstOrDefaultAsync(v => v.UserId == userId);

            return vendor == null ? null : _mapper.Map<VendorResponseDto>(vendor);
        }

        // ── Get Pending Vendors ──
        public async Task<List<VendorResponseDto>> GetPendingVendorsAsync()
        {
            var pending = await _unitOfWork.Repository<Vendor>()
                .FindAsync(v => !v.IsApproved);

            return _mapper.Map<List<VendorResponseDto>>(pending);
        }

        // ── Approve Vendor ──
        public async Task ApproveVendorAsync(int vendorId)
        {
            var vendor = await _unitOfWork.Repository<Vendor>()
                .GetByIdAsync(vendorId)
                ?? throw new KeyNotFoundException("Vendor not found");

            vendor.IsApproved = true;
            _unitOfWork.Repository<Vendor>().Update(vendor);

            var user = await _userManager.FindByIdAsync(vendor.UserId.ToString());
            if (user != null)
            {
               
                user.Role = AppUserRole.Vendor;
                await _userManager.UpdateAsync(user);
                if (!await _userManager.IsInRoleAsync(user, "Vendor"))
                    await _userManager.AddToRoleAsync(user, "Vendor");

                if (await _userManager.IsInRoleAsync(user, "Customer"))
                    await _userManager.RemoveFromRoleAsync(user, "Customer");
            }

            await _unitOfWork.SaveChangesAsync();
        }

        // ── Reject Vendor ──
        public async Task RejectVendorAsync(int vendorId)
        {
            var vendor = await _unitOfWork.Repository<Vendor>()
                .GetByIdAsync(vendorId)
                ?? throw new KeyNotFoundException("Vendor not found");

            var user = await _userManager.FindByIdAsync(vendor.UserId.ToString());
            if (user != null)
            {
                // ✅ Role Customer 
                user.Role = AppUserRole.Customer;
                await _userManager.UpdateAsync(user);

                // Identity role  revert 
                if (await _userManager.IsInRoleAsync(user, "Vendor"))
                    await _userManager.RemoveFromRoleAsync(user, "Vendor");

                if (!await _userManager.IsInRoleAsync(user, "Customer"))
                    await _userManager.AddToRoleAsync(user, "Customer");
            }

            _unitOfWork.Repository<Vendor>().Remove(vendor);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}