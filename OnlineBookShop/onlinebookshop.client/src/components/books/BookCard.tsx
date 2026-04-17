// =============================================
// BookCard.tsx — Fixed: cartQuantity prop added
// =============================================

import { Link } from "react-router-dom";
import type { BookResponseDto } from "../../types/book.types";

interface Props {
    book: BookResponseDto;
    onAddToCart: (bookId: number) => void;
    onAddToWishlist: (bookId: number) => void;
    addingToCart?: boolean;
    cartQuantity?: number; 
}

const PLACEHOLDER_IMG = "https://placehold.co/300x400?text=No+Cover";

export default function BookCard({
    book,
    onAddToCart,
    onAddToWishlist,
    addingToCart = false,
    cartQuantity = 0,
}: Props) {
    const isOutOfStock = book.stock === 0;
    const isMaxedOut = cartQuantity >= book.stock; 

    return (
        <div className="card h-100 shadow-sm border-0 rounded-3 overflow-hidden">

            {/* Cover Image */}
            <div
                className="position-relative"
                style={{ height: "220px", overflow: "hidden", background: "#f8f9fa" }}
            >
                <img
                    src={book.imageUrl || PLACEHOLDER_IMG}
                    alt={book.title}
                    className="w-100 h-100"
                    style={{ objectFit: "cover", transition: "transform 0.3s ease" }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMG)}
                />

                {/* Out of Stock Overlay */}
                {isOutOfStock && (
                    <div
                        className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                        style={{ background: "rgba(0,0,0,0.55)" }}
                    >
                        <span className="badge bg-danger fs-6 px-3 py-2">Out of Stock</span>
                    </div>
                )}

                {/* Wishlist Button */}
                <button
                    className="btn btn-light btn-sm position-absolute top-0 end-0 m-2 rounded-circle p-1 shadow-sm"
                    style={{ width: "34px", height: "34px" }}
                    onClick={() => onAddToWishlist(book.bookId)}
                    title="Add to Wishlist"
                >
                    <i className="bi bi-heart text-danger"></i>
                </button>

                {/* Low Stock Badge */}
                {book.stock > 0 && book.stock <= 5 && !isMaxedOut && (
                    <span className="badge bg-warning text-dark position-absolute bottom-0 start-0 m-2">
                        Only {book.stock} left!
                    </span>
                )}

                {/* In Cart Badge */}
                {cartQuantity > 0 && (
                    <span className="badge bg-success position-absolute bottom-0 end-0 m-2">
                        <i className="bi bi-cart-check me-1"></i>
                        {cartQuantity} in cart
                    </span>
                )}
            </div>

            {/* Card Body */}
            <div className="card-body d-flex flex-column p-3">

                <h6 className="card-title fw-bold mb-1 text-truncate" title={book.title}>
                    {book.title}
                </h6>

                <p className="text-muted small mb-2">
                    <i className="bi bi-person me-1"></i>
                    {book.author}
                </p>

                <div className="d-flex align-items-center justify-content-between mb-3 mt-auto">
                    <span className="fs-5 fw-bold text-success">
                        ৳ {book.price.toFixed(2)}
                    </span>
                    <span
                        className={`badge ${isOutOfStock
                                ? "bg-danger"
                                : isMaxedOut
                                    ? "bg-secondary"
                                    : "bg-success-subtle text-success-emphasis"
                            }`}
                    >
                        {isOutOfStock
                            ? "Unavailable"
                            : isMaxedOut
                                ? "Max Added"
                                : `${book.stock} in stock`}
                    </span>
                </div>

                {/* Buttons */}
                <div className="d-flex gap-2">
                    <button
                        className={`btn btn-sm flex-fill fw-semibold ${isMaxedOut && !isOutOfStock ? "btn-secondary" : "btn-primary"
                            }`}
                        disabled={isOutOfStock || addingToCart || isMaxedOut}
                        onClick={() => onAddToCart(book.bookId)}
                    >
                        {addingToCart ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-1" />
                                Adding...
                            </>
                        ) : isOutOfStock ? (
                            <>
                                <i className="bi bi-x-circle me-1"></i>
                                Out of Stock
                            </>
                        ) : isMaxedOut ? (
                            <>
                                <i className="bi bi-check-circle me-1"></i>
                                In Cart ({cartQuantity})
                            </>
                        ) : (
                            <>
                                <i className="bi bi-cart-plus me-1"></i>
                                Add to Cart
                            </>
                        )}
                    </button>
                    <Link
                        to={`/books/${book.bookId}`}
                        className="btn btn-outline-secondary btn-sm"
                        title="View Details"
                    >
                        <i className="bi bi-eye"></i>
                    </Link>
                </div>

            </div>
        </div>
    );
}