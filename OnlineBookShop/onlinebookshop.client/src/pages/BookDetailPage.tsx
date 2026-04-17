// =============================================
// BookDetailPage.tsx 
// =============================================

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/common/Navbar";
import ReviewSection from "../components/books/ReviewSection";
import BookService from "../services/book.service";
import CartService from "../services/cart.service";
import ReviewService from "../services/review.service";
import AuthService from "../services/auth.service";
import type { BookResponseDto } from "../types/book.types";
import type { ReviewResponseDto } from "../types/review.types";

const PLACEHOLDER_IMG = "https://placehold.co/400x550?text=No+Cover";

export default function BookDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [book, setBook] = useState<BookResponseDto | null>(null);
    const [reviews, setReviews] = useState<ReviewResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Cart state
    const [addingToCart, setAddingToCart] = useState(false);
    const [cartMessage, setCartMessage] = useState("");
    const [cartError, setCartError] = useState("");
    const [cartQuantity, setCartQuantity] = useState(0);

    // ── Fetch book + reviews ──
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            setError("");
            try {
                const [bookData, reviewsData] = await Promise.all([
                    BookService.getBookById(parseInt(id)),
                    ReviewService.getByBook(parseInt(id)),
                ]);
                setBook(bookData);
                setReviews(reviewsData);
            } catch (err: unknown) {
                if (axios.isAxiosError(err)) {
                    setError(err.response?.data?.message || "Book not found.");
                } else {
                    setError("Something went wrong.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // ── Fetch cart quantity ──
    useEffect(() => {
        if (!AuthService.isAuthenticated() || !id) return;
        const loadCartQty = async () => {
            try {
                const cart = await CartService.getMyCart();
                const item = cart.items.find((i) => i.bookId === parseInt(id));
                setCartQuantity(item?.quantity ?? 0);
            } catch {
                setCartQuantity(0);
            }
        };
        loadCartQty();
    }, [id]);

    // ── Add to Cart ──
    const handleAddToCart = async () => {
        if (!AuthService.isAuthenticated()) {
            navigate("/auth");
            return;
        }
        if (!book) return;

        setAddingToCart(true);
        setCartError("");
        setCartMessage("");
        try {
            await CartService.addItem({ bookId: book.bookId, quantity: 1 });
            setCartMessage("Book added to cart!");
            setCartQuantity((prev) => prev + 1);
            window.dispatchEvent(new Event("cartUpdated"));
            setTimeout(() => setCartMessage(""), 2500);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setCartError(err.response?.data?.message || "Failed to add to cart.");
            } else {
                setCartError("Something went wrong.");
            }
            setTimeout(() => setCartError(""), 3000);
        } finally {
            setAddingToCart(false);
        }
    };

    // ── Review handlers ──
    const handleReviewAdded = (review: ReviewResponseDto) => {
        setReviews((prev) => [review, ...prev]);
    };

    const handleReviewDeleted = (reviewId: number) => {
        setReviews((prev) => prev.filter((r) => r.reviewId !== reviewId));
    };

    // ── Computed values ──
    const avgRating =
        reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

    const isOutOfStock = book?.stock === 0;
    const isMaxedOut = book ? cartQuantity >= book.stock : false;

    // =============================================
    // RENDER
    // =============================================
    return (
        <>
            <Navbar />

            <div className="bg-light min-vh-100 py-4">
                <div className="container">

                    {/* Breadcrumb */}
                    <nav className="mb-4" aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <Link to="/" className="text-decoration-none">Home</Link>
                            </li>
                            <li className="breadcrumb-item active">
                                {loading ? "Loading..." : book?.title ?? "Book Detail"}
                            </li>
                        </ol>
                    </nav>

                    {/* Loading */}
                    {loading && (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} />
                            <p className="text-muted mt-3">Loading book details...</p>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="alert alert-danger d-flex align-items-center gap-2">
                            <i className="bi bi-exclamation-triangle-fill"></i>
                            {error}
                            <Link to="/" className="btn btn-link btn-sm ms-auto p-0">
                                Go back to Home
                            </Link>
                        </div>
                    )}

                    {/* Book Content */}
                    {!loading && book && (
                        <>
                            <div className="row g-5 mb-5">

                                {/* ── Left: Book Cover ── */}
                                <div className="col-lg-4 col-md-5">
                                    <div className="sticky-top" style={{ top: "80px" }}>

                                        {/* Cover Image */}
                                        <div className="card border-0 shadow rounded-3 overflow-hidden mb-3">
                                            <img
                                                src={book.imageUrl || PLACEHOLDER_IMG}
                                                alt={book.title}
                                                className="w-100"
                                                style={{ maxHeight: "480px", objectFit: "cover" }}
                                                onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMG)}
                                            />
                                        </div>

                                        {/* Cart Actions */}
                                        <div className="card border-0 shadow-sm rounded-3 p-3">

                                            {/* Price */}
                                            <div className="d-flex align-items-center justify-content-between mb-3">
                                                <span className="display-6 fw-bold text-success">
                                                    ৳ {book.price.toFixed(2)}
                                                </span>
                                                <span
                                                    className={`badge fs-6 ${isOutOfStock
                                                            ? "bg-danger"
                                                            : isMaxedOut
                                                                ? "bg-secondary"
                                                                : "bg-success"
                                                        }`}
                                                >
                                                    {isOutOfStock
                                                        ? "Out of Stock"
                                                        : isMaxedOut
                                                            ? "Max Added"
                                                            : `${book.stock} in stock`}
                                                </span>
                                            </div>

                                            {/* Cart message */}
                                            {cartMessage && (
                                                <div className="alert alert-success py-2 small mb-3 d-flex align-items-center gap-2">
                                                    <i className="bi bi-check-circle-fill"></i>
                                                    {cartMessage}
                                                </div>
                                            )}
                                            {cartError && (
                                                <div className="alert alert-danger py-2 small mb-3">
                                                    {cartError}
                                                </div>
                                            )}

                                            {/* Cart quantity indicator */}
                                            {cartQuantity > 0 && (
                                                <div className="alert alert-light border py-2 small mb-3 d-flex align-items-center gap-2">
                                                    <i className="bi bi-cart-check text-success"></i>
                                                    <span>{cartQuantity} in your cart</span>
                                                    <Link to="/cart" className="ms-auto btn btn-link btn-sm p-0 text-decoration-none">
                                                        View Cart →
                                                    </Link>
                                                </div>
                                            )}

                                            {/* Add to Cart Button */}
                                            <button
                                                className={`btn w-100 fw-bold py-2 mb-2 ${isMaxedOut && !isOutOfStock ? "btn-secondary" : "btn-primary"
                                                    }`}
                                                onClick={handleAddToCart}
                                                disabled={isOutOfStock || addingToCart || isMaxedOut}
                                            >
                                                {addingToCart ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" />
                                                        Adding...
                                                    </>
                                                ) : isOutOfStock ? (
                                                    <>
                                                        <i className="bi bi-x-circle me-2"></i>
                                                        Out of Stock
                                                    </>
                                                ) : isMaxedOut ? (
                                                    <>
                                                        <i className="bi bi-check-circle me-2"></i>
                                                        In Cart ({cartQuantity})
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-cart-plus me-2"></i>
                                                        Add to Cart
                                                    </>
                                                )}
                                            </button>

                                            {/* View Cart Button */}
                                            {cartQuantity > 0 && (
                                                <Link to="/cart" className="btn btn-outline-success w-100 fw-semibold">
                                                    <i className="bi bi-cart3 me-2"></i>
                                                    Go to Cart
                                                </Link>
                                            )}

                                        </div>
                                    </div>
                                </div>

                                {/* ── Right: Book Details ── */}
                                <div className="col-lg-8 col-md-7">

                                    {/* Title */}
                                    <h1 className="fw-bold mb-2" style={{ lineHeight: 1.2 }}>
                                        {book.title}
                                    </h1>

                                    {/* Author */}
                                    <p className="text-muted fs-5 mb-3">
                                        <i className="bi bi-person me-2"></i>
                                        by <span className="fw-semibold text-dark">{book.author}</span>
                                    </p>

                                    {/* Rating Summary */}
                                    {reviews.length > 0 && (
                                        <div className="d-flex align-items-center gap-2 mb-3">
                                            <div className="d-flex gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <i
                                                        key={star}
                                                        className={`bi ${star <= Math.round(avgRating)
                                                                ? "bi-star-fill text-warning"
                                                                : "bi-star text-muted"
                                                            }`}
                                                        style={{ fontSize: "16px" }}
                                                    />
                                                ))}
                                            </div>
                                            <span className="fw-semibold">{avgRating.toFixed(1)}</span>
                                            <span className="text-muted small">({reviews.length} reviews)</span>
                                        </div>
                                    )}

                                    {/* Meta info */}
                                    <div className="row g-2 mb-4">
                                        <div className="col-auto">
                                            <span className="badge bg-primary-subtle text-primary-emphasis px-3 py-2">
                                                <i className="bi bi-tag me-1"></i>
                                                Category #{book.categoryId}
                                            </span>
                                        </div>
                                        <div className="col-auto">
                                            <span className="badge bg-secondary-subtle text-secondary-emphasis px-3 py-2">
                                                <i className="bi bi-shop me-1"></i>
                                                Vendor #{book.vendorId}
                                            </span>
                                        </div>
                                        <div className="col-auto">
                                            <span className="badge bg-light text-muted border px-3 py-2">
                                                <i className="bi bi-calendar me-1"></i>
                                                {new Date(book.createdAt).toLocaleDateString("en-GB", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {book.description && (
                                        <div className="mb-4">
                                            <h5 className="fw-bold mb-3">About this book</h5>
                                            <p className="text-muted lh-lg">{book.description}</p>
                                        </div>
                                    )}

                                    {/* Divider */}
                                    <hr className="my-4" />

                                    {/* Reviews Section */}
                                    <ReviewSection
                                        bookId={book.bookId}
                                        reviews={reviews}
                                        onReviewAdded={handleReviewAdded}
                                        onReviewDeleted={handleReviewDeleted}
                                    />

                                </div>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </>
    );
}