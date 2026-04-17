using AutoMapper;
using OnlineBookShop.Server.DTOs;
using OnlineBookShop.Server.Models;
using System.Linq;

namespace OnlineBookShop.Server.Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // --- User mappings ---
            CreateMap<UserRegisterDto, AppUser>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email));

            CreateMap<AppUser, UserResponseDto>()
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.ToString()));

            ////new added
            //// --- User mappings ---
            //CreateMap<UserRegisterDto, AppUser>()
            //    .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email));

            //CreateMap<AppUser, UserResponseDto>()
            //    .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.Id))
            //    .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.ToString()));

            // UpdateProfileDto → AppUser
            CreateMap<UpdateProfileDto, AppUser>()
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));



            // --- Vendor mappings ---
            CreateMap<VendorRegisterDto, Vendor>();
            CreateMap<Vendor, VendorResponseDto>();

            // --- Book mappings ---
            CreateMap<BookCreateDto, Book>();
            CreateMap<BookUpdateDto, Book>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
            CreateMap<Book, BookResponseDto>();

            // --- Order mappings ---

            CreateMap<Order, OrderResponseDto>()
                .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.OrderItems))
                 .ForMember(dest => dest.Address, opt => opt.MapFrom(src => src.Address));

            CreateMap<OrderItem, OrderItemResponseDto>();
            CreateMap<OrderCreateDto, Order>();
            CreateMap<OrderItemCreateDto, OrderItem>();

            // --- Address mappings ---
            CreateMap<AddressCreateDto, Address>();
            CreateMap<AddressUpdateDto, Address>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
            CreateMap<Address, AddressResponseDto>();

            // --- Category mappings ---
            CreateMap<CategoryCreateDto, Category>();
            CreateMap<Category, CategoryResponseDto>();

            // Cart → CartResponseDto
            CreateMap<Cart, CartResponseDto>()
                .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.CartItems))
                .ForMember(dest => dest.TotalAmount, opt => opt.MapFrom(src => 
                src.CartItems.Sum(ci => ci.Quantity * ci.Book.Price)));

            CreateMap<CartItem, CartItemResponseDto>()
                .ForMember(dest => dest.BookTitle, opt => opt.MapFrom(src => src.Book.Title))
                .ForMember(dest => dest.BookPrice, opt => opt.MapFrom(src => src.Book.Price))
                .ForMember(dest => dest.Subtotal, opt => opt.MapFrom(src => src.Quantity * src.Book.Price));

            // --- Review mappings ---
            CreateMap<ReviewCreateDto, Review>();
            CreateMap<Review, ReviewResponseDto>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.AppUser.UserName));

            // --- StockHistory mappings ---
            CreateMap<StockHistory, StockHistoryResponseDto>()
            .ForMember(dest => dest.BookTitle, opt => opt.MapFrom(src => src.Book.Title));

            // --- OrderStatusHistory mappings ---
            CreateMap<OrderStatusHistory, OrderStatusHistoryResponseDto>()
             .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));


            // Wishlist ↔ WishlistResponseDto
            CreateMap<Wishlist, WishlistResponseDto>()
                .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.WishlistItems));

            CreateMap<WishlistItem, WishlistItemResponseDto>()
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Book.Title))
                .ForMember(dest => dest.CoverImageUrl, opt => opt.MapFrom(src => src.Book.ImageUrl));

        }
    }
}